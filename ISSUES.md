# 📋 Cro-Fu — Project Issues & Backlog Tracker

> **Last Updated:** August 17, 2026  
> **Status:** Active Issue & Feature Backlog  

---

## 📌 Open Issues & Enhancements (Future Backlog)

### 1. Dynamic Hero Forecast Integration (`[FE-01]`)
- **Category:** Frontend / Real-time Data Integration  
- **Target File:** [`Landing Page/src/pages/Crofu.jsx`](file:///F:/Project/Cro-Fu/Landing%20Page/src/pages/Crofu.jsx) (`Hero` component)  
- **Description:**  
  Currently, the hero section forecast callout text (`₹2,475.50 / Quintal`, `a 6.7% rise from today`, `±8% confidence band by day 14`) uses static text placeholders.  
- **Planned Implementation:**  
  Import and wire the existing `useForecastData('tomato', 'national')` hook inside `Hero()` to dynamically bind live point predictions, percentage delta from today's observed price, and confidence band bounds directly from the `predictions` table in Supabase.
