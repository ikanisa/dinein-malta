# DineIn Database Schema Documentation

## Overview

DineIn is a restaurant ordering and reservation platform for Malta. The database is hosted on Supabase (PostgreSQL) with Row Level Security (RLS) policies enforcing access control.

## Tables

### Core Tables

| Table | Description | RLS |
|-------|-------------|-----|
| `vendors` | Restaurants/venues | ✅ |
| `menu_items` | Food/drink items | ✅ |
| `orders` | Customer orders | ✅ |
| `order_items` | Items within orders | ✅ |
| `tables` | Physical tables with QR codes | ✅ |
| `reservations` | Table reservations | ✅ |
| `vendor_users` | Staff accounts for vendors | ✅ |
| `admin_users` | Platform administrators | ✅ |

### Supporting Tables

| Table | Description | RLS |
|-------|-------------|-----|
| `profiles` | User profiles (auth extension) | ✅ |
| `audit_logs` | Action audit trail | ✅ |

---

## Schema Details

### vendors

Primary table for restaurant/venue data.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `country` | TEXT | Country code (default: 'MT') |
| `google_place_id` | TEXT | Google Places ID (unique) |
| `slug` | TEXT | URL-friendly identifier (unique) |
| `name` | TEXT | Display name |
| `address` | TEXT | Physical address |
| `lat` | DOUBLE | Latitude |
| `lng` | DOUBLE | Longitude |
| `hours_json` | JSONB | Operating hours |
| `photos_json` | JSONB | Photo URLs |
| `website` | TEXT | Website URL |
| `phone` | TEXT | Phone number |
| `revolut_link` | TEXT | Payment link |
| `whatsapp` | TEXT | WhatsApp number |
| `status` | vendor_status | 'pending' / 'active' / 'suspended' |
| `created_at` | TIMESTAMPTZ | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | Last update timestamp |

### menu_items

Menu items for each vendor.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `vendor_id` | UUID | FK → vendors |
| `category` | TEXT | Category name |
| `name` | TEXT | Item name |
| `description` | TEXT | Item description |
| `price` | NUMERIC(12,2) | Price in EUR |
| `currency` | TEXT | Always 'EUR' |
| `is_available` | BOOLEAN | Availability flag |
| `tags_json` | JSONB | Tags (dietary, etc.) |
| `image_url` | TEXT | Item image URL |
| `created_at` | TIMESTAMPTZ | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | Last update timestamp |

### orders

Customer orders.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `vendor_id` | UUID | FK → vendors |
| `table_id` | UUID | FK → tables (nullable) |
| `client_auth_user_id` | UUID | FK → auth.users |
| `order_code` | TEXT | Display code |
| `status` | order_status | 'received' / 'served' / 'cancelled' |
| `payment_status` | payment_status | 'unpaid' / 'paid' |
| `total_amount` | NUMERIC(12,2) | Total in EUR |
| `currency` | TEXT | Always 'EUR' |
| `notes` | TEXT | Special instructions |
| `created_at` | TIMESTAMPTZ | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | Last update timestamp |

### order_items

Line items within orders.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `order_id` | UUID | FK → orders |
| `name_snapshot` | TEXT | Item name at order time |
| `price_snapshot` | NUMERIC(12,2) | Price at order time |
| `qty` | INT | Quantity |
| `modifiers_json` | JSONB | Customizations |
| `created_at` | TIMESTAMPTZ | Creation timestamp |

### tables

Physical tables with QR codes for ordering.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `vendor_id` | UUID | FK → vendors |
| `table_number` | INT | Table number |
| `label` | TEXT | Display label |
| `public_code` | TEXT | QR code identifier |
| `is_active` | BOOLEAN | Active flag |
| `created_at` | TIMESTAMPTZ | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | Last update timestamp |

### reservations

Table reservations.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `vendor_id` | UUID | FK → vendors |
| `client_auth_user_id` | UUID | FK → auth.users |
| `datetime` | TIMESTAMPTZ | Reservation time |
| `party_size` | INT | Number of guests |
| `notes` | TEXT | Special requests |
| `status` | reservation_status | 'pending' / 'accepted' / 'declined' / 'cancelled' |
| `created_at` | TIMESTAMPTZ | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | Last update timestamp |

### vendor_users

Staff accounts linked to vendors.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `vendor_id` | UUID | FK → vendors |
| `auth_user_id` | UUID | FK → auth.users |
| `role` | vendor_role | 'owner' / 'manager' / 'staff' |
| `is_active` | BOOLEAN | Active flag |
| `created_at` | TIMESTAMPTZ | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | Last update timestamp |

### admin_users

Platform administrators.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `auth_user_id` | UUID | FK → auth.users (unique) |
| `role` | TEXT | Admin role |
| `is_active` | BOOLEAN | Active flag |
| `created_at` | TIMESTAMPTZ | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | Last update timestamp |

---

## Enums

| Enum | Values |
|------|--------|
| `vendor_status` | 'pending', 'active', 'suspended' |
| `vendor_role` | 'owner', 'manager', 'staff' |
| `order_status` | 'received', 'served', 'cancelled' |
| `payment_status` | 'unpaid', 'paid' |
| `reservation_status` | 'pending', 'accepted', 'declined', 'cancelled' |

---

## Helper Functions

| Function | Returns | Description |
|----------|---------|-------------|
| `is_admin()` | BOOLEAN | True if current user is active admin |
| `is_vendor_member(vendor_id)` | BOOLEAN | True if user belongs to vendor |
| `vendor_role_for(vendor_id)` | vendor_role | Get user's role for vendor |
| `can_edit_vendor_profile(vendor_id)` | BOOLEAN | True if user can edit vendor |
| `can_manage_vendor_ops(vendor_id)` | BOOLEAN | True if user can manage vendor ops |
| `get_user_role()` | TEXT | Returns 'admin', 'vendor', or 'client' |
| `get_user_vendor_id()` | UUID | Get vendor_id for vendor users |
| `search_vendors(query)` | SETOF vendors | Full-text search on vendors |

---

## RLS Policies Summary

### Public Access (Anonymous)
- `vendors`: Read active vendors
- `menu_items`: Read available items for active vendors
- `tables`: Read active tables for QR scanning

### Authenticated Users
- `orders`: Create own orders (via Edge Function), view own orders
- `reservations`: Create/view own reservations

### Vendor Staff
- `orders`: View/update vendor orders
- `menu_items`: Full CRUD for vendor items
- `tables`: Full CRUD for vendor tables
- `reservations`: View/update vendor reservations

### Vendor Owners/Managers
- `vendor_users`: Manage staff for their vendor
- `vendors`: Update vendor profile

### Admins
- Full access to all tables

---

## Key Indexes

```sql
-- Vendors
idx_vendors_status              -- Filter by status
idx_vendors_status_active       -- Partial index for active only
idx_vendors_status_location     -- Location-based queries

-- Menu Items
idx_menu_items_vendor_available -- Available items per vendor

-- Orders
idx_orders_vendor_status_created -- Dashboard queries
idx_orders_order_code           -- Code lookup

-- Tables
idx_tables_public_code          -- QR code scanning

-- Reservations  
idx_reservations_vendor_datetime_status -- Calendar views
```

---

## Edge Functions

| Function | Purpose |
|----------|---------|
| `order_create` | Create orders with validation |
| `order_update_status` | Update order status |
| `order_mark_paid` | Mark order as paid |
| `tables_generate` | Generate table QR codes |
| `vendor_claim` | Claim vendor ownership |
| `gemini-features` | AI-powered features |
| `nearby_places_live` | Google Places integration |

---

## Backup & Restore

```bash
# Backup
./supabase/scripts/backup_database.sh PROJECT_REF

# Verify schema
psql -f supabase/scripts/verify_migrations.sql

# Verify RLS
psql -f supabase/scripts/verify_rls_status.sql
```
