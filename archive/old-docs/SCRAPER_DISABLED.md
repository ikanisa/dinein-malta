# 🚫 Restaurant Scraper - DISABLED

**Status:** Temporarily disabled to focus on production deployment

**Reason:** Scraper was slowing down the computer. We'll resume scraping later once apps are deployed and stable.

---

## What Was Disabled

- `scripts/scrape-restaurants.ts` → Renamed to `scrape-restaurants.ts.disabled`
- Related tasks marked as cancelled in TODO list

---

## To Re-enable Later

1. Rename the file back:
   ```bash
   cd scripts
   mv scrape-restaurants.ts.disabled scrape-restaurants.ts
   ```

2. Make sure dependencies are installed:
   ```bash
   cd scripts
   npm install
   ```

3. Ensure Playwright browser is installed:
   ```bash
   npx playwright install chromium
   ```

4. Check `.env` file has Supabase credentials:
   ```env
   VITE_SUPABASE_URL=https://elhlcdiosomutugpneoc.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your_key_here
   ```

5. Run the scraper:
   ```bash
   npm run scrape
   ```

---

## Current Focus

✅ **Production Deployment Priority:**
1. Fix DB errors (RLS policies)
2. Get all 3 apps running in production
3. Test and verify production deployment
4. Populate data manually or via admin panel if needed

---

**Note:** We can populate the vendors table manually through:
- Supabase Dashboard (SQL Editor)
- Admin panel in the app (once deployed)
- Or run the scraper later when ready

