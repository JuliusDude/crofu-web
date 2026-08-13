import os
import datetime
import pandas as pd
import numpy as np
import joblib
import httpx
from supabase import create_client, Client
from dotenv import load_dotenv

# Patch httpx to disable SSL verification errors on local environment
_orig_httpx_init = httpx.Client.__init__
def _custom_httpx_init(self, *args, **kwargs):
    kwargs['verify'] = False
    _orig_httpx_init(self, *args, **kwargs)
httpx.Client.__init__ = _custom_httpx_init

# Machine Learning Libraries
from statsmodels.tsa.arima.model import ARIMA
import xgboost as xgb
from sklearn.metrics import mean_squared_error, mean_absolute_percentage_error
import warnings

warnings.filterwarnings("ignore")
load_dotenv()
load_dotenv(dotenv_path='Landing Page/.env.local')
load_dotenv(dotenv_path='../Landing Page/.env.local')

SUPABASE_URL = os.environ.get("SUPABASE_URL") or os.environ.get("VITE_SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY") or os.environ.get("VITE_SUPABASE_ANON_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("Missing Supabase credentials in environment variables.")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

CROPS = ["tomato", "onion", "potato", "brinjal"]
REGIONS = ["national", "tn"]

# Researched Best Model mapping per (Region, Commodity) pair
BEST_MODELS = {
    ("national", "tomato"): "xgboost",
    ("national", "onion"): "arima",
    ("national", "potato"): "arima",
    ("national", "brinjal"): "xgboost",
    ("tn", "tomato"): "xgboost",
    ("tn", "onion"): "arima",
    ("tn", "potato"): "arima",
    ("tn", "brinjal"): "xgboost",
}

def evaluate_metrics(y_true, y_pred):
    mse = mean_squared_error(y_true, y_pred)
    rmse = np.sqrt(mse)
    mape = mean_absolute_percentage_error(y_true, y_pred) * 100
    return mse, rmse, mape

def train_arima(series, steps=28, commodity=None, region=None):
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
        
        pred_mean = np.asarray(forecast_obj.predicted_mean)
        conf_lo = np.asarray(conf_int.iloc[:, 0]) if hasattr(conf_int, 'iloc') else np.asarray(conf_int[:, 0])
        conf_hi = np.asarray(conf_int.iloc[:, 1]) if hasattr(conf_int, 'iloc') else np.asarray(conf_int[:, 1])
        
        # Save retrained best model weights
        if commodity and region:
            reg_dir = "TN" if region.lower() == "tn" else "National"
            model_dir = os.path.join(os.path.dirname(__file__), f"models/{reg_dir}/{commodity}/ARIMA/models")
            os.makedirs(model_dir, exist_ok=True)
            joblib.dump(model, os.path.join(model_dir, f"best_arima_{region.lower()}.pkl"))
        
        return pred_mean, conf_lo, conf_hi, (mse, rmse, mape)
    except Exception as e:
        print(f"ARIMA training failed: {e}")
        return None, None, None, None

def train_xgboost(series, steps=28, commodity=None, region=None):
    try:
        reg_dir = "TN" if region.lower() == "tn" else "National"
        xgb_folder = "XGBoost-TN" if region.lower() == "tn" else "XGBoost"
        model_dir = os.path.join(os.path.dirname(__file__), f"models/{reg_dir}/{commodity}/{xgb_folder}/models")
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
            print(f"Loading pre-trained best model from {model_path}...")
            try:
                model = joblib.load(model_path)
                model.predict(X_val)
            except Exception as e:
                print(f"Pre-trained model feature mismatch, retraining... ({e})")
                model = None
                
        if model is None:
            model = xgb.XGBRegressor(objective='reg:squarederror', n_estimators=50, max_depth=3)
            
        # Fit/Retrain model on full data with same parameters
        model.fit(X, y)
        
        # Save retrained best model weights
        os.makedirs(model_dir, exist_ok=True)
        joblib.dump(model, model_path)
        
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
        model_type = BEST_MODELS.get((region.lower(), commodity.lower()), "arima")
        
        if model_type == "arima":
            preds, lo, hi, metrics = train_arima(series, steps, commodity, region)
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

def log_predictions_to_csv(forecast_list, execution_date):
    if not forecast_list:
        return
    import csv
    log_dir = os.path.join(os.path.dirname(__file__), "logs")
    os.makedirs(log_dir, exist_ok=True)
    csv_file = os.path.join(log_dir, "weekly_predictions.csv")
    file_exists = os.path.exists(csv_file)
    with open(csv_file, mode="a", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=["execution_date", "target_date", "region", "commodity", "predicted_price", "lower_bound", "upper_bound"])
        if not file_exists:
            writer.writeheader()
        for r in forecast_list:
            writer.writerow({
                "execution_date": execution_date,
                "target_date": r["target_date"],
                "region": r["region"],
                "commodity": r["commodity"],
                "predicted_price": r["p"],
                "lower_bound": r["lo"],
                "upper_bound": r["hi"]
            })
    print(f"Logged {len(forecast_list)} predictions to {csv_file}")

def log_metrics_to_csv(metrics_list):
    if not metrics_list:
        return
    import csv
    log_dir = os.path.join(os.path.dirname(__file__), "logs")
    os.makedirs(log_dir, exist_ok=True)
    csv_file = os.path.join(log_dir, "weekly_metrics.csv")
    file_exists = os.path.exists(csv_file)
    with open(csv_file, mode="a", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=["training_date", "region", "commodity", "model_type", "mse", "rmse", "mape"])
        if not file_exists:
            writer.writeheader()
        for r in metrics_list:
            writer.writerow(r)
    print(f"Logged {len(metrics_list)} metrics to {csv_file}")

def main():
    print("Starting Weekly ML Prediction Run with Evaluation...")
    today = datetime.datetime.now().strftime("%Y-%m-%d")
    all_forecasts = []
    all_metrics = []
    
    for region in REGIONS:
        for crop in CROPS:
            try:
                res = supabase.table('historical_prices')\
                    .select('*')\
                    .eq('commodity', crop)\
                    .eq('region', region)\
                    .order('date', desc=True)\
                    .execute()
                
                historical_data = res.data
                
                # 2. Run the ML forecast AND get evaluation metrics
                forecast_data, metrics = run_ml_forecast(crop, region, historical_data)
                
                if forecast_data:
                    all_forecasts.extend(forecast_data)
                    try:
                        supabase.table('predictions').upsert(forecast_data).execute()
                        print(f"Upserted 28 days of predictions for [{region.upper()}] {crop.capitalize()}.")
                    except Exception as err:
                        print(f"Supabase upsert note: {err}")
                    
                if metrics and metrics[0] != 0.0:
                    mse, rmse, mape = metrics
                    model_type = BEST_MODELS.get((region.lower(), crop.lower()), "arima")
                    
                    metric_data = {
                        "commodity": crop,
                        "region": region,
                        "training_date": today,
                        "model_type": model_type,
                        "mse": float(mse),
                        "rmse": float(rmse),
                        "mape": float(mape)
                    }
                    all_metrics.append(metric_data)
                    try:
                        supabase.table('model_metrics').upsert([metric_data]).execute()
                        print(f"Logged evaluation metrics for {crop} (RMSE: {rmse:.2f})")
                    except Exception as err:
                        print(f"Supabase metrics note: {err}")
                
            except Exception as e:
                print(f"Failed to process {crop} in {region}: {str(e)}")

    log_predictions_to_csv(all_forecasts, today)
    log_metrics_to_csv(all_metrics)
    print("Weekly ML Prediction Run completed successfully.")

if __name__ == "__main__":
    main()
