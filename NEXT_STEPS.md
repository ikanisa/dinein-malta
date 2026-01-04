# Next Steps - Implementation Roadmap

## ✅ Completed

1. **Gemini API Integration**
   - ✅ Updated Edge Function with Nano Banana image generation
   - ✅ All 11 actions implemented (discover, search, generate-image, etc.)
   - ✅ Menu item auto-image generation implemented
   - ✅ Venue image caching with weekly rotation

2. **Production Mode**
   - ✅ Demo mode removed
   - ✅ Location sharing always enabled
   - ✅ Fresh data fetching when location shared

3. **Image Caching**
   - ✅ Supabase storage implementation
   - ✅ Weekly rotation for venue images
   - ✅ Permanent storage for menu item images

4. **Scraper**
   - ✅ Robust scraper for Bolt Food and Wolt
   - ✅ Duplicate detection
   - ✅ Full menu extraction

---

## ⏳ Next Steps (Priority Order)

### 1. Deploy Gemini Edge Function 🔴 HIGH PRIORITY

**Why**: Needed for venue discovery, image generation, and all AI features

**Steps**:
```bash
cd /Users/jeanbosco/workspace/dinein-malta
supabase functions deploy gemini-features --project-ref elhlcdiosomutugpneoc
```

**Verify**:
- Function appears in Supabase Dashboard > Edge Functions
- Test with a simple API call to verify it's working

**Files**: `supabase/functions/gemini-features/index.ts`

---

### 2. Apply Storage Migration 🔴 HIGH PRIORITY

**Why**: Needed for venue and menu item image storage

**Steps**:
1. Go to: https://supabase.com/dashboard/project/elhlcdiosomutugpneoc
2. Navigate to: **SQL Editor**
3. Copy contents of: `supabase/migrations/20250116000005_create_venue_images_storage.sql`
4. Paste and run the SQL

**Verify**:
- Go to Storage in Supabase Dashboard
- Verify `venue-images` bucket exists and is public

**Files**: `supabase/migrations/20250116000005_create_venue_images_storage.sql`

---

### 3. Set Gemini API Key 🔴 HIGH PRIORITY

**Why**: Edge Function needs API key to work

**Steps**:
```bash
supabase secrets set GEMINI_API_KEY=your_gemini_api_key_here --project-ref elhlcdiosomutugpneoc
```

**Get API Key**: https://aistudio.google.com/app/apikey

---

### 4. Test Restaurant Scraper 🟡 MEDIUM PRIORITY

**Why**: Populate database with real restaurant data and menus

**Steps**:
```bash
cd scripts
npm install
npx playwright install chromium
# Create .env file with Supabase credentials
npm run scrape
```

**Expected Time**: 40-60 minutes

**Verify**:
- Check Supabase Dashboard > Table Editor > `vendors` table
- Check `menu_items` table has items
- Verify no duplicate restaurants

**Files**: `scripts/scrape-restaurants.ts`

---

### 5. Test Image Generation 🟡 MEDIUM PRIORITY

**Why**: Verify Nano Banana is working for venue and menu item images

**Steps**:
1. Open app at http://localhost:3000
2. Share location - venues should appear
3. Check if venue images are generated and cached
4. Create a menu item in vendor dashboard - check if image is auto-generated

**Verify**:
- Images appear in Supabase Storage > `venue-images` bucket
- Images load in the app
- No API errors in browser console

---

### 6. Test Production Features 🟢 LOW PRIORITY

**Why**: Verify everything works end-to-end

**Test Checklist**:
- [ ] Location sharing works
- [ ] Venues appear when location shared
- [ ] Venue images load
- [ ] Menu items can be created with auto-generated images
- [ ] Orders can be placed
- [ ] Vendor dashboard shows orders

---

## Quick Deploy Commands

### All-in-One Deploy (if you have everything ready)

```bash
# 1. Deploy Gemini Function
supabase functions deploy gemini-features --project-ref elhlcdiosomutugpneoc

# 2. Set API Key
supabase secrets set GEMINI_API_KEY=your_key_here --project-ref elhlcdiosomutugpneoc

# 3. Apply Storage Migration (via Dashboard SQL Editor)
# Copy contents of: supabase/migrations/20250116000005_create_venue_images_storage.sql

# 4. Run Scraper (optional, in separate terminal)
cd scripts && npm run scrape
```

---

## Current System Status

### ✅ Working
- Frontend app (localhost:3000)
- Database schema (vendors, menu_items, orders, etc.)
- Edge Functions code (ready to deploy)
- Image caching logic (ready to use)
- Scraper script (ready to run)

### ⏳ Needs Deployment
- Gemini Edge Function (needs deploy)
- Storage bucket (needs migration)
- Gemini API key (needs secret)

### 📊 Data
- Database tables exist
- No restaurant data yet (will be added by scraper)
- Ready to accept vendor registrations

---

## Recommended Order

1. **Deploy Gemini Function** (5 min)
2. **Set API Key** (2 min)
3. **Apply Storage Migration** (2 min)
4. **Test Image Generation** (10 min)
5. **Run Scraper** (40-60 min, can run in background)
6. **Test Full Flow** (15 min)

**Total Time**: ~1.5-2 hours for everything

---

## Troubleshooting

If something doesn't work:
1. Check Supabase Dashboard for errors
2. Check browser console for frontend errors
3. Check Edge Function logs in Supabase Dashboard
4. Verify environment variables are set correctly
5. Verify API keys have proper permissions

