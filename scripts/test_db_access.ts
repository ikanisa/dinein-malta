
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://elhlcdiosomutugpneoc.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVsaGxjZGlvc29tdXR1Z3BuZW9jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5MDU3NTMsImV4cCI6MjA3NDQ4MTc1M30.d92ZJG5E_9r7bOlRLBXRI6gcB_7ERVbL-Elp7fk4avY";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function test() {
    console.log('Testing access to vendors with ANON KEY...');
    const { count, error } = await supabase
        .from('vendors')
        .select('*', { count: 'exact', head: true });

    if (error) {
        console.error('Error fetching vendors:', error);
        process.exit(1);
    }

    console.log(`Success! Total Vendors in DB: ${count}`);
    // Expecting > 200 now
}

test().catch(console.error);
