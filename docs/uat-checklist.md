# DineIn UAT Checklist

## Pre-UAT Tasks
- [ ] Verify Cloudflare Pages build succeeded
- [ ] Note staging URL from deployment

## Client Journey
- [ ] Home page loads with venue list
- [ ] Search/filter works
- [ ] Venue details page displays correctly
- [ ] Menu categories scroll properly
- [ ] Add items to cart
- [ ] Cart total updates correctly
- [ ] Table selection works
- [ ] Order submission completes

## Vendor Journey
- [ ] Login page loads (`/#/vendor/login`)
- [ ] Login redirects properly (or shows error for invalid creds)
- [ ] Protected routes require auth
- [ ] Menu management accessible
- [ ] Settings page loads

## Admin Journey
- [ ] Login page loads (`/#/admin/login`)
- [ ] Dashboard accessible after login
- [ ] Vendors list loads
- [ ] Users management works
- [ ] System page accessible

## PWA Features
- [ ] App installable (manifest check)
- [ ] Service worker registered
- [ ] Works offline (cached views)
- [ ] Icons display correctly

## Mobile Experience
- [ ] Touch targets ≥44px
- [ ] Safe area padding on iPhone
- [ ] Smooth scrolling
- [ ] Animations respect reduced-motion

## Performance (Lighthouse)
- [ ] Performance ≥ 80
- [ ] Accessibility ≥ 90
- [ ] Best Practices ≥ 90
- [ ] SEO ≥ 90

## Sign-off
- [ ] UAT Passed
- [ ] Ready for production
