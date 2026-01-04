# Restaurant Scraper for Malta

Robust scraper to collect restaurants and bars from Bolt Food and Wolt, then feed them into Supabase.

## Setup

1. **Install dependencies:**
   ```bash
   cd scripts
   npm install
   ```

2. **Install Playwright browsers:**
   ```bash
   npx playwright install chromium
   ```

3. **Configure environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env and add your Supabase credentials
   ```

4. **Run the scraper:**
   ```bash
   npm run scrape
   ```

## Features

- ✅ Scrapes restaurants from Bolt Food (Valletta)
- ✅ Scrapes restaurants from Wolt (Malta)
- ✅ Extracts full menu with prices
- ✅ Duplicate detection (checks name similarity)
- ✅ Saves to Supabase vendors and menu_items tables
- ✅ Robust error handling and rate limiting

## How It Works

1. **Scraping**: Uses Playwright to navigate and extract data from both sites
2. **Duplicate Detection**: 
   - Normalizes restaurant names
   - Checks similarity (70% threshold)
   - Matches by name and address
3. **Data Storage**:
   - Creates vendor records in `vendors` table
   - Creates menu items in `menu_items` table
   - Updates existing restaurants if duplicates found

## Data Extracted

For each restaurant:
- Name
- Address
- Phone
- Image URL
- Menu items (name, description, price, category)

## Notes

- The scraper includes rate limiting to avoid overwhelming the sites
- Duplicate detection prevents the same restaurant from being added twice
- If a restaurant already exists, only menu items are updated
- Scraping may take 30-60 minutes depending on number of restaurants

## Troubleshooting

If scraping fails:
1. Check your Supabase credentials are correct
2. Verify network connectivity
3. Some sites may block automated scraping - try running during off-peak hours
4. Check browser console for errors

