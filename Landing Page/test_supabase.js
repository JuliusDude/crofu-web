import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fufrtrjaqxczdbbtcrmb.supabase.co';
const supabaseKey = 'sb_publishable_OIX7JvQWQ41ciWaYmHb14Q_gpRCqOre';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSupabase() {
    console.log("Testing connection to Supabase...");
    
    try {
        const { data, error } = await supabase
            .from('historical_prices')
            .select('*')
            .limit(1);
            
        if (error) {
            console.error("❌ Error fetching from historical_prices:");
            console.error(error);
        } else {
            console.log("✅ Successfully connected! 'historical_prices' table exists.");
            console.log("Data returned:", data);
        }
        
        const { data: pData, error: pError } = await supabase
            .from('predictions')
            .select('*')
            .limit(1);
            
        if (pError) {
            console.error("❌ Error fetching from predictions:");
            console.error(pError);
        } else {
            console.log("✅ Successfully connected! 'predictions' table exists.");
            console.log("Data returned:", pData);
        }

    } catch (err) {
        console.error("❌ Unexpected Error:", err);
    }
}

testSupabase();
