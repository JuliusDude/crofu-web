import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

const BASE_PRICES = {
    "national-tomato": 2340,
    "national-onion": 1845,
    "national-potato": 1210,
    "national-brinjal": 1580,
    "tn-tomato": 2580,
    "tn-onion": 1960,
    "tn-potato": 1390,
    "tn-brinjal": 1740,
};

function generateFallbackData(commodity, region) {
    const key = `${region.toLowerCase()}-${commodity.toLowerCase()}`;
    const base = BASE_PRICES[key] || 2200;

    const observed = [];
    let p = base - 180;
    for (let i = 30; i >= 1; i--) {
        p += Math.sin(i * 0.45) * 35 + (Math.sin(i * 0.2) * 15);
        observed.push(Math.round(p));
    }

    const forecast = [];
    let fcP = observed[observed.length - 1];
    for (let i = 1; i <= 30; i++) {
        fcP += Math.sin(i * 0.35) * 20 + 8;
        const spread = 50 + i * 9;
        forecast.push({
            d: i,
            p: Math.round(fcP),
            lo: Math.round(fcP - spread),
            hi: Math.round(fcP + spread),
        });
    }

    return { observed, forecast, currentPrice: observed[observed.length - 1] };
}

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
                setLoading(true);
                setError(null);
                
                const cKey = commodity.toLowerCase();
                const rKey = region.toLowerCase();

                // 1. Fetch Current Price from Supabase
                const { data: currentData } = await supabase
                    .from('current_prices')
                    .select('price')
                    .eq('commodity', cKey)
                    .eq('region', rKey)
                    .order('created_at', { ascending: false })
                    .limit(1);

                // 2. Fetch Historical Observed Prices from Supabase (Last 30 days)
                const { data: obsData, error: obsErr } = await supabase
                    .from('historical_prices')
                    .select('price, date')
                    .eq('commodity', cKey)
                    .eq('region', rKey)
                    .order('date', { ascending: false })
                    .limit(30);
                
                // 3. Fetch Forecast Predictions from Supabase (30 days)
                const { data: forecastData, error: forecastErr } = await supabase
                    .from('predictions')
                    .select('target_date, p, lo, hi')
                    .eq('commodity', cKey)
                    .eq('region', rKey)
                    .order('target_date', { ascending: true })
                    .limit(30);
                
                if (!isMounted) return;

                const fallback = generateFallbackData(cKey, rKey);

                if (obsData && obsData.length > 0) {
                    setObserved(obsData.map(row => Number(row.price)).reverse());
                } else {
                    setObserved(fallback.observed);
                }

                if (forecastData && forecastData.length > 0) {
                    const mappedForecast = forecastData.map((f, index) => ({
                        d: index + 1,
                        p: Number(f.p),
                        lo: Number(f.lo),
                        hi: Number(f.hi),
                        target_date: f.target_date
                    }));
                    setForecast(mappedForecast);
                } else {
                    setForecast(fallback.forecast);
                }

                if (currentData && currentData.length > 0) {
                    setCurrentPrice(Number(currentData[0].price));
                } else {
                    setCurrentPrice(fallback.currentPrice);
                }

            } catch (err) {
                console.error("Supabase fetch error:", err.message);
                if (isMounted) {
                    const fallback = generateFallbackData(commodity, region);
                    setObserved(fallback.observed);
                    setForecast(fallback.forecast);
                    setCurrentPrice(fallback.currentPrice);
                    setError(err.message);
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        }

        fetchData();

        return () => {
            isMounted = false;
        };
    }, [commodity, region]);

    return { observed, forecast, currentPrice, loading, error };
}
