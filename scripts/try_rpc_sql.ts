
import { createClient } from '@supabase/supabase-js';

// Hardcoded for reliable script execution
const supabaseUrl = 'https://elhlcdiosomutugpneoc.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVsaGxjZGlvc29tdXR1Z3BuZW9jIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODkwNTc1MywiZXhwIjoyMDc0NDgxNzUzfQ.INeWgLyQetYUZGQYiVx7GCB7fREKypaOfy-XEMhYi6A';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function testRpc() {
    console.log('Testing exec_sql RPC...');

    // Try to call exec_sql with a simple query
    const { data, error } = await supabase.rpc('exec_sql', {
        sql: 'SELECT 1 as result'
    });

    if (error) {
        console.error('RPC Failed:', error);
    } else {
        console.log('RPC Success!', data);
    }
}

testRpc().catch(console.error);
