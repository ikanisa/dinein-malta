# Quick Setup - Environment Variables

## Create .env File

In the `scripts/` directory, create a file named `.env` with these contents:

```env
VITE_SUPABASE_URL=https://elhlcdiosomutugpneoc.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

## Get Your Supabase Credentials

1. Go to: https://supabase.com/dashboard/project/elhlcdiosomutugpneoc/settings/api

2. Copy the **Project URL**:
   - It should be: `https://elhlcdiosomutugpneoc.supabase.co`

3. Copy the **service_role** key (NOT the anon key):
   - Find the `service_role` key in the API settings
   - Click "Reveal" to show it
   - Copy the entire key (it's a long string starting with `eyJ...`)

4. Paste both values into your `.env` file

## Quick Command

```bash
cd scripts

# Create .env file
cat > .env << 'EOF'
VITE_SUPABASE_URL=https://elhlcdiosomutugpneoc.supabase.co
SUPABASE_SERVICE_ROLE_KEY=paste_your_service_role_key_here
EOF

# Then edit .env and replace paste_your_service_role_key_here with your actual key
```

Or create it manually:
```bash
cd scripts
touch .env
# Then open .env in your editor and paste the two lines above
```

## Verify Setup

After creating .env file, try running the scraper again:
```bash
npm run scrape
```

