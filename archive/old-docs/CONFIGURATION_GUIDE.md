# DineIn Configuration Guide

This guide covers optional but recommended configurations for production deployment.

---

## Required for MVP

### None - Application is fully functional without these configurations

All core features work without any additional configuration. The following are enhancements for production monitoring and advanced features.

---

## Recommended Configurations

### 1. Enable Leaked Password Protection (Supabase Dashboard)

**Why**: Prevents users from using compromised passwords from data breaches.

**Steps**:
1. Go to Supabase Dashboard: https://supabase.com/dashboard/project/elhlcdiosomutugpneoc
2. Navigate to **Authentication** → **Settings** → **Password**
3. Enable **"Leaked password protection"**
4. Save changes

**Time**: 2 minutes

---

### 2. Google Analytics 4 (GA4) Setup

**Why**: Track user behavior, page views, conversions, and business metrics.

**Steps**:
1. Create a GA4 property at https://analytics.google.com/
2. Get your Measurement ID (format: `G-XXXXXXXXXX`)
3. Add to `.env` file:
   ```bash
   VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
   ```
4. Rebuild and redeploy the application

**Time**: 10-15 minutes

**Note**: Analytics service is already integrated. Just needs the Measurement ID.

---

### 3. Sentry Error Tracking

**Why**: Real-time error monitoring, performance tracking, and issue alerts.

**Steps**:
1. Create account at https://sentry.io/
2. Create a new project (React/TypeScript)
3. Get your DSN (format: `https://xxx@xxx.ingest.sentry.io/xxx`)
4. Add to `.env` file:
   ```bash
   VITE_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
   ```
5. Rebuild and redeploy the application

**Time**: 10-15 minutes

**Note**: Error tracking service is already integrated. Just needs the DSN.

---

### 4. Push Notifications (VAPID Key)

**Why**: Send push notifications to users for order updates, promotions, etc.

**Steps**:
1. Generate VAPID keys:
   ```bash
   npx web-push generate-vapid-keys
   ```
2. This outputs:
   - Public Key: `Bxxxxxxxxxxxxx`
   - Private Key: `xxxxxxxxxxxxx` (keep this secret!)
3. Add public key to `.env`:
   ```bash
   VITE_VAPID_PUBLIC_KEY=Bxxxxxxxxxxxxx
   ```
4. Add private key to Supabase Edge Function environment:
   - Go to Supabase Dashboard → Edge Functions → Environment Variables
   - Add: `VAPID_PRIVATE_KEY=xxxxxxxxxxxxx`
5. Rebuild and redeploy the application

**Time**: 5-10 minutes

**Note**: Push notification service is already integrated. Just needs VAPID keys.

**Security**: 
- Public key is safe to expose in frontend
- Private key must be kept secret (only in Edge Function env)

---

## Environment Variables Summary

Create or update `.env` file in `apps/universal/`:

```bash
# Optional: Google Analytics 4
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Optional: Sentry Error Tracking
VITE_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx

# Optional: Push Notifications (Public Key)
VITE_VAPID_PUBLIC_KEY=Bxxxxxxxxxxxxx
```

**Important**: 
- After updating `.env`, you must rebuild and redeploy the application
- Never commit `.env` files to git (they should be in `.gitignore`)

---

## Deployment Checklist

Before production deployment, ensure:

- [ ] Leaked password protection enabled (Supabase Dashboard)
- [ ] Environment variables configured (if using optional services)
- [ ] Application rebuilt with new environment variables
- [ ] Application redeployed to Cloud Run
- [ ] Test analytics tracking (if configured)
- [ ] Test error reporting (if configured)
- [ ] Test push notifications (if configured)

---

## Verification

### Verify Analytics (if configured)
1. Open browser DevTools → Network tab
2. Navigate through the app
3. Look for requests to `google-analytics.com` or `gtag`
4. Check GA4 dashboard for real-time events

### Verify Sentry (if configured)
1. Trigger a test error (or wait for real error)
2. Check Sentry dashboard for error reports
3. Verify error context and stack traces appear

### Verify Push Notifications (if configured)
1. Grant notification permission when prompted
2. Test sending a notification (backend integration required)
3. Verify notification appears on device

### Verify Leaked Password Protection
1. Try registering with a known compromised password (e.g., "password123")
2. Supabase should reject it with appropriate error message

---

## Support

If you encounter issues with configuration:

1. Check that environment variables are correctly named (must start with `VITE_` for Vite)
2. Verify services are enabled in Supabase Dashboard
3. Check browser console for configuration errors
4. Review service-specific documentation (GA4, Sentry, Web Push)

---

**Last Updated**: January 20, 2025



