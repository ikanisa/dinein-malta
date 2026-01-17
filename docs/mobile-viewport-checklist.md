# Mobile Viewport Testing Checklist

Reference for QA/UAT testing across mobile viewports.

---

## Target Viewports

| Device | Viewport | Density |
|--------|----------|---------|
| iPhone SE | 375×667 | 2x |
| iPhone 14 | 390×844 | 3x |
| iPhone 14 Pro Max | 428×926 | 3x |
| Pixel 7 | 412×915 | 2.625x |
| Samsung Galaxy S23 | 360×780 | 3x |

---

## Checklist

### Layout & Overflow
- [ ] No horizontal scrollbar on any page
- [ ] Content doesn't overflow viewport boundaries
- [ ] Images scale appropriately (no pixelation, no overflow)
- [ ] Tables are scrollable or responsive (no breakout)

### Touch Targets
- [ ] All buttons ≥44px tap target
- [ ] Links have adequate spacing (≥8px between clickable items)
- [ ] Form inputs are easy to tap without misclicks
- [ ] Navigation elements are thumb-reachable

### Navigation
- [ ] Bottom nav visible and functional (if applicable)
- [ ] Back button works as expected
- [ ] Menu/hamburger opens without overlap issues
- [ ] Modals are dismissible via overlay tap or X button

### Forms
- [ ] Keyboard doesn't cover input fields
- [ ] Form scrolls when keyboard appears
- [ ] Labels visible when input is focused
- [ ] Submit buttons accessible during input

### Typography
- [ ] Text readable without zooming (≥14px body)
- [ ] Line length comfortable (45-75 characters)
- [ ] Headers don't wrap awkwardly

### Performance (Perceived)
- [ ] Gestures feel instant (<100ms feedback)
- [ ] Scroll is smooth (60fps)
- [ ] Animations don't cause layout shifts

---

## Playwright Mobile Test Commands

```bash
# Run all tests on Mobile Chrome (Pixel 5)
npx playwright test --project="Mobile Chrome"

# Run all tests on Mobile Safari (iPhone 12)
npx playwright test --project="Mobile Safari"

# Run specific test file on mobile
npx playwright test tests/e2e/client-journey.spec.ts --project="Mobile Safari"
```

---

## Manual Testing Steps

1. Open DevTools → Toggle Device Toolbar (Ctrl+Shift+M)
2. Select device or enter custom viewport
3. Navigate through key flows:
   - Homepage → Explore → Venue → Menu → Cart → Checkout
   - Manager Login → Dashboard → Orders → Menu Management
4. Document any issues with screenshots
