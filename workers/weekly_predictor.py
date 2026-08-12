import os
import datetime
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("Missing Supabase credentials in environment variables.")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

CROPS = ["tomato", "onion", "potato", "brinjal"]
REGIONS = ["national", "tn"]

def run_ml_forecast(commodity: str, region: str, historical_data: list):
    """
    Mock function to simulate a heavy ML training and prediction run.
    In production, you would pass historical_data into XGBoost, ARIMA, or LSTM
    to predict the next 28 days of prices.
    """
    print(f"Running ML models for {commodity} in {region}...")
    
    # We will generate a mock 28-day forecast
    # Base it on the most recent historical price, or a fallback
    last_price = 2000
    if historical_data and len(historical_data) > 0:
        last_price = historical_data[0]['price'] # Assuming ordered newest first

    import random
    forecast = []
    
    # The week 0 vs week 1 overlap:
    # We predict 28 days into the future starting tomorrow.
    today = datetime.datetime.now()
    
    current_price = last_price
    for day_offset in range(1, 29):
        target_date = (today + datetime.timedelta(days=day_offset)).strftime("%Y-%m-%d")
        
        # Simulate an upward/downward trend
        trend = random.uniform(-10, 15) 
        current_price += trend
        
        # Confidence interval
        variance = random.uniform(30, 80) + (day_offset * 1.5)
        
        forecast.append({
            "commodity": commodity,
            "region": region,
            "target_date": target_date,
            "p": round(current_price, 2),
            "lo": round(current_price - variance, 2),
            "hi": round(current_price + variance, 2)
        })
        
    return forecast

def main():
    print("Starting Weekly ML Prediction Run...")
    
    for region in REGIONS:
        for crop in CROPS:
            try:
                # 1. Fetch historical data to train the model
                # In production you might fetch all data, or last 1 year.
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
                
                # 3. Upsert predictions into Supabase
                # The UNIQUE(commodity, region, target_date) constraint ensures
                # that overlapping days are gracefully updated with the freshest predictions!
                upsert_res = supabase.table('predictions').upsert(forecast_data).execute()
                
                print(f"Successfully upserted {len(forecast_data)} days of predictions for [{region.upper()}] {crop.capitalize()}.")
                
            except Exception as e:
                print(f"Failed to run predictions for {crop} in {region}: {str(e)}")

    print("Weekly ML Prediction Run completed successfully.")

if __name__ == "__main__":
    main()
