# User Journeys

## Client Journey

### Browse & Discover
1. **Open App** → Anonymous session auto-initialized
2. **Allow Location** → App requests location permission
3. **Explore** → `/explore` shows nearby venues from Gemini/Google Maps
4. **View Venue** → Tap venue card to see details
5. **View Menu** → Tap "View Menu" → `/v/:vendorSlug` (only if vendor is active in DB)

### Order Flow
1. **Scan QR Code** → Opens `/v/:vendorSlug/t/:tableCode`
2. **Browse Menu** → Add items to cart
3. **Review Cart** → Check items, quantities, total
4. **Place Order** → Creates order in DB with `client_auth_user_id` (anonymous session)
5. **Order Confirmation** → Shows order code, estimated time
6. **Payment** → 
   - Option A: Revolut deep link (if vendor has `revolut_link`)
   - Option B: Cash on delivery
7. **Track Order** → `/order/:id` shows status (received → served/cancelled)

### Reservation Flow
1. **Select Venue** → From explore or menu page
2. **Make Reservation** → Choose date/time, party size
3. **Submit** → Creates reservation with status `pending`
4. **Vendor Response** → Vendor accepts/declines
5. **Confirmation** → Client sees updated status

## Vendor Journey

### Login
1. **Access Portal** → `/vendor/login`
2. **Enter Credentials** → Email/password (must be provisioned by admin)
3. **Authenticate** → Supabase validates, checks `vendor_users` table
4. **Dashboard** → Redirects to `/vendor/dashboard`

### Manage Orders
1. **View Orders** → `/vendor/orders` shows all orders for vendor
2. **Filter** → By status (received, served, cancelled) or date
3. **Update Status** → 
   - Mark as "served" when ready
   - Mark as "cancelled" if needed
4. **Mark Paid** → After payment received (Revolut or cash)
5. **Refresh** → Manual refresh or auto-poll every 10-15s

### Manage Menu
1. **View Menu** → `/vendor/menu` shows all menu items
2. **Add Item** → Name, description, price, category, image
3. **Edit Item** → Update price, availability, description
4. **Toggle Availability** → Quick toggle for out-of-stock items
5. **Bulk Import** → (Optional) Upload menu image, parse via Gemini

### Manage Tables
1. **View Tables** → `/vendor/tables` shows all tables
2. **Create Tables** → Bulk create N tables with QR codes
3. **Generate QR** → Each table gets unique `public_code`
4. **Print/Share** → Download QR codes as PDF or images
5. **Deactivate** → Mark table as inactive if needed

### Manage Reservations
1. **View Reservations** → See all pending/accepted reservations
2. **Accept/Decline** → Update reservation status
3. **Filter** → By date, status, party size

## Admin Journey

### Login
1. **Access Portal** → `/admin/login`
2. **Google OAuth** → Click "Sign in with Google"
3. **Authenticate** → Supabase validates, checks `admin_users` table
4. **Dashboard** → Redirects to `/admin/dashboard`

### Create Vendor
1. **Discover Venue** → Use Gemini search in `/admin/vendors`
2. **Select Place** → Choose from Google Maps results
3. **Create Vendor** → 
   - Name, address, coordinates from Google
   - Set status: `pending` or `active`
   - Add contact info (phone, website, WhatsApp)
4. **Save** → Creates vendor record in DB
5. **Activate** → Change status to `active` when ready

### Manage Vendor Users
1. **View Vendors** → `/admin/vendors` shows all vendors
2. **Select Vendor** → Choose vendor to manage
3. **Add Manager** → 
   - Create Supabase auth user (email invite)
   - Create `vendor_users` record
   - Assign role: `owner`, `manager`, or `staff`
4. **Edit Roles** → Update user roles or deactivate
5. **Remove User** → Deactivate user access

### System Management
1. **View System** → `/admin/system` shows system stats
2. **Monitor** → View orders, users, vendors counts
3. **Audit Logs** → Review admin actions
4. **Settings** → Configure system-wide settings

## Key Constraints

### Client
- Cannot access `/vendor/*` or `/admin/*` routes
- Can only see active vendors in menu
- Can only create orders for themselves
- Anonymous session is sufficient for ordering

### Vendor
- Cannot access `/admin/*` routes
- Can only see/manage their assigned vendor's data
- Cannot create new vendors (admin-only)
- Must be provisioned by admin first

### Admin
- Can access all routes
- Can create vendors from Google Places
- Can assign vendor users
- Can suspend vendors/users
- Full system access

## Error States

### Client
- **No Location** → Show manual search option
- **No Vendors Found** → Show empty state with search
- **Vendor Inactive** → Show "Coming soon" message
- **Order Failed** → Show error, retry option
- **Offline** → Queue orders, sync when online

### Vendor
- **No Orders** → Show empty state
- **Login Failed** → Show error message
- **Unauthorized** → Redirect to login
- **Network Error** → Show retry option

### Admin
- **Not Admin** → Redirect to login
- **OAuth Failed** → Show error, retry
- **Vendor Creation Failed** → Show error details

