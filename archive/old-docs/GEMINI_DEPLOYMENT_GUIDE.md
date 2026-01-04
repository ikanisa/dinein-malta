# 🚀 Gemini API Deployment Guide

## Prerequisites

1. **Gemini API Key**
   - Get your API key from: https://aistudio.google.com/app/apikey
   - Keep it secure (never commit to git)

2. **Supabase CLI**
   - Ensure Supabase CLI is installed
   - Link to your project: `supabase link --project-ref YOUR_PROJECT_REF`

---

## Deployment Steps

### Step 1: Set Environment Variable

Set the Gemini API key as a Supabase secret:

```bash
# Option 1: Using API_KEY (preferred if using existing implementation)
supabase secrets set API_KEY=your_gemini_api_key_here

# Option 2: Using GEMINI_API_KEY (also supported)
supabase secrets set GEMINI_API_KEY=your_gemini_api_key_here
```

**Note:** The Edge Function supports both `API_KEY` and `GEMINI_API_KEY` for flexibility.

### Step 2: Deploy Edge Function

Deploy the `gemini-features` Edge Function:

```bash
cd supabase/functions/gemini-features
supabase functions deploy gemini-features
```

Or from project root:

```bash
supabase functions deploy gemini-features --project-ref YOUR_PROJECT_REF
```

### Step 3: Verify Deployment

Test the function:

```bash
curl -X POST https://YOUR_PROJECT_REF.supabase.co/functions/v1/gemini-features \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"action": "discover", "payload": {"lat": 35.8989, "lng": 14.5146}}'
```

---

## Configuration

### Environment Variables

The Edge Function looks for the API key in this order:
1. `process.env.API_KEY` (Deno environment)
2. `process.env.GEMINI_API_KEY` (Deno environment)
3. `Deno.env.get('GEMINI_API_KEY')` (Deno env)

### Supported Actions

All actions are available once deployed:
- `discover` - Find nearby venues
- `search` - Search venues
- `enrich-profile` - Enrich venue data
- `market-insights` - Get market trends
- `venue-insights` - Get venue insights
- `parse-menu` - Parse menu from image
- `smart-description` - Generate descriptions
- `adapt` - Adapt UI to location
- `recommend` - AI recommendations
- `generate-image` - Generate images
- `edit-image` - Edit images

---

## Testing

### Test Each Action

```bash
# 1. Discover nearby venues
curl -X POST https://YOUR_PROJECT_REF.supabase.co/functions/v1/gemini-features \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"action": "discover", "payload": {"lat": 35.8989, "lng": 14.5146}}'

# 2. Search venues
curl -X POST https://YOUR_PROJECT_REF.supabase.co/functions/v1/gemini-features \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"action": "search", "payload": {"query": "restaurants in Valletta"}}'

# 3. Get market insights
curl -X POST https://YOUR_PROJECT_REF.supabase.co/functions/v1/gemini-features \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"action": "market-insights", "payload": {"category": "cocktail bars"}}'
```

---

## Monitoring

### Check Logs

```bash
supabase functions logs gemini-features
```

### Monitor Usage

- Check Gemini API usage in Google AI Studio
- Monitor Edge Function invocations in Supabase Dashboard
- Set up alerts for high error rates

---

## Troubleshooting

### Error: "GEMINI_API_KEY not configured"

**Solution:** Set the secret:
```bash
supabase secrets set API_KEY=your_key
```

### Error: "Method not allowed"

**Solution:** Ensure you're using POST method

### Error: "Missing 'action' field"

**Solution:** Include `action` in request body:
```json
{"action": "discover", "payload": {...}}
```

### Error: API rate limits

**Solution:** 
- Implement rate limiting in Edge Function
- Add caching for expensive operations
- Consider upgrading Gemini API tier

---

## Best Practices

1. **API Key Security**
   - Never commit API keys to git
   - Use Supabase secrets for storage
   - Rotate keys periodically

2. **Rate Limiting**
   - Implement client-side rate limiting
   - Cache expensive operations
   - Use database fallbacks

3. **Error Handling**
   - Always have fallbacks
   - Log errors for debugging
   - Provide user-friendly messages

4. **Performance**
   - Cache results when appropriate
   - Use appropriate models (flash vs pro)
   - Optimize prompts

---

## Production Checklist

- [ ] API key set as Supabase secret
- [ ] Edge Function deployed
- [ ] All actions tested
- [ ] Error handling verified
- [ ] Fallbacks working
- [ ] Monitoring set up
- [ ] Rate limiting implemented (if needed)
- [ ] Documentation updated

---

**Last Updated:** 2025-01-16

