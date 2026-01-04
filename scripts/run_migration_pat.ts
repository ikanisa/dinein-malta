
import fs from 'fs';
import path from 'path';

const PAT = 'sbp_dd40bc4bf0d8ac54d0c51f47e40c6a29b3579ec8';
const PROJECT_REF = 'elhlcdiosomutugpneoc';

async function runMigration() {
    console.log('🚀 Starting Migration via Management API...');

    // Read the SQL file
    const sqlPath = path.resolve(process.cwd(), 'supabase/migrations/20260104000000_remove_country_constraint.sql');
    const sql = fs.readFileSync(sqlPath, 'utf-8');

    console.log(`Reading SQL from: ${sqlPath}`);
    console.log('SQL Content:', sql.trim());

    // Execute via Supabase Management API (Corrected Endpoint)
    const response = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${PAT}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query: sql })
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Migration Failed: ${response.status} ${response.statusText}`);
        console.error('Error Details:', errorText);
        process.exit(1);
    }

    const result = await response.json();
    console.log('✅ Migration executed successfully!');
    console.log('Result:', JSON.stringify(result, null, 2));
}

runMigration().catch((err) => {
    console.error('Unexpected Error:', err);
    process.exit(1);
});
