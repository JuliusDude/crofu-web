# Cro-Fu — Agricultural Wholesale Price Forecasting Platform

[![Python](https://img.shields.io/badge/Python-3.10%2B-blue.svg?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![React](https://img.shields.io/badge/React-18.0-61DAFB.svg?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E.svg?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-Automated_CI%2FCD-2088FF.svg?style=for-the-badge&logo=github-actions&logoColor=white)](https://github.com/features/actions)
[![License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)

---

## Overview

**Cro-Fu** is an end-to-end machine learning platform designed to forecast daily wholesale vegetable market prices 1 to 30 days into the future across Indian trading mandis. By combining statistical time-series modeling (**ARIMA**) with Gradient Boosting (**XGBoost**) on historical arrival price datasets, Cro-Fu provides accurate, region-specific price trajectories for essential agricultural commodities: **Tomato, Onion, Potato, and Brinjal**.

The platform operates across two geographic tiers:
- **National Level**: All-India aggregated mandi wholesale trading prices.
- **State Level (Tamil Nadu)**: Region-specific trading prices.

---

## Architecture

The system consists of three decoupled components: an automated data ingestion and ML retraining backend, a Supabase PostgreSQL persistence layer, and a modern responsive web frontend.

```text
+-----------------------------------------------------------------------------+
|                            AUTOMATED WORKERS                                |
|                                                                             |
|  +--------------------------+               +----------------------------+  |
|  |   daily_scraper.py       |               |   weekly_predictor.py      |  |
|  | (Daily Agmarknet Fetch)  |               | (Model Retrain & Forecast) |  |
|  +------------+-------------+               +------------+---------------+  |
+---------------|------------------------------------------|------------------+
                |                                          |
                v                                          v
+-----------------------------------------------------------------------------+
|                           SUPABASE CLOUD DATABASE                           |
|                                                                             |
|  - historical_prices  (10,869+ records, daily raw prices)                   |
|  - predictions        (28-day forecasts with upper/lower bounds & version) |
|  - model_metrics      (RMSE, MSE, MAPE evaluation scores per run)           |
+---------------|------------------------------------------|------------------+
                |                                          |
                v                                          v
+-----------------------------------------------------------------------------+
|                             CONSUMER APPLICATION                            |
|                                                                             |
|  +--------------------------+               +----------------------------+  |
|  |     Vite React App       |               |  Streamlit Admin Dashboard |  |
|  | (Landing & Client App)   |               | (Model Metrics Monitor)    |  |
|  +--------------------------+               +----------------------------+  |
+-----------------------------------------------------------------------------+
```

---

## Machine Learning Pipeline

### 1. Model Allocation Matrix

To minimize computational overhead and maximize predictive accuracy, the system routes each commodity and region pair to its empirical top-performing algorithm:

| Region | Commodity | Algorithm | Configuration Details | Saved Model Weights |
| :--- | :--- | :--- | :--- | :--- |
| **National** | Tomato | **XGBoost** | `n_estimators=50`, `max_depth=3`, 7-day lag features | `workers/models/National/tomato/XGBoost/models/best_xgb.pkl` |
| **National** | Onion | **ARIMA** | Order `(5, 1, 0)` time-series model | `workers/models/National/onion/ARIMA/models/best_arima_national.pkl` |
| **National** | Potato | **ARIMA** | Order `(5, 1, 0)` time-series model | `workers/models/National/potato/ARIMA/models/best_arima_national.pkl` |
| **National** | Brinjal | **XGBoost** | `n_estimators=50`, `max_depth=3`, 7-day lag features | `workers/models/National/brinjal/XGBoost/models/best_xgb.pkl` |
| **Tamil Nadu** | Tomato | **XGBoost** | `n_estimators=50`, `max_depth=3`, 7-day lag features | `workers/models/TN/tomato/XGBoost-TN/models/best_xgb.pkl` |
| **Tamil Nadu** | Onion | **ARIMA** | Order `(5, 1, 0)` time-series model | `workers/models/TN/onion/ARIMA/models/best_arima_tn.pkl` |
| **Tamil Nadu** | Potato | **ARIMA** | Order `(5, 1, 0)` time-series model | `workers/models/TN/potato/arima/models/best_arima_tn.pkl` |
| **Tamil Nadu** | Brinjal | **XGBoost** | `n_estimators=50`, `max_depth=3`, 7-day lag features | `workers/models/TN/brinjal/XGBoost-TN/models/best_xgb.pkl` |

### 2. Dataset Scale

- **Total Historical Records**: **10,869 entries** stored in Supabase `historical_prices`.
- **National Coverage**: ~2,043 entries per commodity (2021–2026).
- **Tamil Nadu Coverage**: ~670 to 692 entries per commodity.
- **Retraining Data Horizon**: 100% of historical records are evaluated during weekly retraining cycles.

### 3. Retraining Versioning Scheme (`YY.M.W`)

Every weekly retraining run generates a standard version identifier:
- **`YY`**: 2-digit Year (e.g., `26` for 2026).
- **`M`**: Month integer (e.g., `8` for August).
- **`W`**: Sunday retraining index of that month (e.g., `1` for 1st Sunday, `2` for 2nd Sunday).
- **Example**: Retraining executed on August 9, 2026 generates Version **`26.8.2`**.

---

## Database Schema

The system utilizes a Supabase PostgreSQL database structured into three core tables:

### `historical_prices`
| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | `uuid` | Primary key |
| `commodity` | `text` | Commodity slug (`tomato`, `onion`, `potato`, `brinjal`) |
| `region` | `text` | Trading region (`national`, `tn`) |
| `date` | `date` | Price observation date (`YYYY-MM-DD`) |
| `price` | `numeric` | Modal wholesale price in ₹ per quintal |

### `predictions`
| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | `uuid` | Primary key |
| `commodity` | `text` | Commodity slug |
| `region` | `text` | Trading region |
| `target_date` | `date` | Forecast target date (`YYYY-MM-DD`) |
| `p` | `numeric` | Forecast point price estimate |
| `lo` | `numeric` | Lower confidence interval bound |
| `hi` | `numeric` | Upper confidence interval bound |
| `version` | `text` | Model retraining version code (`YY.M.W`) |

### `model_metrics`
| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | `uuid` | Primary key |
| `commodity` | `text` | Commodity slug |
| `region` | `text` | Trading region |
| `training_date` | `date` | Model evaluation execution date |
| `model_type` | `text` | Model architecture (`xgboost`, `arima`) |
| `mse` | `numeric` | Mean Squared Error |
| `rmse` | `numeric` | Root Mean Squared Error |
| `mape` | `numeric` | Mean Absolute Percentage Error (%) |
| `version` | `text` | Model retraining version code (`YY.M.W`) |

---

## Automation & Scheduled Workflows

GitHub Actions handles background schedule automation:

1. **Daily Agmarknet Price Scraper** ([`.github/workflows/daily_scraper.yml`](.github/workflows/daily_scraper.yml)):
   - **Cron**: `30 2 * * *` (02:30 UTC / 8:00 AM IST daily).
   - **Action**: Ingests new daily arrival prices into Supabase and updates `workers/logs/daily_prices.csv`.

2. **Weekly ML Predictor & Retrainer** ([`.github/workflows/weekly_predictor.yml`](.github/workflows/weekly_predictor.yml)):
   - **Cron**: `0 2 * * 0` (02:00 UTC / 7:30 AM IST every Sunday).
   - **Action**: Retrains designated best models on full historical data, computes 28-day forecasts with versioning, updates Supabase, and commits updated `.pkl` weights and CSV logs.

---

## Project Structure

```text
.
├── .github/workflows/
│   ├── daily_scraper.yml               # Daily price fetching automation workflow
│   └── weekly_predictor.yml            # Weekly model retraining & forecast workflow
├── Landing Page/                       # React + Vite client web application
│   ├── src/
│   │   ├── App.jsx                     # Application root orchestrator & routes
│   │   ├── index.css                   # Core design tokens & responsive styles
│   │   └── pages/
│   │       ├── Crofu.jsx               # Primary product landing page
│   │       └── Dashboard.jsx           # Interactive price forecasting dashboard
│   └── package.json
├── workers/                            # Python automation workers & ML pipelines
│   ├── daily_scraper.py                # Daily Agmarknet scraper engine
│   ├── weekly_predictor.py             # Model retraining & inference engine
│   ├── logs/                           # Automated CSV execution logs
│   └── models/                         # Serialized model weight artifacts (.pkl)
├── admin_dashboard.py                  # Streamlit model performance dashboard
├── requirements.txt                    # Project Python dependencies
└── README.md                           # Project documentation
```

---

## Getting Started

### Prerequisites

- **Node.js**: `v18.0.0` or higher
- **Python**: `v3.10.0` or higher

### 1. Repository Setup

```bash
git clone https://github.com/JuliusDude/crofu-web.git
cd crofu-web
```

### 2. Frontend Setup

```bash
cd "Landing Page"
npm install
npm run dev
```
Access the client application at `http://localhost:3000`.

### 3. Backend & Admin Dashboard Setup

```bash
# Install Python dependencies
pip install -r workers/requirements.txt

# Run local Streamlit monitoring dashboard
python -m streamlit run admin_dashboard.py
```
Access the admin dashboard at `http://localhost:8501`.

### 4. Executing ML Pipelines Locally

```bash
# Run daily scraper manually
python workers/daily_scraper.py

# Run weekly predictor & model retraining manually
python workers/weekly_predictor.py
```

---

## Environment Variables

Configure the following variables in `Landing Page/.env.local` for local development or in GitHub Repository Secrets for Actions automation:

| Variable Name | Required Scope | Purpose |
| :--- | :--- | :--- |
| `VITE_SUPABASE_URL` | Frontend & Backend | Supabase API endpoint URL |
| `VITE_SUPABASE_ANON_KEY` | Frontend Client | Public read-only client key |
| `SUPABASE_SERVICE_ROLE_KEY` | Python Workers | Backend key for write & upsert operations |

---

## License

Distributed under the MIT License. See `LICENSE` for more information.
