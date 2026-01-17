# Monitoring Setup Verification

This document verifies the setup of Sentry error tracking and Web Vitals monitoring for the DineIn PWA.

## Sentry Configuration

### Environment Variables Required

```env
VITE_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
VITE_SENTRY_TRACES_SAMPLE_RATE=0.1
VITE_APP_VERSION=2.0.0
```

### Features Configured

✅ **Error Tracking**
- Automatic error capture via ErrorBoundary
- Manual error reporting via `errorTracker.captureError()`
- Unhandled promise rejection capture

✅ **Performance Monitoring**
- Browser tracing enabled
- Transaction sampling (10% by default)
- Navigation and user interaction tracking

✅ **User Context**
- User ID and email automatically set on login
- Role (client/vendor/admin) tracked
- Vendor ID tracked for vendor users
- Context cleared on logout

✅ **Error Filtering**
- Network errors when offline are filtered out
- Custom beforeSend hook for error processing

✅ **Release Tracking**
- Version tracking via `VITE_APP_VERSION`
- Environment tracking (development/production)

### Verification Steps

1. **Check Sentry Initialization**
   - Open browser console
   - Look for Sentry initialization logs (in production)
   - Verify no errors during initialization

2. **Test Error Tracking**
   - Trigger a test error in the app
   - Check Sentry dashboard for the error
   - Verify user context is attached

3. **Test Performance Monitoring**
   - Navigate through the app
   - Check Sentry Performance tab for transactions
   - Verify traces are being captured

## Web Vitals Monitoring

### Metrics Tracked

✅ **Core Web Vitals**
- **LCP** (Largest Contentful Paint) - Loading performance
- **FID/INP** (First Input Delay / Interaction to Next Paint) - Interactivity
- **CLS** (Cumulative Layout Shift) - Visual stability

✅ **Additional Metrics**
- **FCP** (First Contentful Paint) - Initial rendering
- **TTFB** (Time to First Byte) - Server response time

### Reporting Destinations

1. **Analytics Service**
   - All metrics sent to `analytics.trackEvent()`
   - Includes metric name, value, rating, and navigation type

2. **Sentry Performance**
   - Metrics sent as distributions
   - Poor ratings logged as breadcrumbs
   - Tagged with rating and navigation type

3. **Console Logging** (Development Only)
   - All metrics logged to console for debugging

### Verification Steps

1. **Check Web Vitals Collection**
   - Open browser DevTools
   - Navigate to Network tab
   - Look for analytics events with `web_vital` category

2. **Check Sentry Metrics**
   - Open Sentry dashboard
   - Navigate to Performance > Metrics
   - Verify Web Vitals are being recorded

3. **Test Poor Performance**
   - Simulate slow network (DevTools > Network > Throttling)
   - Trigger poor LCP/CLS
   - Verify warnings in Sentry breadcrumbs

## Integration Points

### ErrorBoundary
- Located: `apps/web/components/ErrorBoundary.tsx`
- Automatically captures React errors
- Sends errors to Sentry with component stack

### AuthContext
- Sets user context in Sentry on login
- Updates context when role changes
- Clears context on logout

### App.tsx
- Initializes error tracking in production
- Initializes Web Vitals monitoring
- Sets up analytics

## Best Practices

1. **Error Context**
   - Always provide context when capturing errors
   - Include relevant IDs (orderId, venueId, etc.)
   - Don't include sensitive data (passwords, tokens)

2. **Performance Monitoring**
   - Monitor Core Web Vitals regularly
   - Set up alerts for poor ratings
   - Review performance trends weekly

3. **Release Tracking**
   - Update `VITE_APP_VERSION` on each release
   - Create releases in Sentry dashboard
   - Link releases to deployments

## Troubleshooting

### Sentry Not Initializing
- Check `VITE_SENTRY_DSN` is set correctly
- Verify DSN format is correct
- Check browser console for errors

### Web Vitals Not Reporting
- Verify `web-vitals` package is installed
- Check analytics service is initialized
- Verify Sentry is initialized (for Sentry reporting)

### Missing User Context
- Check AuthContext is setting user correctly
- Verify user is logged in
- Check Sentry dashboard for user data

### Performance Issues
- Check `VITE_SENTRY_TRACES_SAMPLE_RATE` (lower = less overhead)
- Verify BrowserTracing is configured correctly
- Check network requests aren't being traced unnecessarily

## Alerts Setup (Recommended)

Set up Sentry alerts for:
- High error rate (> 10 errors/minute)
- Poor Web Vitals (LCP > 2.5s, CLS > 0.25, INP > 200ms)
- Critical errors (unhandled exceptions)
- Performance degradation (> 20% slower)

## Dashboard Configuration

Create Sentry dashboards for:
- Error rate over time
- Web Vitals trends
- Error breakdown by type
- Performance by route
- User impact metrics
