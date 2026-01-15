# Client UI/UX Refactoring - Test Checklist

## Overview
This document outlines the testing scenarios for validating the client UI/UX refactoring implementation.

## Test Environment Setup
- [ ] Clear browser cache and service worker
- [ ] Open app in incognito/private window
- [ ] Verify service worker is registered (Check DevTools > Application > Service Workers)
- [ ] Check network throttling available (for offline testing)

---

## Test Scenario 1: QR Scan Flow (Target: < 60 seconds)

### Steps:
1. [ ] Navigate to root `/` - should redirect to `/scan`
2. [ ] Verify QR scanner page loads
3. [ ] Test QR code scanning with format: `/v/{slug}/t/{tableCode}`
4. [ ] Test QR code scanning with format: `/menu/{venueId}/t/{tableCode}`
5. [ ] Test manual venue code entry
6. [ ] Verify navigation to menu page with correct venue and table code
7. [ ] Check that table code is pre-filled in order review modal

### Expected Results:
- QR scanner should load in < 1 second
- QR codes should parse correctly and navigate to menu
- Table code should be visible in header/order review
- Total time from scan to menu visible: < 5 seconds

---

## Test Scenario 2: Menu Browsing & Ordering (Target: < 2 minutes total)

### Steps:
1. [ ] Verify menu loads with categories
2. [ ] Test category filtering (horizontal scroll chips)
3. [ ] Test adding items to cart (tap + button)
4. [ ] Verify cart count updates in bottom bar
5. [ ] Test favorites toggle (star icon on menu items)
6. [ ] Test favorites filter (bottom bar star button)
7. [ ] Test cart review modal (tap cart in bottom bar)
8. [ ] Verify table code input is required
9. [ ] Test order submission (Cash payment)
10. [ ] Verify order confirmation screen shows
11. [ ] Check order status updates in real-time

### Expected Results:
- Menu should load in < 1 second (cached after first load)
- Category filtering should work smoothly
- Cart should persist across page refreshes
- Favorites should save and filter correctly
- Order submission should complete in < 30 seconds
- Order status should update without refresh

---

## Test Scenario 3: Repeat Customer Flow (Target: < 20 seconds)

### Steps:
1. [ ] Open menu for previously visited venue
2. [ ] Test favorites filter shows saved items
3. [ ] Add favorite item to cart (1 tap)
4. [ ] Submit order quickly
5. [ ] Verify order history in Settings page

### Expected Results:
- Menu should load instantly from cache
- Favorites should be visible and filterable
- Order submission should be quick for repeat customers
- Order history should show previous orders

---

## Test Scenario 4: Offline Functionality

### Steps:
1. [ ] Load menu page while online
2. [ ] Turn off network (offline mode)
3. [ ] Refresh page
4. [ ] Verify menu still loads from cache
5. [ ] Test adding items to cart offline
6. [ ] Verify cart persists
7. [ ] Turn network back on
8. [ ] Verify order can be submitted (queued orders sync)

### Expected Results:
- Menu should load from service worker cache when offline
- Cart should work offline
- Orders should queue and sync when back online
- No error messages about offline state (graceful degradation)

---

## Test Scenario 5: Settings & Order History

### Steps:
1. [ ] Navigate to Settings page (gear icon in header)
2. [ ] Verify Order History section shows recent orders
3. [ ] Test clicking on order in history
4. [ ] Verify order details page loads
5. [ ] Test favorites management (remove favorite)
6. [ ] Test preferences (dark mode toggle, notifications)
7. [ ] Verify back navigation works

### Expected Results:
- Settings page should load correctly
- Order history should show all recent orders
- Order details should match order confirmation
- Favorites management should work
- Preferences should persist

---

## Test Scenario 6: Navigation & Routes

### Steps:
1. [ ] Verify root `/` redirects to `/scan`
2. [ ] Verify `/profile` redirects to `/settings`
3. [ ] Test menu route `/v/:venueId/t/:tableCode`
4. [ ] Test order route `/order/:id`
5. [ ] Test settings route `/settings`
6. [ ] Verify back button navigation
7. [ ] Verify no bottom navigation tabs visible
8. [ ] Check CartBar only shows on menu page

### Expected Results:
- All routes should work correctly
- Redirects should function properly
- Navigation should be intuitive
- No broken links or 404s

---

## Test Scenario 7: Performance Metrics

### Measurement Points:
- [ ] **LCP (Largest Contentful Paint)**: Should be < 1.5s
- [ ] **FID (First Input Delay)**: Should be < 50ms
- [ ] **CLS (Cumulative Layout Shift)**: Should be < 0.05
- [ ] **Bundle Size**: Initial JS should be < 150KB gzipped
- [ ] **Lighthouse Score**: 
  - Performance: 95+
  - Accessibility: 100
  - Best Practices: 100
  - SEO: 90+

### How to Test:
1. Open Chrome DevTools > Lighthouse
2. Run audit on menu page
3. Verify all scores meet targets
4. Check bundle size in Network tab (JS files)
5. Measure Core Web Vitals in Performance tab

---

## Test Scenario 8: Accessibility

### Keyboard Navigation:
- [ ] Tab through all interactive elements
- [ ] Verify focus indicators are visible
- [ ] Test Enter/Space to activate buttons
- [ ] Verify skip links work

### Screen Reader:
- [ ] Test with VoiceOver (Mac) or NVDA (Windows)
- [ ] Verify all images have alt text
- [ ] Check ARIA labels on buttons
- [ ] Verify form labels are announced
- [ ] Test order review modal with screen reader

### Visual:
- [ ] Verify color contrast ratios (4.5:1 minimum)
- [ ] Test with browser zoom at 200%
- [ ] Verify text is readable at all sizes
- [ ] Check focus indicators are visible

---

## Test Scenario 9: Browser Compatibility

### Test on:
- [ ] Chrome (latest)
- [ ] Safari (latest iOS and macOS)
- [ ] Firefox (latest)
- [ ] Edge (latest)

### Verify:
- [ ] Service worker registers
- [ ] PWA install prompt works
- [ ] Offline functionality works
- [ ] All features function correctly

---

## Known Issues to Watch For

1. **Service Worker Conflicts**: If Workbox and manual SW conflict, disable manual SW
2. **Cache Versioning**: Service worker cache version should increment on changes
3. **React Query Caching**: Menu data should cache for 1 hour
4. **Favorites Persistence**: Should persist across sessions via localStorage
5. **Order History**: Should load from localStorage + DB correctly

---

## Quick Test Commands

```bash
# Check service worker registration
# Open DevTools Console and run:
navigator.serviceWorker.getRegistrations().then(r => console.log(r));

# Clear all caches
# Open DevTools Console and run:
caches.keys().then(keys => keys.forEach(key => caches.delete(key)));

# Check localStorage
# Open DevTools Console and run:
console.log(localStorage.getItem('dinein_cart'));
console.log(localStorage.getItem('dinein_favorites'));
console.log(localStorage.getItem('my_orders_ids'));
```

---

## Success Criteria Summary

- ✅ User can complete order in < 2 minutes
- ✅ Menu loads in < 1 second
- ✅ 4-6 taps maximum for basic order
- ✅ Lighthouse score 95+
- ✅ Initial bundle < 150KB gzipped
- ✅ Offline menu viewing works
- ✅ No Gemini AI calls in client code
- ✅ Only 3 client routes (menu, order, settings)
- ✅ No bottom navigation tabs
- ✅ WCAG 2.1 AA compliant

---

**Last Updated**: After UI/UX Refactoring Implementation  
**Tested By**: [Tester Name]  
**Date**: [Test Date]
