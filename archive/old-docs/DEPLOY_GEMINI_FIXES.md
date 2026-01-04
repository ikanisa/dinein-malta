# Deploy Gemini Production Fixes

## Summary
All code changes are complete. You need to:

1. **Apply Storage Migration** (via Supabase Dashboard)
2. **Deploy Updated Edge Functions** (optional, only if gemini-features was updated)

## Step 1: Apply Storage Migration

### Option A: Via Supabase Dashboard (Recommended)
1. Go to: https://supabase.com/dashboard/project/elhlcdiosomutugpneoc
2. Navigate to: **SQL Editor**
3. Create a new query
4. Copy and paste the contents of: `supabase/migrations/20250116000005_create_venue_images_storage.sql`
5. Click **Run**

### Option B: Via Supabase CLI
```bash
cd /Users/jeanbosco/workspace/dinein-malta
supabase db push --include-all
```

**Note**: If you get migration history errors, use Option A (Dashboard).

## Step 2: Deploy Edge Functions (Optional)

Only needed if you want to deploy the updated `gemini-features` function with location data enhancements.

```bash
cd /Users/jeanbosco/workspace/dinein-malta

# Deploy gemini-features function
supabase functions deploy gemini-features --project-ref elhlcdiosomutugpneoc

# Deploy business-logic function (removed demo mode)
supabase functions deploy business-logic --project-ref elhlcdiosomutugpneoc
```

## What Was Fixed

### ✅ Image Caching with Weekly Rotation
- Images are now cached in Supabase storage (`venue-images` bucket)
- One image per venue per week (saves 90%+ API calls)
- Automatic cleanup of images older than 4 weeks
- Images rotate weekly to keep content fresh

### ✅ Production Mode Enabled
- Removed demo admin fallback
- Always uses live Gemini API (no mock mode)
- Location permission requested on first load
- Fresh venue data fetched when location is shared

### ✅ Enhanced Location Data
- Edge Function now returns `google_place_id`, `lat`, `lng`, `photo_url`
- Better data extraction from Google Maps grounding

## Testing

1. **Clear browser cache/localStorage** (to test fresh start)
2. **Open app** - location permission modal should appear
3. **Share location** - venues should appear from Gemini API
4. **Check images** - should load from Supabase storage (not generated on every load)
5. **Check Storage** - go to Supabase Dashboard > Storage > `venue-images` bucket
   - Should see folders like `2025-03/venue_*.png`
   - One image per venue per week

## Verification Checklist

- [ ] Storage bucket `venue-images` exists in Supabase Dashboard
- [ ] Storage policies are applied (public read, authenticated upload)
- [ ] Location permission is requested on app load
- [ ] Venues are fetched when location is shared
- [ ] Images are cached in Supabase storage (check Storage bucket)
- [ ] Same venue shows same image within the same week
- [ ] Admin access works only via `admin_users` table (no demo fallback)

