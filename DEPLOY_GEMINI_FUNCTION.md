# Deploy Gemini Features Edge Function

## Quick Deploy

```bash
cd /Users/jeanbosco/workspace/dinein-malta

# Deploy the function
supabase functions deploy gemini-features --project-ref elhlcdiosomutugpneoc
```

## Set API Key (if not already set)

```bash
# Set the Gemini API key as a Supabase secret
supabase secrets set GEMINI_API_KEY=your_api_key_here --project-ref elhlcdiosomutugpneoc
```

## Verify Deployment

The function should now support all these actions:

1. ✅ `discover` - Find nearby venues (Google Maps grounding)
2. ✅ `search` - Search venues by query (Google Maps + Search)
3. ✅ `enrich-profile` - Enrich venue profile (Google Search)
4. ✅ `market-insights` - Get market trends (Google Search)
5. ✅ `venue-insights` - Get venue-specific insights (Google Search)
6. ✅ `parse-menu` - Parse menu from image (Vision API)
7. ✅ `smart-description` - Generate descriptions (Text AI)
8. ✅ `adapt` - Adapt UI to location (Google Maps)
9. ✅ `recommend` - AI concierge recommendations (Google Maps + Search)
10. ✅ `generate-image` - Generate images (Imagen API / Gemini)
11. ✅ `edit-image` - Edit existing images (Vision API)

## Test the Function

```bash
curl -X POST https://elhlcdiosomutugpneoc.supabase.co/functions/v1/gemini-features \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "discover",
    "payload": {
      "lat": 35.8989,
      "lng": 14.5146
    }
  }'
```

## Notes

- Image generation may require Imagen API access (separate from Gemini API)
- If image generation fails, it will return `null`
- All other actions should work with standard Gemini API access

