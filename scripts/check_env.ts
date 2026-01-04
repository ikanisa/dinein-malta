
// Check for common Supabase env vars safely
const keys = [
    'SUPABASE_ACCESS_TOKEN',
    'SUPABASE_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'PAT',
    'DATABASE_URL',
    'PGPASSWORD'
];

console.log('Environment Check:');
keys.forEach(key => {
    if (process.env[key]) {
        console.log(`${key}: Found (Length: ${process.env[key].length})`);
    } else {
        console.log(`${key}: Not Found`);
    }
});
