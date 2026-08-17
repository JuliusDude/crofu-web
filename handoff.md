# 🤝 Cro-Fu — Developer Handoff Document

> **Target Audience:** Incoming Engineers / AI Agents  
> **Project:** Cro-Fu Wholesale Vegetable Price Forecasting Platform  
> **Date:** August 17, 2026  
> **Status:** Active Development Mode (Local Servers Running)  

---

## 📌 1. Current Operational State

The project is currently running in **Development Mode** on the local Windows environment:

* **Vite React Web App**: Running on `http://localhost:3000/` (Cwd: `Landing Page/`)
* **Streamlit Admin Dashboard**: Running on `http://localhost:8501/` (Cwd: `root`)
* **Git Policy Directive**: **DO NOT push to Git without explicit user instruction.**

---

## ✅ 2. Recent Accomplishments & Key Fixes

1. **Mobile Responsiveness & Viewport Lock**:
   - Fixed horizontal overflow bug on mobile viewports by adding `w-full max-w-[100vw] overflow-x-hidden` to the root `<main>` component in [`Landing Page/src/pages/Crofu.jsx`](file:///F:/Project/Cro-Fu/Landing%20Page/src/pages/Crofu.jsx).
   - Ensured the Splash Screen (`SplashScreen.jsx`) fills 100% of the mobile viewport (`100dvh`) cleanly without exposed right-side margins.
   - Fixed Dashboard header layout so the Logo and Theme Toggle stay on a single compact row (`justify-between`) on mobile screens without vertical stacking.

2. **Automated ML Worker Pipeline Upgrades**:
   - Refactored [`workers/weekly_predictor.py`](file:///F:/Project/Cro-Fu/workers/weekly_predictor.py) to remove the `.limit(365)` query cap, allowing retraining to consume 100% of the **10,869 historical records**.
   - Configured `BEST_MODELS` mapping to route region and commodity data strictly to their respective top model (ARIMA for Onion/Potato, XGBoost for Tomato/Brinjal).
   - Enabled retrained model weight dumping (`joblib.dump`) to persist updated `.pkl` model weights.

3. **CSV Logging & Versioning Scheme**:
   - Added automatic CSV logging to `workers/logs/daily_prices.csv`, `workers/logs/weekly_predictions.csv`, and `workers/logs/weekly_metrics.csv`.
   - Integrated the **`YY.M.W` Versioning Scheme** (e.g. `26.8.2` for 2nd Sunday retraining of August 2026) across console outputs, Supabase database payloads, and CSV log files.

4. **SSL & Cross-Platform Compatibility**:
   - Added `httpx` SSL transport patches across Python scripts (`daily_scraper.py`, `weekly_predictor.py`, `inject_historical_data.py`) to prevent Windows local SSL certificate validation errors.
   - Fixed Windows terminal stdout character encoding for price outputs (`Rs.` fallback for Unicode `₹`).

---

## 📁 3. Important Sitemap & File Reference

```text
F:\Project\Cro-Fu\
├── context.md                             # Architectural context & DB schema documentation
├── handoff.md                             # This developer handoff guide
├── admin_dashboard.py                     # Streamlit local monitoring dashboard
├── Landing Page/                          # React + Vite web application
│   ├── src/
│   │   ├── App.jsx                        # Orchestrator & route state management
│   │   ├── index.css                      # Core design system & responsive styling
│   │   ├── pages/Crofu.jsx                # Main landing page UI
│   │   └── pages/Dashboard.jsx            # Live interactive forecasting dashboard
│   └── .env.local                         # Supabase public credentials
├── workers/                               # Python automation scripts & ML pipeline
│   ├── daily_scraper.py                   # Daily market price scraper
│   ├── weekly_predictor.py                # Weekly ML model retraining & 28-day forecast
│   ├── inject_historical_data.py          # One-off TNAU historical dataset injector
│   ├── logs/                              # Generated CSV log files
│   │   ├── daily_prices.csv
│   │   ├── weekly_predictions.csv
│   │   └── weekly_metrics.csv
│   └── models/                            # Trained model weight files (.pkl / .keras)
└── .github/workflows/                     # GitHub Actions CI/CD automation
    ├── daily_scraper.yml                  # Daily scraper schedule (8:00 AM IST)
    └── weekly_predictor.yml               # Weekly predictor schedule (Sunday 7:30 AM IST)
```

---

## 🛠️ 4. Quick Start & Developer Verification Guide

### 4.1 Running Local Dev Servers
```bash
# 1. Start Vite Frontend Web App (Port 3000)
cd "F:/Project/Cro-Fu/Landing Page"
npm run dev

# 2. Start Streamlit Admin Dashboard (Port 8501)
cd "F:/Project/Cro-Fu"
python -m streamlit run admin_dashboard.py
```

### 4.2 Testing Python Workers Locally
```bash
# Test Daily Price Scraper & CSV Logging
python workers/daily_scraper.py

# Test Weekly ML Predictor Retraining, Forecasting & Versioning
python workers/weekly_predictor.py
```

---

## 🚀 5. Next Steps & Production Checklist

1. **GitHub Repository Secrets**:
   - Ensure `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are configured under **GitHub Repo Settings -> Secrets and Variables -> Actions**.

2. **Supabase Database Columns**:
   - Ensure the `version` text column is added to `predictions` and `model_metrics` tables in your Supabase dashboard if strict schema validation is enabled.

3. **Capacitor Mobile App Build (Optional)**:
   - Run Capacitor build scripts in `Landing Page/` if targeting Android APK packaging (`npx cap sync android`).

4. **Git Branch Policy Reminder**:
   - Always ask for explicit user confirmation before executing `git push` or committing code to `main`.
