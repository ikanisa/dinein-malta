# Production Readiness Checklist

## ✅ Completed Refactoring

### Repository Structure
- [x] Consolidated to single app (`apps/universal`)
- [x] Removed duplicate Next.js apps (`apps/admin`, `apps/vendor`)
- [x] Archived vendor onboarding (now admin-only)
- [x] Clean monorepo structure

### Authentication & Authorization
- [x] AuthContext with role checking (client/vendor/admin)
- [x] Anonymous auth auto-initialized for client routes
- [x] Google OAuth for admin login
- [x] Email/password for vendor login
- [x] Route guards (`RequireAuth` component)
- [x] Role-based route protection

### Routing
- [x] New route structure implemented:
  - Public: `/`, `/explore`, `/v/:vendorSlug`
  - Vendor: `/vendor/login`, `/vendor/dashboard`
  - Admin: `/admin/login`, `/admin/dashboard`, `/admin/vendors`, etc.
- [x] Legacy route redirects for backward compatibility
- [x] Route guards enforce access control

### Vendor Provisioning
- [x] Removed public vendor claiming
- [x] Vendor creation is admin-only
- [x] Edge function `vendor_claim` requires admin role
- [x] Removed `claim-venue` action from business-logic function

### Database & RLS
- [x] RLS policies in place for all tables
- [x] Helper functions: `is_admin()`, `is_vendor_member()`, etc.
- [x] Policies enforce:
  - Public can only see active vendors
  - Vendors can only access their own data
  - Admins have full access
- [x] All functions use `SECURITY DEFINER` with explicit `search_path`

### Edge Functions
- [x] `vendor_claim` - Admin-only vendor creation
- [x] `order_create` - Order creation with validations
- [x] `order_update_status` - Status updates
- [x] `order_mark_paid` - Payment status
- [x] `tables_generate` - QR code generation
- [x] `gemini-features` - Venue discovery/search
- [x] CORS headers configured
- [x] Input validation

### PWA Features
- [x] `manifest.json` configured
- [x] Service worker (`sw.js`) for offline support
- [x] Icons in `/public/icons/`
- [x] Install prompt component
- [x] iOS add-to-home instructions
- [x] Offline queue for orders
- [x] Update prompt for new versions

### Build & Deployment
- [x] Vite build configuration
- [x] Dockerfile for Cloud Run
- [x] Deployment scripts
- [x] Environment variable handling

## ⚠️ Production Checklist

### Security
- [ ] Review and test all RLS policies
- [ ] Verify admin-only vendor creation works
- [ ] Test role-based access (client cannot access vendor/admin routes)
- [ ] Verify vendor cannot access admin routes
- [ ] Test anonymous auth initialization
- [ ] Review CORS settings in edge functions
- [ ] Ensure service role key is never exposed to client
- [ ] Rate limiting on edge functions (consider)
- [ ] Input sanitization on all user inputs

### Authentication
- [ ] Configure Google OAuth in Supabase Dashboard
- [ ] Set OAuth redirect URLs correctly
- [ ] Test admin login flow end-to-end
- [ ] Test vendor login flow end-to-end
- [ ] Verify anonymous auth works for client routes
- [ ] Test role refresh after login
- [ ] Test logout functionality

### Database
- [ ] All migrations applied in correct order
- [ ] Indexes created for performance
- [ ] RLS policies tested with different user roles
- [ ] Test vendor creation via admin panel
- [ ] Test vendor user assignment
- [ ] Verify audit logs are created

### Edge Functions
- [ ] All functions deployed
- [ ] Test `vendor_claim` with admin user
- [ ] Test `vendor_claim` rejects non-admin users
- [ ] Test order creation flow
- [ ] Test order status updates
- [ ] Test table QR generation
- [ ] Verify error handling

### Performance
- [ ] Test build size and optimize if needed
- [ ] Code splitting working correctly
- [ ] Lazy loading for routes
- [ ] Image optimization
- [ ] Service worker caching strategy
- [ ] Database query performance
- [ ] Edge function response times

### PWA
- [ ] Test install prompt on iOS
- [ ] Test install prompt on Android
- [ ] Verify offline functionality
- [ ] Test service worker updates
- [ ] Verify icons display correctly
- [ ] Test on various devices/browsers

### Monitoring & Logging
- [ ] Error tracking configured
- [ ] Analytics configured
- [ ] Logging in edge functions
- [ ] Monitor Cloud Run metrics
- [ ] Set up alerts for errors

### Testing
- [ ] Unit tests for critical functions
- [ ] Integration tests for auth flows
- [ ] E2E tests for key user journeys
- [ ] Load testing (if applicable)
- [ ] Security testing

### Documentation
- [x] README.md updated
- [x] Route structure documented
- [x] Auth model documented
- [ ] API documentation (if needed)
- [ ] Deployment guide
- [ ] Troubleshooting guide

## Known Limitations

1. **Environment Variables**: Vite requires env vars at build time. For Cloud Run, they must be baked into Dockerfile or use Cloud Build substitutions.

2. **Anonymous Auth**: Currently auto-initializes on app load. Consider lazy initialization if needed.

3. **Vendor Onboarding**: Removed from public access. All vendor creation is admin-only.

## Next Steps

1. **Testing**: Comprehensive testing of all auth flows and role-based access
2. **Performance**: Optimize bundle size, add caching strategies
3. **Monitoring**: Set up error tracking and analytics
4. **Documentation**: Add API docs and troubleshooting guides
5. **Security Audit**: Review all RLS policies and edge function security

## Deployment Commands

```bash
# Build locally
cd apps/universal
npm run build

# Deploy to Cloud Run
gcloud run deploy dinein-universal \
  --source . \
  --platform managed \
  --region europe-west1 \
  --allow-unauthenticated \
  --port 8080 \
  --memory 512Mi \
  --cpu 1

# Deploy Supabase functions
supabase functions deploy gemini-features --project-ref YOUR_REF
supabase functions deploy vendor_claim --project-ref YOUR_REF
# ... (other functions)
```

## Support

For issues or questions, refer to:
- Supabase Dashboard: https://supabase.com/dashboard
- Cloud Run Console: https://console.cloud.google.com/run
- Project documentation in `/docs` (if exists)

