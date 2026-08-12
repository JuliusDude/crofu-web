import os
import datetime
import pandas as pd
import numpy as np
import joblib
from supabase import create_client, Client
from dotenv import load_dotenv

# Machine Learning Libraries
from statsmodels.tsa.arima.model import ARIMA
import xgboost as xgb
from sklearn.metrics import mean_squared_error, mean_absolute_percentage_error
import warnings

warnings.filterwarnings("ignore")
load_dotenv()

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("Missing Supabase credentials in environment variables.")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

CROPS = ["tomato", "onion", "potato", "brinjal"]
REGIONS = ["national", "tn"]

MODEL_MAPPING = {
    "tomato": "xgboost",
    "onion": "arima",
    "potato": "arima",
    "brinjal": "xgboost"
}

def evaluate_metrics(y_true, y_pred):
    mse = mean_squared_error(y_true, y_pred)
    rmse = np.sqrt(mse)
    mape = mean_absolute_percentage_error(y_true, y_pred) * 100
    return mse, rmse, mape

def train_arima(series, steps=28):
    # Train-test split for metrics evaluation (last 14 days as validation)
    train, val = series[:-14], series[-14:]
    
    try:
        # Evaluate model on val set first to get metrics
        eval_model = ARIMA(train, order=(5, 1, 0)).fit()
        val_preds = eval_model.forecast(steps=14)
        mse, rmse, mape = evaluate_metrics(val, val_preds)
        
        # Now train on full data for future prediction
        model = ARIMA(series, order=(5, 1, 0)).fit()
        forecast_obj = model.get_forecast(steps=steps)
        conf_int = forecast_obj.conf_int(alpha=0.05)
        
        return forecast_obj.predicted_mean.values, conf_int.iloc[:, 0].values, conf_int.iloc[:, 1].values, (mse, rmse, mape)
    except Exception as e:
        print(f"ARIMA training failed: {e}")
        return None, None, None, None

def train_xgboost(series, steps=28, commodity=None, region=None):
    try:
        # Check if pre-trained TNAU model exists
        model_dir = f"models/{region.capitalize()}/{commodity}/XGBoost/models/"
        model_path = os.path.join(model_dir, "best_xgb.pkl")
        
        df = pd.DataFrame({'price': series})
        for i in range(1, 8): df[f'lag_{i}'] = df['price'].shift(i)
        df = df.dropna()
        
        if len(df) < 20:
            raise ValueError("Not enough data to train/evaluate XGBoost")
            
        X = df.drop('price', axis=1)
        y = df['price']
        
        # Validation split for metrics
        X_train, X_val = X.iloc[:-14], X.iloc[-14:]
        y_train, y_val = y.iloc[:-14], y.iloc[-14:]
        
        model = None
        if os.path.exists(model_path):
            print(f"Loading pre-trained model from {model_path}...")
            try:
                model = joblib.load(model_path)
                # Attempt to use it. If features mismatch, it will throw an exception
                model.predict(X_val)
            except Exception as e:
                print(f"Pre-trained model feature mismatch, retraining... ({e})")
                model = None
                
        if model is None:
            model = xgb.XGBRegressor(objective='reg:squarederror', n_estimators=50, max_depth=3)
            
        # Fit/Update model on full data
        model.fit(X, y)
        
        # Get evaluation metrics on the validation slice
        val_preds = model.predict(X_val)
        mse, rmse, mape = evaluate_metrics(y_val, val_preds)
        
        predictions = []
        last_features = X.iloc[-1].values.tolist()
        
        train_preds = model.predict(X)
        overall_rmse = np.sqrt(mean_squared_error(y, train_preds))
        
        for _ in range(steps):
            pred = model.predict(np.array([last_features]))[0]
            predictions.append(pred)
            last_features = [pred] + last_features[:-1]
            
        preds = np.array(predictions)
        expanding_variance = overall_rmse * np.sqrt(np.arange(1, steps + 1))
        lo = preds - (1.96 * expanding_variance)
        hi = preds + (1.96 * expanding_variance)
        
        return preds, lo, hi, (mse, rmse, mape)
    except Exception as e:
        print(f"XGBoost training failed: {e}")
        return None, None, None, None

def run_ml_forecast(commodity: str, region: str, historical_data: list):
    print(f"Running ML models for {commodity} in {region}...")
    
    if not historical_data: return [], None
        
    df = pd.DataFrame(historical_data)
    df['date'] = pd.to_datetime(df['date'])
    df = df.sort_values('date')
    series = df['price'].values
    
    steps = 28
    metrics = None
    
    if len(series) < 20:
        print(f"Cold start fallback triggered for {commodity}.")
        last_price = series[-1]
        preds = np.full(steps, last_price)
        lo, hi = preds - 100, preds + 100
        metrics = (0.0, 0.0, 0.0) # Dummy metrics for naive fallback
    else:
        model_type = MODEL_MAPPING.get(commodity, "arima")
        
        if model_type == "arima":
            preds, lo, hi, metrics = train_arima(series, steps)
        else:
            preds, lo, hi, metrics = train_xgboost(series, steps, commodity, region)
            
        if preds is None:
            last_price = series[-1]
            preds = np.full(steps, last_price)
            lo, hi = preds - 100, preds + 100
            metrics = (0.0, 0.0, 0.0)

    forecast = []
    today = datetime.datetime.now()
    
    for i in range(steps):
        target_date = (today + datetime.timedelta(days=i+1)).strftime("%Y-%m-%d")
        forecast.append({
            "commodity": commodity,
            "region": region,
            "target_date": target_date,
            "p": round(float(preds[i]), 2),
            "lo": round(float(lo[i]), 2),
            "hi": round(float(hi[i]), 2)
        })
        if forecast[-1]['lo'] > forecast[-1]['p']: forecast[-1]['lo'] = forecast[-1]['p']
        if forecast[-1]['hi'] < forecast[-1]['p']: forecast[-1]['hi'] = forecast[-1]['p']
        
    return forecast, metrics

def main():
    print("Starting Weekly ML Prediction Run with Evaluation...")
    today = datetime.datetime.now().strftime("%Y-%m-%d")
    
    for region in REGIONS:
        for crop in CROPS:
            try:
                res = supabase.table('historical_prices')\
                    .select('*')\
                    .eq('commodity', crop)\
                    .eq('region', region)\
                    .order('date', desc=True)\
                    .limit(365)\
                    .execute()
                
                historical_data = res.data
                
                # 2. Run the ML forecast AND get evaluation metrics
                forecast_data, metrics = run_ml_forecast(crop, region, historical_data)
                
                if forecast_data:
                    supabase.table('predictions').upsert(forecast_data).execute()
                    print(f"Upserted 28 days of predictions for [{region.upper()}] {crop.capitalize()}.")
                    
                if metrics and metrics[0] != 0.0:
                    mse, rmse, mape = metrics
                    model_type = MODEL_MAPPING.get(crop, "arima")
                    
                    metric_data = {
                        "commodity": crop,
                        "region": region,
                        "training_date": today,
                        "model_type": model_type,
                        "mse": float(mse),
                        "rmse": float(rmse),
                        "mape": float(mape)
                    }
                    supabase.table('model_metrics').upsert([metric_data]).execute()
                    print(f"Logged evaluation metrics for {crop} (RMSE: {rmse:.2f})")
                
            except Exception as e:
                print(f"Failed to process {crop} in {region}: {str(e)}")

    print("Weekly ML Prediction Run completed successfully.")

if __name__ == "__main__":
    main()
