import os
import streamlit as st
import pandas as pd
import plotly.express as px
from supabase import create_client, Client
from dotenv import load_dotenv

# Set page config first
st.set_page_config(page_title="Cro-Fu ML Admin", page_icon="📈", layout="wide")

st.title("📈 Cro-Fu ML Model Performance Dashboard")
st.markdown("This dashboard tracks the weekly evaluation metrics (RMSE, MSE, MAPE) of your predictive models.")

@st.cache_resource
def init_connection():
    load_dotenv(dotenv_path='Landing Page/.env.local')
    url = os.environ.get("VITE_SUPABASE_URL") or os.environ.get("SUPABASE_URL")
    # For reading, anon key is perfectly fine
    key = os.environ.get("VITE_SUPABASE_ANON_KEY") or os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    
    if not url or not key:
        st.error("Missing Supabase credentials! Please ensure `.env.local` contains VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.")
        st.stop()
    return create_client(url, key)

supabase = init_connection()

@st.cache_data(ttl=60)
def fetch_metrics():
    try:
        # Fetch the metrics
        res = supabase.table('model_metrics').select('*').order('training_date', desc=False).execute()
        return pd.DataFrame(res.data)
    except Exception as e:
        st.error(f"Failed to fetch data: {str(e)}")
        return pd.DataFrame()

df = fetch_metrics()

if df.empty:
    st.info("No metrics found in the database yet. The tables will populate after the first weekly training run!")
else:
    # Filter controls
    col1, col2 = st.columns(2)
    with col1:
        selected_commodity = st.selectbox("Select Commodity", df['commodity'].unique())
    with col2:
        selected_region = st.selectbox("Select Region", df['region'].unique())
        
    filtered_df = df[(df['commodity'] == selected_commodity) & (df['region'] == selected_region)]
    
    if filtered_df.empty:
        st.warning("No data for this combination.")
    else:
        st.subheader(f"Performance Trends: {selected_commodity.capitalize()} ({selected_region.upper()})")
        
        # Latest stats
        latest = filtered_df.iloc[-1]
        c1, c2, c3 = st.columns(3)
        c1.metric("Latest RMSE (Root Mean Squared Error)", round(latest['rmse'], 2))
        c2.metric("Latest MAPE (Mean Absolute % Error)", f"{round(latest['mape'], 2)}%")
        c3.metric("Latest Model Used", latest['model_type'].upper())
        
        st.markdown("---")
        
        # Charts
        st.markdown("### Error Rates Over Time (Lower is Better)")
        
        fig_rmse = px.line(filtered_df, x='training_date', y='rmse', markers=True, title="RMSE Trend")
        fig_rmse.update_traces(line_color='#FF4B4B')
        st.plotly_chart(fig_rmse, use_container_width=True)
        
        fig_mape = px.line(filtered_df, x='training_date', y='mape', markers=True, title="MAPE (%) Trend")
        fig_mape.update_traces(line_color='#0068C9')
        st.plotly_chart(fig_mape, use_container_width=True)
        
        st.markdown("### Raw Data Log")
        st.dataframe(filtered_df[['training_date', 'model_type', 'rmse', 'mse', 'mape']].sort_values('training_date', ascending=False), use_container_width=True)
