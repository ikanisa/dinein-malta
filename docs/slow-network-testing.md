# Slow Network Testing Guide

Test procedures for validating app behavior under degraded network conditions.

---

## Chrome DevTools Throttling Profiles

| Profile | Download | Upload | Latency |
|---------|----------|--------|---------|
| Fast 3G | 1.5 Mbps | 750 Kbps | 560ms |
| Slow 3G | 500 Kbps | 500 Kbps | 2000ms |
| Offline | 0 | 0 | ∞ |
| Custom | N/A | N/A | Configurable |

### Access via DevTools
1. Open DevTools (F12)
2. Go to **Network** tab
3. Click **No throttling** dropdown
4. Select preset or **Add...** for custom

---

## Test Scenarios

### 1. Initial Page Load (Slow 3G)
- [ ] Loading skeleton/spinner appears within 500ms
- [ ] Content progressively renders (no blank screen)
- [ ] Title is visible before full content loads
- [ ] Critical above-the-fold content loads first

### 2. Navigation Under Latency
- [ ] Route changes show immediate feedback (loading indicator)
- [ ] Navigation doesn't appear frozen
- [ ] Back/forward navigation works correctly

### 3. Form Submission
- [ ] Submit button shows loading state
- [ ] Double-submit is prevented
- [ ] Success/error feedback after resume
- [ ] Timeout displays user-friendly error (not raw network error)

### 4. Real-time Features
- [ ] Order status updates handle reconnection
- [ ] Cart persists across disconnections
- [ ] Supabase realtime gracefully degrades

### 5. Offline Behavior
- [ ] Service worker serves cached assets
- [ ] Static pages accessible offline
- [ ] "You're offline" banner/toast appears
- [ ] Queued actions sync on reconnect

---

## Playwright Network Throttling

```typescript
// In test setup
await page.route('**/*', async (route) => {
  await new Promise(resolve => setTimeout(resolve, 500)); // 500ms delay
  await route.continue();
});

// Or use CDP
const client = await page.context().newCDPSession(page);
await client.send('Network.emulateNetworkConditions', {
  offline: false,
  downloadThroughput: 500 * 1024 / 8, // 500 Kbps
  uploadThroughput: 500 * 1024 / 8,
  latency: 2000, // 2s
});
```

---

## Manual Testing Steps

1. **Preparation**
   - Clear browser cache and service worker
   - Open DevTools Network tab

2. **Test Fast 3G**
   - Set throttle to "Fast 3G"
   - Navigate through: Home → Venue → Menu → Cart
   - Verify loading states appear appropriately
   - Time full page loads (target: <5s for FCP)

3. **Test Slow 3G**
   - Set throttle to "Slow 3G"
   - Submit a form (e.g., login or order)
   - Verify timeout handling after 15-30s
   - Check no duplicate submissions

4. **Test Offline**
   - Go offline in DevTools or airplane mode
   - Attempt navigation
   - Verify offline indicator appears
   - Go back online, verify state recovery

---

## Success Criteria

| Metric | Fast 3G | Slow 3G |
|--------|---------|---------|
| FCP | <3s | <8s |
| LCP | <5s | <15s |
| Form feedback | <1s | <3s |
| Error timeout | 15s | 30s |

---

## Reporting Issues

When reporting slow network issues, include:
- Throttle profile used
- Page/flow being tested
- Time to first feedback
- Screenshots of any blank/broken states
- Console errors (if any)
