# CroFu Mobile App (.apk) — AI Developer Agent Prompts & Execution Guide

This document contains ready-to-use sequential prompts that you can feed directly into any AI Coding Agent (e.g. Claude Code, Gemini CLI, Cursor, Antigravity) to automatically build the **CroFu Mobile App (.apk)**.

---

## 🚀 Prompt 1: Initializing Project & Theme Design Tokens

```text
Please initialize a new Expo React Native project called "crofu-mobile" using TypeScript.
Install the following dependencies:
- expo-font
- expo-status-bar
- expo-haptics
- react-native-gesture-handler
- react-native-reanimated
- react-native-svg
- lucide-react-native

Create `constants/theme.ts` with the exact CroFu design system tokens for Light and Dark modes:
- Light Theme: bg (#f6f2e7), surface (#ffffff), ink (#1c231e), border (#e3ddcb), brand (#204a38), gold (#b8872e), positive (#4c7a52), negative (#b85c42).
- Dark Theme: bg (#0f1613), surface (#171f1a), ink (#ece7d9), border (#2a342d), brand (#3e8b63), gold (#e0ac4c), positive (#5fa26a), negative (#d97b5c).
- Serif Font: Fraunces, Sans Font: IBM Plex Sans, Mono Font: IBM Plex Mono.

Create `components/AppLogo.tsx` rendering the raw typographic logo "CroFu." with Fraunces bold serif font and a gold accent dot.
```

---

## 📊 Prompt 2: Master Datasets & Data Pipeline

```text
Create `data/masterData.ts` with mock commodity datasets for Tomato, Onion, Potato, and Brinjal.
Include:
- Unit prices (Quintal base), champion models (XGBoost V3, ARIMA), MAPE, RMSE, MAE, R², direction accuracy, and retrained dates.
- Regional Mandis list (Koyambedu Wholesale, Madurai Central Mandi, Azadpur Mandi, Agra Vegetable Market, Salem Market Yard).
- `generateSeries(basePrice)` function generating 30-day historical observed prices + 30-day forecast predictions with lower/upper confidence bounds and arrival volumes.
```

---

## 📈 Prompt 3: Touch-Interactive SVG Time-Series Chart Component

```text
Create `components/InteractiveChart.tsx` using `react-native-svg` and `PanGestureHandler`.
The chart must render:
- Y-Axis horizontal grid lines and price step labels.
- Vertical dashed Present cutoff line at t=0 (x=50%).
- Solid Emerald Green line for Observed Prices (`theme.positive`).
- Dashed Amber Gold line for Forecast Trajectories (`theme.gold`).
- Shaded gold confidence interval polygon band.
- Drag gesture listener updating active node state with vertical crosshair line, pulsing node circle, and floating inspection card tooltip.
```

---

## 📱 Prompt 4: Main Dashboard Screen & Bottom Navigation Bar

```text
Create `screens/DashboardScreen.tsx` and `components/BottomNav.tsx`.
Requirements:
- NO LANDING PAGE included. Launch straight into Dashboard.
- Include Header with raw typographic AppLogo "CroFu.".
- Include Crop Selector horizontal scroll bar (Tomato, Onion, Potato, Brinjal) with image/badge fill.
- Region Picker (National All-India vs Tamil Nadu).
- 5 Compact KPI cards (Observed Price, Target Price, Price Range, Market Arrivals, Active Model).
- 5 Segmented Bottom Navigation Tabs: Forecast Chart, Multi-Model Benchmark Matrix, Prediction Audit Log, Mandi Breakdown, and Price Risk Alerts.
- Dark/Light mode theme toggle in header.
```

---

## 📦 Prompt 5: Standalone Android APK Compilation

```text
Execute EAS CLI commands to compile a standalone Android APK (.apk) file:
1. Ensure `eas.json` is configured for preview builds:
   {
     "build": {
       "preview": {
         "android": {
           "buildType": "apk"
         }
       }
     }
   }
2. Run: `npx eas-cli build -p android --profile preview`
```
