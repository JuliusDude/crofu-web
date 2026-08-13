import os
import pandas as pd
import httpx
from supabase import create_client, Client
from dotenv import load_dotenv

# Patch httpx to disable SSL verification errors on local environment
_orig_httpx_init = httpx.Client.__init__
def _custom_httpx_init(self, *args, **kwargs):
    kwargs['verify'] = False
    _orig_httpx_init(self, *args, **kwargs)
httpx.Client.__init__ = _custom_httpx_init

# Load environment variables
load_dotenv(dotenv_path='../Landing Page/.env.local')

SUPABASE_URL = os.environ.get("VITE_SUPABASE_URL") or os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("VITE_SUPABASE_ANON_KEY") or os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

# For injections we MUST use the Service Role Key to bypass RLS, but if the user runs this locally
# and doesn't have it in .env.local, we can ask them to paste it here for a one-off run, 
# or ensure it's in the environment.
# Since this is a one-off script, let's look for SUPABASE_SERVICE_ROLE_KEY
SUPABASE_SERVICE_ROLE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
if not SUPABASE_SERVICE_ROLE_KEY:
    print("WARNING: SUPABASE_SERVICE_ROLE_KEY not found in env. Falling back to ANON key, but insertions might fail due to RLS.")
    SUPABASE_SERVICE_ROLE_KEY = SUPABASE_KEY

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

TNAU_DIR = r"F:\Project\TNAU\Data Sets\AGMARKET"
NATIONAL_DIR = os.path.join(TNAU_DIR, "NationalAVG")
TN_FILE = os.path.join(TNAU_DIR, "TN-DATAAVG", "TN-ModalPirce2126.csv")
if not os.path.exists(TN_FILE):
    # fallback to the main folder
    TN_FILE = os.path.join(TNAU_DIR, "TN-ModalPirce2126.csv")

def parse_date(date_str):
    try:
        return pd.to_datetime(date_str, format="%d-%m-%Y").strftime("%Y-%m-%d")
    except Exception:
        # Fallback to general parsing if formats are mixed
        return pd.to_datetime(date_str, dayfirst=True).strftime("%Y-%m-%d")

def process_national_data():
    files_map = {
        "tomato": "N_tomato21_26.csv",
        "onion": "N_onion21_26.csv",
        "potato": "N_potatoes21_26.csv",
        "brinjal": "N_brinjal21_26.csv"
    }
    
    records = []
    
    for commodity, filename in files_map.items():
        filepath = os.path.join(NATIONAL_DIR, filename)
        if not os.path.exists(filepath):
            print(f"File not found: {filepath}")
            continue
            
        print(f"Processing National data for {commodity}...")
        df = pd.read_csv(filepath)
        
        # Format: date, arrivals, price
        # Drop rows where price is missing
        df = df.dropna(subset=['price'])
        
        for _, row in df.iterrows():
            try:
                date_formatted = parse_date(row['date'])
                price = float(row['price'])
                
                records.append({
                    "commodity": commodity,
                    "region": "national",
                    "date": date_formatted,
                    "price": price
                })
            except Exception as e:
                pass # skip unparseable rows
                
    return records

def process_tn_data():
    records = []
    if not os.path.exists(TN_FILE):
        print(f"TN File not found: {TN_FILE}")
        return records
        
    print("Processing TN data...")
    # Skip the first row which is a title
    df = pd.read_csv(TN_FILE, skiprows=1)
    
    # Standardize column names
    price_col = [c for c in df.columns if 'Modal Price' in c][0]
    
    df = df.dropna(subset=[price_col, 'Commodity', 'Date'])
    
    # We need to average the price by Date and Commodity because TN has multiple records per day
    df['Date_Fmt'] = df['Date'].apply(lambda x: pd.to_datetime(str(x), dayfirst=True, errors='coerce'))
    df = df.dropna(subset=['Date_Fmt'])
    df['Date_Str'] = df['Date_Fmt'].dt.strftime("%Y-%m-%d")
    
    df['Commodity_Lower'] = df['Commodity'].str.lower().str.strip()
    
    # Map TNAU names to our standard names if needed
    name_mapping = {
        'brinjal': 'brinjal',
        'onion': 'onion',
        'potato': 'potato',
        'tomato': 'tomato'
    }
    
    avg_df = df.groupby(['Date_Str', 'Commodity_Lower'])[price_col].mean().reset_index()
    
    for _, row in avg_df.iterrows():
        comm = row['Commodity_Lower']
        if comm in name_mapping:
            records.append({
                "commodity": name_mapping[comm],
                "region": "tn",
                "date": row['Date_Str'],
                "price": float(row[price_col])
            })
            
    return records

def chunk_list(lst, n):
    for i in range(0, len(lst), n):
        yield lst[i:i + n]

def main():
    print("Starting Historical Data Injection...")
    
    national_records = process_national_data()
    tn_records = process_tn_data()
    
    all_records = national_records + tn_records
    print(f"Found {len(all_records)} total records to insert.")
    
    # Batch insert in chunks of 1000
    success_count = 0
    for chunk in chunk_list(all_records, 1000):
        try:
            # Upsert using unique constraint (commodity, region, date)
            res = supabase.table('historical_prices').upsert(chunk).execute()
            success_count += len(chunk)
            print(f"Inserted {success_count}/{len(all_records)} records...")
        except Exception as e:
            print(f"Error inserting chunk: {e}")
            
    print("Injection complete!")

if __name__ == "__main__":
    main()
