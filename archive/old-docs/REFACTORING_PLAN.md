# DineIn Malta - Monorepo Refactoring Plan

## Current State Analysis

### Apps Structure
- **apps/universal** (Vite + React) - Main PWA with all pages already
- **apps/admin** (Next.js) - DUPLICATE, needs removal
- **apps/vendor** (Next.js) - DUPLICATE, needs removal

### Current Routes (apps/universal)
- Client: `/`, `/explore`, `/profile`, `/menu/:venueId`
- Vendor: `/business`, `/vendor-login`, `/vendor-onboarding`, `/vendor-dashboard`
- Admin: `/admin-login`, `/admin-dashboard`, `/admin-vendors`, `/admin-orders`, `/admin-system`, `/admin-users`

### Issues to Fix
1. No route guards - anyone can access vendor/admin routes
2. Vendor claiming still exists in public (`VendorOnboarding`)
3. No centralized auth context with role checking
4. Routes don't match new structure (`/vendor/*`, `/admin/*`)
5. Edge function `vendor_claim` needs to become admin-only

## Target Architecture

### Route Structure
- **Public (Client)**: `/`, `/explore`, `/v/:vendorSlug`, `/profile`
- **Vendor (Private)**: `/vendor/login`, `/vendor/dashboard`, `/vendor/menu`, `/vendor/orders`, `/vendor/tables`
- **Admin (Private)**: `/admin/login`, `/admin/dashboard`, `/admin/vendors`, `/admin/users`, `/admin/system`

### Auth Model
- **Client**: Anonymous auth (silent on first use)
- **Vendor**: Email/password or magic link (admin-provisioned)
- **Admin**: Google OAuth only

### Role Checking
- Frontend: Route guards using `AuthContext`
- Backend: RLS policies (already mostly in place)

## Implementation Steps

1. ✅ Audit repo structure
2. Create AuthContext with role checking
3. Create route guard components (`RequireVendor`, `RequireAdmin`)
4. Update routes to new structure
5. Remove vendor claiming from public
6. Update edge functions (remove public vendor_claim)
7. Delete duplicate apps (admin, vendor)
8. Update build scripts
9. Test and validate
10. Update documentation

