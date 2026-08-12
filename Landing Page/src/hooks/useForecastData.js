import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export function useForecastData(commodity = 'tomato', region = 'national') {
    const [observed, setObserved] = useState([]);
    const [forecast, setForecast] = useState([]);
    const [currentPrice, setCurrentPrice] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true);
                
                // 1. Fetch Current Price
                const { data: currentData, error: currentErr } = await supabase
                    .from('current_prices')
                    .select('price')
                    .eq('commodity', commodity)
                    .eq('region', region)
                    .order('created_at', { ascending: false })
                    .limit(1)
                    .single();
                
                if (currentErr && currentErr.code !== 'PGRST116') {
                    console.error("Error fetching current price:", currentErr);
                } else if (currentData) {
                    setCurrentPrice(currentData.price);
                }

                // 2. Fetch Historical Observed Prices (Last 30 days)
                const { data: obsData, error: obsErr } = await supabase
                    .from('historical_prices')
                    .select('price')
                    .eq('commodity', commodity)
                    .eq('region', region)
                    .order('date', { ascending: false })
                    .limit(30);
                
                if (obsErr) throw obsErr;
                
                if (obsData && obsData.length > 0) {
                    // Supabase returns newest first due to order by desc, so we reverse it
                    setObserved(obsData.map(row => row.price).reverse());
                }

                // 3. Fetch Forecast Prices
                const today = new Date().toISOString().split('T')[0];
                const { data: forecastData, error: forecastErr } = await supabase
                    .from('predictions')
                    .select('target_date, p, lo, hi')
                    .eq('commodity', commodity)
                    .eq('region', region)
                    .gte('target_date', today)
                    .order('target_date', { ascending: true })
                    .limit(14);
                
                if (forecastErr) throw forecastErr;
                
                if (forecastData && forecastData.length > 0) {
                    // Map target_date array to sequential 'd' offset for the chart
                    const mappedForecast = forecastData.map((f, index) => ({
                        d: index + 1,
                        p: f.p,
                        lo: f.lo,
                        hi: f.hi
                    }));
                    setForecast(mappedForecast);
                }

            } catch (err) {
                console.error("Supabase fetch error:", err.message);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [commodity, region]);

    return { observed, forecast, currentPrice, loading, error };
}
