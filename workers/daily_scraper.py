import os
import datetime
import requests
import httpx
from supabase import create_client, Client
from dotenv import load_dotenv

# Patch httpx to disable SSL verification errors on local environment
_orig_httpx_init = httpx.Client.__init__
def _custom_httpx_init(self, *args, **kwargs):
    kwargs['verify'] = False
    _orig_httpx_init(self, *args, **kwargs)
httpx.Client.__init__ = _custom_httpx_init

# Load environment variables (will use GitHub Secrets in production)
load_dotenv()
load_dotenv(dotenv_path='Landing Page/.env.local')
load_dotenv(dotenv_path='../Landing Page/.env.local')

SUPABASE_URL = os.environ.get("SUPABASE_URL") or os.environ.get("VITE_SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY") or os.environ.get("VITE_SUPABASE_ANON_KEY")

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

def log_to_csv(records):
    if not records:
        return
    import csv
    log_dir = os.path.join(os.path.dirname(__file__), "logs")
    os.makedirs(log_dir, exist_ok=True)
    csv_file = os.path.join(log_dir, "daily_prices.csv")
    file_exists = os.path.exists(csv_file)
    with open(csv_file, mode="a", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=["date", "region", "commodity", "price"])
        if not file_exists:
            writer.writeheader()
        for r in records:
            writer.writerow(r)
    print(f"Logged {len(records)} records to {csv_file}")

def main():
    today = datetime.datetime.now().strftime("%Y-%m-%d")
    print(f"Starting daily price fetch for {today}")
    scraped_records = []
    
    for region in REGIONS:
        for crop in CROPS:
            record = {
                "date": today,
                "region": region,
                "commodity": crop,
                "price": None
            }
            try:
                # 1. Scrape/Fetch the price
                price = fetch_agmarknet_price(crop, region)
                print(f"[{region.upper()}] {crop.capitalize()}: Rs.{price}/Qtl")
                record["price"] = price
                scraped_records.append(record)
                
                # 2. Upsert into Supabase (historical_prices table)
                data, count = supabase.table('historical_prices').upsert({
                    "commodity": crop,
                    "region": region,
                    "date": today,
                    "price": price
                }).execute()
                
            except Exception as e:
                print(f"Failed to process {crop} in {region}: {str(e)}")

    log_to_csv(scraped_records)
    print("Daily fetch completed successfully.")

if __name__ == "__main__":
    main()
