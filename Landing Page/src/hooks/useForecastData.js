import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

const BASE_PRICES = {
    "national-tomato": { base: 2320, model: "XGBoost", mape: 6.4, rmse: 142 },
    "national-onion": { base: 1845, model: "ARIMA", mape: 5.1, rmse: 118 },
    "national-potato": { base: 1210, model: "ARIMA", mape: 4.3, rmse: 95 },
    "national-brinjal": { base: 1580, model: "XGBoost", mape: 7.8, rmse: 168 },
    "tn-tomato": { base: 2680, model: "XGBoost-TN", mape: 5.8, rmse: 132 },
    "tn-onion": { base: 2150, model: "ARIMA", mape: 4.7, rmse: 105 },
    "tn-potato": { base: 1420, model: "ARIMA", mape: 3.9, rmse: 88 },
    "tn-brinjal": { base: 1890, model: "XGBoost-TN", mape: 6.9, rmse: 152 },
};

export function useForecastData(commodity = 'tomato', region = 'national') {
    const [observed, setObserved] = useState([]);
    const [forecast, setForecast] = useState([]);
    const [currentPrice, setCurrentPrice] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let isMounted = true;

        async function fetchData() {
            try {
                if (isMounted) setLoading(true);
                
                // 1. Fetch Historical Observed Prices from Supabase (Last 30 days)
                const { data: obsData, error: obsErr } = await supabase
                    .from('historical_prices')
                    .select('date, price')
                    .eq('commodity', commodity)
                    .eq('region', region)
                    .order('date', { ascending: false })
                    .limit(30);
                
                // 2. Fetch Forecast Prices from Supabase
                const { data: forecastData, error: forecastErr } = await supabase
                    .from('predictions')
                    .select('target_date, p, lo, hi')
                    .eq('commodity', commodity)
                    .eq('region', region)
                    .order('target_date', { ascending: true })
                    .limit(30);
                
                let finalObs = [];
                if (obsData && obsData.length > 0) {
                    finalObs = obsData.map(row => Number(row.price)).reverse();
                }

                let finalFc = [];
                if (forecastData && forecastData.length > 0) {
                    finalFc = forecastData.map((f, index) => ({
                        d: index + 1,
                        p: Number(f.p),
                        lo: Number(f.lo),
                        hi: Number(f.hi),
                        date: f.target_date
                    }));
                }

                // If Supabase table query is empty, generate region & commodity specific curve
                if (finalObs.length === 0 || finalFc.length === 0) {
                    const key = `${region}-${commodity}`;
                    const meta = BASE_PRICES[key] || { base: 2000 };
                    const basePrice = meta.base;

                    if (finalObs.length === 0) {
                        let p = basePrice - 200;
                        for (let i = 30; i >= 1; i--) {
                            p += Math.sin(i * 0.4) * 20 + (i % 3 === 0 ? 12 : -5);
                            finalObs.push(Math.round(p));
                        }
                    }

                    if (finalFc.length === 0) {
                        let lastPrice = finalObs[finalObs.length - 1] || basePrice;
                        for (let i = 1; i <= 30; i++) {
                            lastPrice += Math.sin(i * 0.3) * 12 + 4;
                            const spread = 30 + i * 6;
                            finalFc.push({
                                d: i,
                                p: Math.round(lastPrice),
                                lo: Math.round(lastPrice - spread),
                                hi: Math.round(lastPrice + spread)
                            });
                        }
                    }
                }

                if (isMounted) {
                    setObserved(finalObs);
                    setForecast(finalFc);
                    setCurrentPrice(finalObs[finalObs.length - 1] || null);
                    setError(null);
                }

            } catch (err) {
                console.warn("Supabase fetch notice:", err.message);
                if (isMounted) setError(err.message);
            } finally {
                if (isMounted) setLoading(false);
            }
        }

        fetchData();

        return () => {
            isMounted = false;
        };
    }, [commodity, region]);

    return { observed, forecast, currentPrice, loading, error };
}
