// Sample series — Tomato, National.
// Prices in ₹ / Quintal. Observed: last 30 days. Forecast: next 14 days.

export const OBSERVED = [
    1820, 1855, 1810, 1795, 1840, 1875, 1890, 1855, 1902, 1935, 1980, 2010,
    1985, 2030, 2075, 2110, 2085, 2145, 2180, 2160, 2220, 2205, 2255, 2240,
    2280, 2295, 2310, 2295, 2315, 2320,
];

export const FORECAST = [
    { d: 1, p: 2340, lo: 2300, hi: 2380 },
    { d: 2, p: 2358, lo: 2305, hi: 2415 },
    { d: 3, p: 2378, lo: 2310, hi: 2450 },
    { d: 4, p: 2395, lo: 2312, hi: 2478 },
    { d: 5, p: 2412, lo: 2314, hi: 2510 },
    { d: 6, p: 2425, lo: 2316, hi: 2540 },
    { d: 7, p: 2438, lo: 2318, hi: 2560 },
    { d: 8, p: 2448, lo: 2318, hi: 2580 },
    { d: 9, p: 2455, lo: 2315, hi: 2598 },
    { d: 10, p: 2461, lo: 2310, hi: 2612 },
    { d: 11, p: 2466, lo: 2303, hi: 2630 },
    { d: 12, p: 2470, lo: 2295, hi: 2645 },
    { d: 13, p: 2473, lo: 2285, hi: 2662 },
    { d: 14, p: 2475.5, lo: 2270, hi: 2680 },
];

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
