# UAT Testing Checklist

## Client Role Testing

### Authentication & Navigation
- [ ] App loads successfully on first visit
- [ ] Anonymous user can browse without login
- [ ] Can navigate between pages smoothly
- [ ] PWA install prompt appears (after 30s)
- [ ] Can install PWA to home screen
- [ ] Installed PWA opens correctly

### Browse & Discover
- [ ] Can view list of active vendors
- [ ] Gemini-powered explore shows recommendations
- [ ] Can search for vendors
- [ ] Can filter vendors by category/location
- [ ] Vendor cards show correct information
- [ ] Can click vendor to view menu

### Menu & Ordering
- [ ] Can view full menu with categories
- [ ] Menu items show name, description, price
- [ ] Can filter menu by category
- [ ] Can search menu items
- [ ] Add to cart button works
- [ ] Cart badge shows correct quantity
- [ ] Can open cart modal/page
- [ ] Can modify quantities in cart
- [ ] Can remove items from cart
- [ ] Cart total calculates correctly
- [ ] Can add order notes
- [ ] Can proceed to checkout
- [ ] Order confirmation shows correct details

### QR Code Scanning
- [ ] Can scan QR code at table
- [ ] Table number displays correctly
- [ ] Menu loads with table context
- [ ] Order associates with correct table
- [ ] Can place order from table

### Order Tracking
- [ ] Can view order status
- [ ] Real-time status updates work
- [ ] Order history shows past orders
- [ ] Can view order details
- [ ] Can reorder from history

### Reservations
- [ ] Can access reservations page
- [ ] Can select date and time
- [ ] Can choose party size
- [ ] Can add special requests
- [ ] Reservation confirmation received
- [ ] Can view reservation details
- [ ] Can cancel reservation

### Profile
- [ ] Can view/edit profile
- [ ] Can update contact info
- [ ] Can view order history
- [ ] Can view reservation history
- [ ] Can manage preferences

### Mobile Experience
- [ ] Touch targets are 44px minimum
- [ ] Haptic feedback on interactions
- [ ] Smooth animations throughout
- [ ] Pull-to-refresh works
- [ ] Swipe gestures work
- [ ] Status bar styled correctly
- [ ] Splash screen shows on launch
- [ ] Offline mode shows cached content
- [ ] App works in portrait/landscape

---

## Vendor Role Testing

### Authentication
- [ ] Can login with email/password
- [ ] Invalid credentials show error
- [ ] Can logout successfully
- [ ] Session persists on refresh

### Dashboard
- [ ] Dashboard shows key metrics
- [ ] Today's orders count is accurate
- [ ] Revenue stats display correctly
- [ ] Quick actions accessible
- [ ] Recent orders list updates

### Menu Management
- [ ] Can view all menu items
- [ ] Can filter by category
- [ ] Can search menu items
- [ ] Can add new menu item
- [ ] Can upload item image
- [ ] Can edit existing item
- [ ] Can toggle item availability
- [ ] Can delete menu item
- [ ] Can reorder items (drag-drop)
- [ ] Can bulk update prices
- [ ] Changes reflect immediately

### Order Management
- [ ] Can view all orders
- [ ] Can filter by status
- [ ] Can filter by date range
- [ ] New orders appear in real-time
- [ ] Sound/notification for new order
- [ ] Can view order details
- [ ] Can accept/reject order
- [ ] Can update order status
- [ ] Can mark order as paid
- [ ] Can print order receipt
- [ ] Status changes update customer view

### Table Management
- [ ] Can view all tables
- [ ] Can add new table
- [ ] Can generate QR codes
- [ ] Can download QR code as image
- [ ] Can bulk generate QR codes
- [ ] Can edit table details
- [ ] Can view table status
- [ ] Can mark table as occupied/available

### Reservations
- [ ] Can view all reservations
- [ ] Can filter by date
- [ ] Can filter by status
- [ ] Can view reservation details
- [ ] Can confirm reservation
- [ ] Can cancel reservation
- [ ] Customer receives notification

### Analytics
- [ ] Sales charts display correctly
- [ ] Revenue breakdown by category
- [ ] Popular items list accurate
- [ ] Peak hours analysis shown
- [ ] Can export reports as CSV
- [ ] Date range filters work

### Staff Management
- [ ] Can view staff list (if owner)
- [ ] Can add new staff user (if owner)
- [ ] Can assign roles (if owner)
- [ ] Can deactivate user (if owner)

---

## Admin Role Testing

### Authentication
- [ ] Can login with Google OAuth
- [ ] Invalid admin redirected to login
- [ ] Session persists correctly

### Vendor Management
- [ ] Can view all vendors
- [ ] Can filter by status
- [ ] Can search vendors
- [ ] Can view Gemini discovery results
- [ ] Can create vendor from discovery
- [ ] Can manually create vendor
- [ ] Can edit vendor details
- [ ] Can activate/deactivate vendor
- [ ] Can assign vendor location
- [ ] Can upload vendor images

### User Management
- [ ] Can view all vendor users
- [ ] Can create vendor user account
- [ ] Can assign user to vendor
- [ ] Can assign user role
- [ ] Can deactivate user
- [ ] Can reset user password
- [ ] Can view user activity log

### System Monitoring
- [ ] Dashboard shows system stats
- [ ] Total vendors count accurate
- [ ] Active orders count accurate
- [ ] Can view error logs
- [ ] Can view audit logs
- [ ] Can filter logs by date/type

### Configuration
- [ ] Can update system settings
- [ ] Can manage admin users
- [ ] Can configure email templates
- [ ] Can view API usage stats

---

## Performance Testing

### Load Times
- [ ] Homepage loads < 2s (3G)
- [ ] Menu page loads < 2s (3G)
- [ ] Time to interactive < 3.5s
- [ ] Lighthouse Performance > 90

### Functionality
- [ ] Search results appear < 1s
- [ ] Cart updates instantly
- [ ] Order submission < 2s
- [ ] Image loading optimized
- [ ] Lazy loading works

### Offline
- [ ] Can view cached content offline
- [ ] Offline indicator shows
- [ ] Queue actions when offline
- [ ] Sync when back online

---

## Cross-Platform Testing

### Browsers
- [ ] Chrome desktop
- [ ] Firefox desktop
- [ ] Safari desktop
- [ ] Edge desktop
- [ ] Chrome mobile
- [ ] Safari mobile (iOS)

### Devices
- [ ] Android 10+ (multiple devices)
- [ ] iOS 14+ (multiple devices)
- [ ] Tablet (landscape/portrait)
- [ ] Desktop (various resolutions)

### APK Testing
- [ ] APK installs successfully
- [ ] All features work in APK
- [ ] Permissions requested correctly
- [ ] Push notifications work (if implemented)
- [ ] Deep links work
- [ ] No crashes or freezes

---

## Security Testing

### Authentication
- [ ] SQL injection attempts blocked
- [ ] XSS attempts sanitized
- [ ] CSRF protection works
- [ ] Rate limiting prevents abuse
- [ ] Session timeout works

### Authorization
- [ ] Clients can't access vendor routes
- [ ] Vendors can't access admin routes
- [ ] Vendors can only see own data
- [ ] RLS policies enforced
- [ ] API returns 403 for unauthorized

### Data Protection
- [ ] Passwords hashed properly
- [ ] HTTPS enforced
- [ ] API keys not exposed
- [ ] No sensitive data in logs
- [ ] Input validation works

---

## Accessibility Testing

- [ ] Keyboard navigation works
- [ ] Screen reader compatible
- [ ] Color contrast meets WCAG AA
- [ ] Focus indicators visible
- [ ] Alt text on images
- [ ] Form labels present
- [ ] Error messages readable
- [ ] ARIA labels correct

---

## Sign-off

**Tester Name:** _______________
**Date:** _______________
**Build Version:** _______________
**Pass/Fail:** _______________

**Notes:**
