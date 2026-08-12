// Sample series — Tomato, National.
// Prices in ₹ / Quintal. Observed: last 30 days. Forecast: next 14 days.

export const OBSERVED = [];

export const FORECAST = [];

export const COMMODITIES = [
    {
        key: "tomato",
        label: "Tomato",
        model: "XGBoost",
        mape: 6.4,
        rmse: 142,
        mae: 108,
        img: "/tomatoes.jpg",
    },
    {
        key: "onion",
        label: "Onion",
        model: "ARIMA",
        mape: 5.1,
        rmse: 118,
        mae: 89,
        img: "/onion.jpg",
    },
    {
        key: "potato",
        label: "Potato",
        model: "ARIMA",
        mape: 4.3,
        rmse: 95,
        mae: 72,
        img: "/potato.jpg",
    },
    {
        key: "brinjal",
        label: "Brinjal",
        model: "XGBoost",
        mape: 7.8,
        rmse: 168,
        mae: 128,
        img: "/brinjal.png",
    },
];

export const REGIONS = [
    { key: "national", label: "National" },
    { key: "tn", label: "Tamil Nadu" },
];
