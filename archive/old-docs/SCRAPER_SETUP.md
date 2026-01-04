# Restaurant Scraper Setup Guide

## Overview

Robust scraper to collect restaurants and bars from:
- **Bolt Food**: https://food.bolt.eu/en/324-valletta/
- **Wolt**: https://wolt.com/mt/discovery/restaurants

And feed them into Supabase database with full menu data.

## Features

✅ **Dual Source Scraping**: Scrapes both Bolt Food and Wolt  
✅ **Full Menu Extraction**: Gets all menu items with prices and categories  
✅ **Duplicate Detection**: 
   - Checks by google_place_id (source-specific)
   - Checks by name similarity (70% threshold)
   - Checks by address matching
✅ **Robust Error Handling**: Continues scraping even if individual restaurants fail  
✅ **Rate Limiting**: Built-in delays to avoid overwhelming sites  
✅ **Auto-scroll**: Handles dynamic content loading

## Setup Instructions

### 1. Install Dependencies

```bash
cd scripts
npm install
```

### 2. Install Playwright Browser

```bash
npx playwright install chromium
```

### 3. Configure Environment Variables

Create `.env` file in `scripts/` directory:

```bash
# Copy the example file
cp .env.example .env
```

Edit `.env` and add your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

**Important**: You need the **service role key** (not anon key) to bypass RLS and insert data directly.

### 4. Run the Scraper

```bash
npm run scrape
```

This will:
1. Scrape all restaurants from Bolt Food (Valletta)
2. Scrape all restaurants from Wolt (Malta)
3. Extract full menus for each restaurant
4. Save to Supabase (with duplicate detection)

## How Duplicate Detection Works

The scraper uses multiple strategies to avoid duplicates:

1. **Place ID Check**: Uses source-specific `google_place_id` (e.g., `bolt-12345` or `wolt-67890`)
2. **Name Similarity**: Normalizes names and checks for 70%+ similarity
3. **Address Matching**: If address is available, matches by location
4. **Menu Updates**: If restaurant exists, updates menu items instead of creating duplicates

## Data Extracted

For each restaurant:
- Name
- Address (if available)
- Phone (if available)
- Website (if available)
- Image URL
- Location (lat/lng if available)
- **Full menu**:
  - Item name
  - Description
  - Price (EUR)
  - Category (Appetizers, Mains, Desserts, Drinks, etc.)

## Database Schema Compliance

The scraper handles required fields:
- `google_place_id`: Generated as `{source}-{externalId}` (unique)
- `slug`: Generated from restaurant name (unique)
- `name`: Restaurant name
- `status`: Set to `active`
- Menu items saved to `menu_items` table

## Expected Runtime

- **Bolt Food**: ~20-30 minutes (depending on number of restaurants)
- **Wolt**: ~20-30 minutes
- **Total**: ~40-60 minutes

The scraper includes progress logging so you can monitor progress.

## Troubleshooting

### Missing Supabase Credentials
```
❌ Missing Supabase credentials!
```
**Solution**: Make sure `.env` file exists and has correct `VITE_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`

### Playwright Browser Not Found
```
Error: Executable doesn't exist
```
**Solution**: Run `npx playwright install chromium`

### Rate Limiting / Blocking
If scraping fails due to rate limiting:
- Increase delays in the script (currently 1000ms between restaurants)
- Run during off-peak hours
- Some sites may block automated scraping

### Schema Errors
If you get database schema errors:
- Verify the `vendors` table has required fields (`google_place_id`, `slug`)
- Check that `menu_items` table exists and has correct structure
- Ensure service role key has proper permissions

## Output

The scraper will log:
- Number of restaurants found on each site
- Progress for each restaurant being scraped
- Success/failure for each save operation
- Final summary: total saved, total skipped (duplicates)

Example output:
```
🔍 Scraping Bolt Food...
Found 45 restaurants on Bolt Food
Scraping restaurant 1/45: https://food.bolt.eu/...
✅ Saved restaurant: The Pub (ID: abc-123)
✅ Saved 23 menu items for vendor abc-123

📊 Total restaurants scraped: 87
   - Bolt Food: 45
   - Wolt: 42

✅ Scraping complete!
   - Saved: 75
   - Skipped (duplicates): 12
```

## Notes

- The scraper uses Playwright for robust JavaScript-heavy site handling
- Menu items are checked for duplicates before insertion
- Restaurants are set to `active` status by default
- Location data (lat/lng) may not always be available from the source sites
- Images are saved as URLs (not downloaded locally)

