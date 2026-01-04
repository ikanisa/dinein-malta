# 🚀 Restaurant Scraper - Step-by-Step Guide

## Prerequisites Checklist

Before starting, make sure you have:
- ✅ Node.js installed (v18 or higher)
- ✅ Supabase project credentials
- ✅ Service role key (not anon key!)

---

## Step 1: Navigate to Scripts Directory

```bash
cd /Users/jeanbosco/workspace/dinein-malta/scripts
```

---

## Step 2: Install Dependencies

```bash
npm install
```

This will install:
- Playwright (for web scraping)
- Supabase client
- TypeScript and tsx (for running TypeScript)

**Expected time**: 1-2 minutes

---

## Step 3: Install Playwright Browser

Playwright needs to download a browser to scrape websites:

```bash
npx playwright install chromium
```

**Expected time**: 2-3 minutes (downloads ~200MB)

---

## Step 4: Get Your Supabase Credentials

You need **two things** from Supabase:

1. **Supabase URL**
   - Go to: https://supabase.com/dashboard/project/elhlcdiosomutugpneoc
   - Go to: Settings → API
   - Copy the "Project URL" (looks like: `https://xxxxx.supabase.co`)

2. **Service Role Key** ⚠️ **IMPORTANT**
   - In the same page (Settings → API)
   - Find "service_role" key (NOT the anon key!)
   - Click "Reveal" to show it
   - Copy the entire key (starts with `eyJ...`)

**Why service role?** The scraper needs admin privileges to insert data directly into the database, bypassing RLS policies.

---

## Step 5: Create .env File

Create a file named `.env` in the `scripts/` directory:

```bash
# In the scripts/ directory
touch .env
```

Or create it manually in your editor.

Then add these lines (replace with your actual values):

```env
VITE_SUPABASE_URL=https://elhlcdiosomutugpneoc.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

**Example:**
```env
VITE_SUPABASE_URL=https://elhlcdiosomutugpneoc.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVsaGxjZGlvc29tdXR1Z3BuZW9jIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcwMDAwMDAwMCwiZXhwIjoyMDAwMDAwMDB9.xxx
```

**Important Notes:**
- ⚠️ Never commit `.env` file to git (it's already in .gitignore)
- ⚠️ Keep your service role key secret
- ✅ The file should be in `scripts/.env` (not in the root)

---

## Step 6: Verify Setup

Check that everything is installed:

```bash
# Check Node.js version (should be 18+)
node --version

# Check npm packages are installed
ls node_modules | head -5

# Check Playwright browser is installed
npx playwright --version
```

---

## Step 7: Run the Scraper! 🎉

```bash
npm run scrape
```

**What happens:**
1. Scraper starts and connects to Supabase
2. Opens browser and navigates to Bolt Food
3. Finds all restaurant links
4. Scrapes each restaurant page (name, address, menu, etc.)
5. Repeats for Wolt
6. Saves everything to Supabase database

**Expected output:**
```
🚀 Starting restaurant scraping...
🔍 Scraping Bolt Food...
Found 45 restaurants on Bolt Food
Scraping restaurant 1/45: https://food.bolt.eu/...
✅ Saved restaurant: The Pub (ID: abc-123)
✅ Saved 23 menu items for vendor abc-123
...
🔍 Scraping Wolt...
Found 42 restaurants on Wolt
...
📊 Total restaurants scraped: 87
   - Bolt Food: 45
   - Wolt: 42

✅ Scraping complete!
   - Saved: 75
   - Skipped (duplicates): 12
```

**Expected time**: 40-60 minutes (depends on number of restaurants)

---

## Step 8: Monitor Progress

The scraper will:
- ✅ Show progress for each restaurant
- ✅ Log successes and failures
- ✅ Continue even if some restaurants fail
- ✅ Show final summary

You can leave it running - it will complete automatically.

---

## Step 9: Verify Results

After scraping completes, verify in Supabase:

1. **Check Restaurants:**
   - Go to: Supabase Dashboard → Table Editor → `vendors`
   - You should see all scraped restaurants
   - Check `status` is `active`

2. **Check Menu Items:**
   - Go to: Table Editor → `menu_items`
   - Should see menu items for each restaurant
   - Check `vendor_id` links to vendors

3. **Check for Duplicates:**
   - In `vendors` table, search for similar names
   - The scraper should have avoided duplicates
   - If you see duplicates, they likely have different addresses

---

## Troubleshooting

### Error: "Missing Supabase credentials"
**Solution**: Check your `.env` file exists and has correct values

### Error: "Executable doesn't exist" (Playwright)
**Solution**: Run `npx playwright install chromium` again

### Error: "Permission denied" or RLS error
**Solution**: Make sure you're using **service_role** key, not anon key

### Scraper is very slow
**Solution**: This is normal! It includes delays to avoid rate limiting. Be patient.

### Some restaurants failed to scrape
**Solution**: This is normal. Some sites may block scraping or have different layouts. The scraper continues with others.

### No restaurants found
**Solution**: 
- Check your internet connection
- The websites might have changed their structure
- Try running again (sometimes sites load differently)

---

## Advanced Options

### Scrape Only One Source

If you want to test with just one source first:

```bash
# Scrape only Bolt Food
npm run scrape:bolt

# Scrape only Wolt
npm run scrape:wolt
```

(Note: These commands need to be added to package.json first)

### Stop Scraper Early

Press `Ctrl+C` to stop. Already scraped restaurants will be saved.

---

## Next Steps After Scraping

Once scraping is complete:

1. ✅ **Verify Data**: Check Supabase tables are populated
2. ✅ **Test App**: Open your app and verify restaurants appear
3. ✅ **Check Images**: Venues should load (if you've set up image generation)
4. ✅ **Test Menu**: Verify menu items are visible for each restaurant

---

## Quick Command Reference

```bash
# Setup (first time only)
cd scripts
npm install
npx playwright install chromium

# Create .env file with your credentials
# (see Step 5 above)

# Run scraper
npm run scrape

# Verify in Supabase Dashboard
# → Table Editor → vendors
# → Table Editor → menu_items
```

---

## Need Help?

If you encounter issues:
1. Check the error message carefully
2. Verify your `.env` file has correct credentials
3. Make sure Playwright browser is installed
4. Check Supabase Dashboard for any errors
5. Review the scraper logs for specific failures

