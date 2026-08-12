import os
import datetime
import pandas as pd
import numpy as np
from supabase import create_client, Client
from dotenv import load_dotenv

# Machine Learning Libraries
from statsmodels.tsa.arima.model import ARIMA
import xgboost as xgb
from sklearn.metrics import mean_squared_error
import warnings

# Suppress statsmodels warnings for cleaner action logs
warnings.filterwarnings("ignore")

# Load environment variables
load_dotenv()

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("Missing Supabase credentials in environment variables.")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

CROPS = ["tomato", "onion", "potato", "brinjal"]
REGIONS = ["national", "tn"]

# Define which model to use for which crop (matching UI metadata)
MODEL_MAPPING = {
    "tomato": "xgboost",
    "onion": "arima",
    "potato": "arima",
    "brinjal": "xgboost"
}

def train_arima(series, steps=28):
    """Trains an ARIMA model and forecasts `steps` ahead."""
    try:
        # Simple auto-regressive model configuration (p=5, d=1, q=0) for daily data
        model = ARIMA(series, order=(5, 1, 0))
        model_fit = model.fit()
        
        # We need confidence intervals too (lo, hi). Statsmodels provides this via get_forecast()
        forecast_obj = model_fit.get_forecast(steps=steps)
        conf_int = forecast_obj.conf_int(alpha=0.05) # 95% confidence interval
        
        return forecast_obj.predicted_mean.values, conf_int.iloc[:, 0].values, conf_int.iloc[:, 1].values
    except Exception as e:
        print(f"ARIMA training failed: {e}")
        return None, None, None

def train_xgboost(series, steps=28):
    """Trains an XGBoost model using lagged features and forecasts `steps` ahead."""
    try:
        # Create lag features
        df = pd.DataFrame({'price': series})
        for i in range(1, 8): # Use past 7 days as features
            df[f'lag_{i}'] = df['price'].shift(i)
            
        df = df.dropna()
        if len(df) < 10:
            raise ValueError("Not enough data to train XGBoost (need at least 10 days)")
            
        X = df.drop('price', axis=1)
        y = df['price']
        
        # Train model
        model = xgb.XGBRegressor(objective='reg:squarederror', n_estimators=50, max_depth=3)
        model.fit(X, y)
        
        # Forecast iteratively
        predictions = []
        last_features = X.iloc[-1].values.tolist()
        
        # We need an estimate of variance for the confidence interval.
        # Calculate the RMSE on the training set.
        train_preds = model.predict(X)
        rmse = np.sqrt(mean_squared_error(y, train_preds))
        
        for _ in range(steps):
            # Predict next day
            pred = model.predict(np.array([last_features]))[0]
            predictions.append(pred)
            
            # Update lag features for next step (shift right, insert new pred at start)
            last_features = [pred] + last_features[:-1]
            
        preds = np.array(predictions)
        
        # Construct simple confidence bounds based on training RMSE
        # Expanding variance as we go further into the future (uncertainty grows)
        expanding_variance = rmse * np.sqrt(np.arange(1, steps + 1))
        lo = preds - (1.96 * expanding_variance)
        hi = preds + (1.96 * expanding_variance)
        
        return preds, lo, hi
    except Exception as e:
        print(f"XGBoost training failed: {e}")
        return None, None, None

def run_ml_forecast(commodity: str, region: str, historical_data: list):
    """
    Trains a model on historical_data and predicts the next 28 days.
    """
    print(f"Running ML models for {commodity} in {region}...")
    
    if not historical_data:
        print("No historical data found. Skipping.")
        return []
        
    # Process historical data into a pandas Series
    # Supabase data is ordered newest first, we reverse it to chronological order
    df = pd.DataFrame(historical_data)
    df['date'] = pd.to_datetime(df['date'])
    df = df.sort_values('date')
    series = df['price'].values
    
    steps = 28
    
    # Cold start fallback: If we have less than 14 days of data, use a naive forecast
    if len(series) < 14:
        print(f"Cold start fallback triggered for {commodity}. Only {len(series)} days available.")
        last_price = series[-1]
        preds = np.full(steps, last_price)
        lo = preds - 100
        hi = preds + 100
    else:
        model_type = MODEL_MAPPING.get(commodity, "arima")
        
        if model_type == "arima":
            preds, lo, hi = train_arima(series, steps)
        else:
            preds, lo, hi = train_xgboost(series, steps)
            
        # Fallback if model training failed entirely
        if preds is None:
            last_price = series[-1]
            preds = np.full(steps, last_price)
            lo = preds - 100
            hi = preds + 100

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
        
        # Don't let bounds cross each other weirdly due to volatility
        if forecast[-1]['lo'] > forecast[-1]['p']: forecast[-1]['lo'] = forecast[-1]['p']
        if forecast[-1]['hi'] < forecast[-1]['p']: forecast[-1]['hi'] = forecast[-1]['p']
        
    return forecast

def main():
    print("Starting Weekly ML Prediction Run...")
    
    for region in REGIONS:
        for crop in CROPS:
            try:
                # 1. Fetch historical data to train the model
                # We fetch up to 90 days to provide a decent training window
                res = supabase.table('historical_prices')\
                    .select('*')\
                    .eq('commodity', crop)\
                    .eq('region', region)\
                    .order('date', desc=True)\
                    .limit(90)\
                    .execute()
                
                historical_data = res.data
                
                # 2. Run the ML forecast for the next 28 days
                forecast_data = run_ml_forecast(crop, region, historical_data)
                
                if forecast_data:
                    # 3. Upsert predictions into Supabase
                    # The UNIQUE(commodity, region, target_date) constraint ensures
                    # that overlapping days are gracefully updated.
                    supabase.table('predictions').upsert(forecast_data).execute()
                    print(f"Successfully upserted {len(forecast_data)} days of predictions for [{region.upper()}] {crop.capitalize()}.")
                
            except Exception as e:
                print(f"Failed to run predictions for {crop} in {region}: {str(e)}")

    print("Weekly ML Prediction Run completed successfully.")

if __name__ == "__main__":
    main()
