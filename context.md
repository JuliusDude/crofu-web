# 🌾 Cro-Fu — System Architecture & Context Document

> **Project Name:** Cro-Fu (Wholesale Vegetable Price Forecasting Platform)  
> **Repository:** `JuliusDude/crofu-web`  
> **Last Updated:** August 17, 2026  
> **Environment:** Development / Hybrid Cloud Automation  

---

## 📋 1. Executive Summary & Purpose

**Cro-Fu** is an end-to-end AI-driven agricultural price forecasting platform designed to predict wholesale mandi prices 1 to 30 days ahead across India. The platform targets high-volume commodities (**Tomato, Onion, Potato, Brinjal**) across both **National (All-India)** and state-level **Tamil Nadu (TN)** wholesale markets.

The system empowers farmers, traders, and agricultural analysts by eliminating price uncertainty, optimizing harvest timing, and delivering publication-grade predictive analytics via responsive web and mobile interfaces.

---

## 🏗️ 2. High-Level System Architecture

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                            AUTOMATED WORKERS                                │
│                                                                             │
│  ┌──────────────────────────┐               ┌────────────────────────────┐  │
│  │   daily_scraper.py       │               │   weekly_predictor.py      │  │
│  │ (Daily Agmarknet Fetch)  │               │ (Model Retrain & Forecast) │  │
│  └────────────┬─────────────┘               └─────────────┬──────────────┘  │
└───────────────┼───────────────────────────────────────────┼─────────────────┘
                │                                           │
                ▼                                           ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           SUPABASE CLOUD DATABASE                           │
│                                                                             │
│  - historical_prices  (10,869+ records, daily raw prices)                   │
│  - predictions        (28-day forecasts with upper/lower bounds & version) │
│  - model_metrics      (RMSE, MSE, MAPE evaluation scores per run)           │
└───────────────┬───────────────────────────────────────────┬─────────────────┘
                │                                           │
                ▼                                           ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                             CONSUMER APPLICATION                            │
│                                                                             │
│  ┌──────────────────────────┐               ┌────────────────────────────┐  │
│  │     Vite React App       │               │  Streamlit Admin Dashboard │  │
│  │ (Landing & Client App)   │               │ (Model Metrics Monitor)    │  │
│  └──────────────────────────┘               └────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🤖 3. Machine Learning Pipeline & Model Architecture

### 3.1 Model Selection Strategy
Rather than retraining all candidate architectures for every run, the platform isolates the **single best-performing model** per `(Region, Commodity)` pair based on empirical validation scores (`MAPE`, `RMSE`).

| Region | Commodity | Selected Model | Model Parameters / Architecture | Weights Path |
| :--- | :--- | :--- | :--- | :--- |
| **National** | Tomato | **XGBoost** | `n_estimators=50`, `max_depth=3`, 7-day lag features | `workers/models/National/tomato/XGBoost/models/best_xgb.pkl` |
| **National** | Onion | **ARIMA** | Order `(5, 1, 0)` time-series model | `workers/models/National/onion/ARIMA/models/best_arima_national.pkl` |
| **National** | Potato | **ARIMA** | Order `(5, 1, 0)` time-series model | `workers/models/National/potato/ARIMA/models/best_arima_national.pkl` |
| **National** | Brinjal | **XGBoost** | `n_estimators=50`, `max_depth=3`, 7-day lag features | `workers/models/National/brinjal/XGBoost/models/best_xgb.pkl` |
| **Tamil Nadu** | Tomato | **XGBoost** | `n_estimators=50`, `max_depth=3`, 7-day lag features | `workers/models/TN/tomato/XGBoost-TN/models/best_xgb.pkl` |
| **Tamil Nadu** | Onion | **ARIMA** | Order `(5, 1, 0)` time-series model | `workers/models/TN/onion/ARIMA/models/best_arima_tn.pkl` |
| **Tamil Nadu** | Potato | **ARIMA** | Order `(5, 1, 0)` time-series model | `workers/models/TN/potato/arima/models/best_arima_tn.pkl` |
| **Tamil Nadu** | Brinjal | **XGBoost** | `n_estimators=50`, `max_depth=3`, 7-day lag features | `workers/models/TN/brinjal/XGBoost-TN/models/best_xgb.pkl` |

### 3.2 Dataset Specifications
- **Total Historical Records**: **10,869 records** stored in Supabase `historical_prices`.
- **National Dataset**: 2,043 records per commodity (2021–2026).
- **Tamil Nadu Dataset**: 663 to 692 records per commodity.
- **Retraining Data Scope**: 100% of historical data is fetched and fed into retraining without artificial truncation limits.

### 3.3 Versioning Scheme (`YY.M.W`)
Model retraining cycles generate an automated version code:
- **`YY`**: 2-digit Year (e.g. `26` for 2026).
- **`M`**: Month integer without zero-padding (e.g. `8` for August).
- **`W`**: Sunday retraining index within that month (e.g. `1` for 1st Sunday retraining, `2` for 2nd Sunday, etc.).
- **Example**: Retraining on August 9, 2026 generates version **`26.8.2`**.
- This version code is attached to all Supabase records and CSV log outputs.

---

## 🗄️ 4. Supabase Database Schema

### 4.1 `historical_prices`
- `id` (uuid, primary key)
- `commodity` (text: `tomato`, `onion`, `potato`, `brinjal`)
- `region` (text: `national`, `tn`)
- `date` (date: `YYYY-MM-DD`)
- `price` (numeric: modal price per quintal in ₹)
- **Unique Constraint**: `(commodity, region, date)`

### 4.2 `predictions`
- `id` (uuid, primary key)
- `commodity` (text)
- `region` (text)
- `target_date` (date)
- `p` (numeric: predicted point price)
- `lo` (numeric: lower confidence bound)
- `hi` (numeric: upper confidence bound)
- `version` (text: version code e.g. `26.8.2`)

### 4.3 `model_metrics`
- `id` (uuid, primary key)
- `commodity` (text)
- `region` (text)
- `training_date` (date)
- `model_type` (text: `xgboost`, `arima`)
- `mse` (numeric)
- `rmse` (numeric)
- `mape` (numeric: Mean Absolute Percentage Error)
- `version` (text: version code e.g. `26.8.2`)

---

## ⚙️ 5. Automation & CI/CD Workflows

The repository uses GitHub Actions for cloud automation:

1. **Daily Price Scraper** (`.github/workflows/daily_scraper.yml`):
   - **Schedule**: `30 2 * * *` (02:30 UTC / 8:00 AM IST daily).
   - Executing script: `python workers/daily_scraper.py`.
   - Appends fetched prices to `workers/logs/daily_prices.csv` and pushes updates to GitHub repository.

2. **Weekly ML Predictor** (`.github/workflows/weekly_predictor.yml`):
   - **Schedule**: `0 2 * * 0` (02:00 UTC / 7:30 AM IST every Sunday).
   - Executing script: `python workers/weekly_predictor.py`.
   - Generates 28 days of future forecasts, computes validation metrics, appends records to `workers/logs/weekly_predictions.csv` & `workers/logs/weekly_metrics.csv`, and pushes updates to GitHub repository.

---

## 🔒 6. Security & Credentials Policy

- **Service Role Key vs. Anon Key**:
  - `VITE_SUPABASE_ANON_KEY`: Used by the React frontend for public read-only access.
  - `SUPABASE_SERVICE_ROLE_KEY`: Used by Python backend workers (`daily_scraper.py`, `weekly_predictor.py`, `inject_historical_data.py`) to bypass Row-Level Security (RLS) for write/upsert operations.
- **Git Safety Rule**: Never commit secrets or push to Git without explicit user instruction during local development.
