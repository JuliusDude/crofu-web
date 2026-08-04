# 🥦 CroFu Desktop Dashboard — Functional Element Specifications (`dashboard_elements.md`)

> **Document Purpose**: Complete functional specification of all data elements, control inputs, analytical widgets, metrics, tables, and information modules required for the Desktop Dashboard of the CroFu Wholesale Vegetable Price Forecasting Web Application.
> 
> *Note: This document strictly details functional requirements, data structures, and feature elements. All visual design, styling, layout CSS, themes, colors, and UX patterns are excluded.*

---

## 1. Header & Global Control Bar

### 1.1 Region & Market Selector
- **Region Dropdown Input**: Selection between `Tamil Nadu (State-Level)` and `National (All-India Mandis)`.
- **Primary Commodity Selector**: Selection between target crops:
  - 🥔 Potato
  - 🧅 Onion
  - 🍅 Tomato
  - 🍆 Brinjal
- **Secondary Mandi Filter**: Multiselect filter to restrict analytics to specific wholesale mandis (e.g., Koyambedu, Madurai, Agra, Azadpur).

### 1.2 Forecast & Timeframe Controls
- **Forecast Horizon Selector**: Radio or button group for forecast range ($1\text{-Day}$, $7\text{-Day}$, $14\text{-Day}$, $30\text{-Day}$ ahead).
- **Historical Window Date Picker**: Start and end date pickers to adjust historical baseline lookback ($30\text{-Days}$, $90\text{-Days}$, $180\text{-Days}$, $1\text{-Year}$, or Custom Range).
- **Price Unit Converter**: Toggle between `₹ / Quintal (100 kg)` and `₹ / Kilogram (1 kg)`.

### 1.3 System Status & Data Export Controls
- **Data Freshness Indicator**: Timestamp showing the last successful Agmarknet data scrape (e.g., `Last Updated: 2026-08-04 06:00 IST`).
- **Pipeline Health Status**: Status indicator showing backend REST API connectivity and Database sync state (`Operational` / `Syncing`).
- **Data Export Actions**:
  - `Export CSV`: Downloads current view dataset (date, actual price, forecast price, lower bound, upper bound, arrivals).
  - `Export PDF`: Downloads printable analytical summary report.
  - `Export JSON`: Returns structured API payload for external integrations.

---

## 2. Key Performance Indicators (KPI Summary Cards)

### 2.1 Current Market Price Card
- **Latest Observed Price**: Most recent recorded modal price ($\text{₹}/\text{Quintal}$).
- **Observation Date**: Date of latest market recording.
- **24-Hour Price Delta**: Absolute change ($\text{₹}$) and percentage change ($\%$) compared to previous trading day.
- **Price Direction Indicator**: Functional classification (`Upward`, `Downward`, `Stable`).

### 2.2 Projected Target Price Card
- **Forecast Target Price**: Predicted wholesale price for the end of selected forecast horizon ($t+30$).
- **Net Projected Change**: Difference between current observed price and target forecast price ($\text{₹}$ and $\%$).
- **Projected Trend Direction**: Overall trajectory over forecast period (`Bullish / Escalating`, `Bearish / Declining`, `Sideways / Range-bound`).

### 2.3 Expected Price Range & Volatility Card
- **Projected Minimum Price**: Lowest expected price in 30-day forecast window.
- **Projected Maximum Price**: Highest expected price in 30-day forecast window.
- **Volatility Index**: Standard deviation of predicted daily price movements over 30 days.

### 2.4 Market Supply & Arrival Volume Card
- **Latest Daily Arrival**: Total volume recorded in market ($\text{Tonnes}$).
- **7-Day Moving Average Arrival**: Average daily arrival over past week.
- **Supply Trend Delta**: Volume change percentage compared to previous 7-day period.

### 2.5 Active Champion Model Card
- **Active Model Name**: Architecture currently selected for live inference (e.g., `ARIMA`, `XGBoost`, `GRNN`, `LSTM`).
- **Model Test MAPE**: Out-of-sample Mean Absolute Percentage Error ($\%$) on test set.
- **Model Test RMSE**: Out-of-sample Root Mean Squared Error ($\text{₹}/\text{Quintal}$).
- **Last Retrained Date**: Date of most recent automated model retraining run.

---

## 3. Main Interactive Forecasting & Time-Series Module

### 3.1 Time-Series Chart Data Layers
- **Historical Actual Price Series**: Continuous daily line plot of ground-truth prices up to date $t$.
- **30-Day Forecast Trajectory Series**: Projected daily price path from date $t+1$ to $t+30$.
- **Confidence Interval Band**: Shaded area representing upper bound ($\text{Forecast} + \text{Error Band}$) and lower bound ($\text{Forecast} - \text{Error Band}$).
- **Market Arrivals Overlay**: Secondary vertical bar series showing daily arrival volume ($\text{Tonnes}$).
- **Chronological Cutoff Divider**: Vertical reference line separating historical ground-truth data from future model projections.

### 3.2 Chart View Controls & Layer Toggles
- **Layer Toggle Checklist**:
  - `Show Confidence Bounds` (ON/OFF)
  - `Show Market Arrivals` (ON/OFF)
  - `Show Moving Averages (7-day / 30-day)` (ON/OFF)
- **Axis Scale Toggle**: Linear Scale vs. Logarithmic Scale.

### 3.3 Interactive Data Tooltip Parameters
When hovering or focusing on any date node:
- Date ($\text{YYYY-MM-DD}$)
- Actual Observed Price ($\text{₹}/\text{Quintal}$)
- Model Forecast Price ($\text{₹}/\text{Quintal}$)
- Lower Bound Estimate ($\text{₹}/\text{Quintal}$)
- Upper Bound Estimate ($\text{₹}/\text{Quintal}$)
- Recorded Arrivals ($\text{Tonnes}$)
- Model In Use (e.g., `XGBoost Champion`)

---

## 4. Multi-Model Benchmark & Comparison Module

### 4.1 Candidate Model Performance Matrix
A comparative table displaying all 4 evaluated time-series architectures for the active crop and region:

| Data Field | Description |
|---|---|
| **Model Architecture** | Model name (`ARIMA`, `XGBoost`, `GRNN`, `LSTM`) |
| **Test MAPE (%)** | Mean Absolute Percentage Error on held-out test fold |
| **Test RMSE** | Root Mean Squared Error ($\text{₹}/\text{Quintal}$) |
| **Test MAE** | Mean Absolute Error ($\text{₹}/\text{Quintal}$) |
| **$R^2$ Score** | Coefficient of Determination ($0.0 \to 1.0$) |
| **Directional Accuracy (%)** | Percentage of correctly predicted price movement directions |
| **Training Duration** | Execution time required for training (seconds) |
| **Status** | Active Champion Badge vs. Candidate Model |

### 4.2 Multi-Model Prediction Overlay Graph
- Multi-line chart comparing 30-day forecasts produced by all 4 model candidate pipelines simultaneously.
- Allows decision-makers to inspect model consensus vs. model divergence across forecast horizons.

---

## 5. Prediction Evolution & Experiment Tracking Module

### 5.1 Historical Forecast Snapshot Tracking
- **Target Date Selection Input**: Allows user to select any future target date $T$.
- **Snapshot Revision History Table**:
  - Revision Index / Run Timestamp (e.g., `Run #4 - 2026-07-27`)
  - Target Date ($T$)
  - Forecast Price Generated at Run ($\text{₹}/\text{Quintal}$)
  - Model Version & Name
  - Delta from Previous Run Forecast ($\text{₹}$ shift)
- **Evolution Chart**: Line graph illustrating how predictions for date $T$ shifted week-over-week as date $T$ drew closer.

### 5.2 Out-of-Sample Realized Accuracy Audit Table
A historical evaluation table comparing past predictions against actual realized market prices once dates pass:

| Data Field | Description |
|---|---|
| **Target Date** | Past date ($t-k$) |
| **Predicted Price** | Price predicted 30 days prior |
| **Actual Realized Price** | Ground-truth price recorded by Agmarknet |
| **Absolute Error** | $\| \text{Actual} - \text{Predicted} \|$ |
| **Percentage Error** | Percentage deviation ($\%$) |
| **Within Confidence Interval** | Boolean flag (`Yes` / `No`) |

---

## 6. Mandi-Level Regional Breakdown Module

### 6.1 Wholesale Mandi Data Table
A granular tabular view detailing price metrics across individual wholesale markets in the selected region:

| Data Field | Description |
|---|---|
| **Mandi Name** | Market location (e.g., Koyambedu, Madurai, Salem, Tirunelveli) |
| **District / Region** | District location |
| **Modal Price** | Current day modal price ($\text{₹}/\text{Quintal}$) |
| **Min Price** | Minimum daily transaction price |
| **Max Price** | Maximum daily transaction price |
| **Arrival Volume** | Market arrivals ($\text{Tonnes}$) |
| **Day-over-Day Δ** | Price change percentage ($\%$) |
| **7-Day Trend** | Mini trend direction (`Rising`, `Falling`, `Stable`) |

### 6.2 Table Interactive Controls
- **Search Input**: Text search to filter table by Mandi name or District.
- **Column Sorting**: Clickable column headers to sort by Price, Arrivals, or Percentage Delta (Ascending / Descending).
- **Pagination Control**: Rows per page selector ($10$, $25$, $50$, $100$, All).

---

## 7. Market Signals, Seasonal Dynamics & Risk Indicators

### 7.1 Seasonal & Harvest Crop Signal Module
- **Harvest Window Status**: Crop season indicator (e.g., `Sowing Phase`, `Peak Harvest Window`, `Off-Season / Storage Release`).
- **Historical Seasonality Factor**: Index multiplier indicating historical monthly price trend expectations based on 5-year historical medians.

### 7.2 Supply Chain Risk & Shock Indicators
- **Arrival Anomaly Alert**: Flag indicating if today's market arrivals deviate significantly ($> 30\%$) from 30-day moving average arrival.
- **Price Volatility Alert Level**: Risk status indicator (`Low Volatility`, `Moderate Risk`, `High Price Volatility Warning`).
- **Regional Supply Surplus / Deficit Index**: Estimated supply balance ratio derived from national and state arrival ratios.

---

## 8. Automated Price Alert & Threshold Configurator

### 8.1 Price Threshold Alert Rules
- **Upper Threshold Trigger**: User-defined upper limit ($\text{₹}/\text{Quintal}$). Triggers notification if predicted or actual price exceeds threshold.
- **Lower Threshold Trigger**: User-defined lower limit ($\text{₹}/\text{Quintal}$). Triggers notification if price drops below threshold.
- **Percentage Shift Alert**: Trigger when 7-day predicted price shift exceeds $\pm X\%$.

### 8.2 Alert Channel Selectors
- **Delivery Destination Options**: `Email`, `SMS Alert`, `Mobile Push Notification`, `Webhook Payload`.
- **Frequency Options**: `Real-Time Instant`, `Daily Morning Summary`, `Weekly Forecast Digest`.
