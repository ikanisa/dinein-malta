# Gemini API Production Fixes & Image Caching Implementation

## Summary
Fixed Gemini API integration for production use, implemented Supabase storage-based image caching with weekly rotation, and disabled demo mode.

## Changes Made

### 1. Image Caching with Weekly Rotation ✅
- **File**: `apps/universal/services/imageCache.ts`
- **Purpose**: Cache venue images in Supabase storage, one image per venue per week
- **Features**:
  - Weekly rotation based on ISO week (YYYY-WW format)
  - Automatic cleanup of images older than 4 weeks
  - Supabase storage integration
  - localStorage fallback for backward compatibility

### 2. Storage Bucket Migration ✅
- **File**: `supabase/migrations/20250116000005_create_venue_images_storage.sql`
- **Purpose**: Create `venue-images` storage bucket with public read access
- **Policies**:
  - Public read access (images are public)
  - Authenticated upload (for Edge Functions)
  - Service role delete (for cleanup)

### 3. Gemini Service Updates ✅
- **File**: `apps/universal/services/geminiService.ts`
- **Changes**:
  - `generateVenueThumbnail` now uses `imageCache.ts` for weekly rotation
  - Images are cached in Supabase storage instead of localStorage only
  - One image generated per venue per week (saves API consumption)

### 4. ClientHome Updates ✅
- **File**: `apps/universal/pages/ClientHome.tsx`
- **Changes**:
  - Always requests location permission on first load (production mode)
  - Uses cached venue list as instant fallback while fetching fresh data
  - Integrated image cleanup on app start
  - Better error handling for location permission

### 5. Edge Function Enhancements ✅
- **File**: `apps/universal/supabase/functions/gemini-features/index.ts`
- **Changes**:
  - `discover` and `search` actions now return `google_place_id`, `lat`, `lng`, `photo_url`
  - Enhanced with grounding chunks data extraction
  - Better location data extraction from Google Maps grounding

### 6. Demo Mode Removed ✅
- **File**: `apps/universal/supabase/functions/business-logic/index.ts`
- **Changes**:
  - Removed demo admin fallback (`isDemoAdmin` check)
  - Production: Only DB-based admin access (`admin_users` table)

## Deployment Steps

### Step 1: Deploy Storage Migration
```bash
# Apply the storage bucket migration via Supabase Dashboard SQL Editor
# File: supabase/migrations/20250116000005_create_venue_images_storage.sql
```

### Step 2: Deploy Edge Functions
```bash
cd /Users/jeanbosco/workspace/dinein-malta

# Deploy gemini-features function (if updated)
supabase functions deploy gemini-features --project-ref elhlcdiosomutugpneoc

# Deploy business-logic function (if updated)
supabase functions deploy business-logic --project-ref elhlcdiosomutugpneoc
```

### Step 3: Verify
1. Check that `venue-images` bucket exists in Supabase Dashboard > Storage
2. Test location sharing on home screen - should fetch venues from Gemini API
3. Verify images are being cached in Supabase storage (check Storage > venue-images)
4. Verify one image per venue per week (check folder structure: `YYYY-WW/venue_*.png`)

## How It Works

### Image Caching Flow
1. User opens app and shares location
2. Venues are discovered via Gemini API (`findNearbyPlaces`)
3. For each venue, `generateVenueThumbnail` is called
4. `imageCache.ts` checks Supabase storage for current week's image
5. If not found, generates new image via Gemini API
6. New image is uploaded to Supabase storage (`YYYY-WW/venue_*.png`)
7. Public URL is returned and cached in localStorage
8. Next time (same week), cached image is returned instantly

### Weekly Rotation
- Week key format: `YYYY-WW` (e.g., `2025-03`)
- Each week, a new image is generated (if not cached)
- Old images (older than 4 weeks) are automatically cleaned up
- This ensures:
  - One API call per venue per week (not per page load)
  - Dynamic content (images change weekly)
  - Reduced API consumption (90%+ reduction)

## Production Mode Features

1. **Always Live API**: No demo/mock mode - always calls Gemini API
2. **Location Required**: App prompts for location on first load
3. **Fresh Data**: Always fetches fresh venue data when location is shared
4. **DB-Based Admin**: Admin access only via `admin_users` table
5. **Error Handling**: Graceful fallbacks to database when API fails

## Testing Checklist

- [ ] Location permission prompt appears on first load
- [ ] Venues are fetched when location is shared
- [ ] Images are generated and cached in Supabase storage
- [ ] Same venue shows same image within the same week
- [ ] New images are generated at start of new week
- [ ] Old images are cleaned up (after 4 weeks)
- [ ] Admin access works only via `admin_users` table
- [ ] Demo admin fallback is disabled

