import os
import datetime
import requests
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables (will use GitHub Secrets in production)
load_dotenv()

SUPABASE_URL = os.environ.get("SUPABASE_URL")
# IMPORTANT: For backend scripts, we use the SERVICE_ROLE_KEY to bypass RLS for writing.
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("Missing Supabase credentials in environment variables.")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# The crops we are tracking
CROPS = ["tomato", "onion", "potato", "brinjal"]
REGIONS = ["national", "tn"]

def fetch_agmarknet_price(commodity: str, region: str) -> float:
    """
    Mock function to simulate fetching from Agmarknet.
    In a real scenario, you would use requests/BeautifulSoup to parse the Agmarknet gov portal 
    or call their API/XML endpoints.
    
    Example logic:
    url = "https://agmarknet.gov.in/SearchCmmMkt.aspx"
    payload = { 'commodity': commodity, 'state': region, ... }
    response = requests.post(url, data=payload)
    # Parse HTML table for Modal Price...
    """
    print(f"Fetching {commodity} price for {region} from Agmarknet...")
    
    # Placeholder logic to return a realistic mock price for demonstration
    base_prices = {
        "tomato": 2300,
        "onion": 1800,
        "potato": 1200,
        "brinjal": 1500
    }
    
    # Randomly fluctuate the price slightly for realism
    import random
    price = base_prices.get(commodity, 2000) + random.uniform(-50, 50)
    
    if region == "tn":
        price -= 150  # TN is typically a bit lower in our mock data
        
    return round(price, 2)

def main():
    today = datetime.datetime.now().strftime("%Y-%m-%d")
    print(f"Starting daily price fetch for {today}")
    
    for region in REGIONS:
        for crop in CROPS:
            try:
                # 1. Scrape/Fetch the price
                price = fetch_agmarknet_price(crop, region)
                print(f"[{region.upper()}] {crop.capitalize()}: ₹{price}/Qtl")
                
                # 2. Upsert into Supabase (historical_prices table)
                data, count = supabase.table('historical_prices').upsert({
                    "commodity": crop,
                    "region": region,
                    "date": today,
                    "price": price
                }).execute()
                
            except Exception as e:
                print(f"Failed to process {crop} in {region}: {str(e)}")

    print("Daily fetch completed successfully.")

if __name__ == "__main__":
    main()
