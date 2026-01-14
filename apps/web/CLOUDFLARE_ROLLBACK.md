# Cloudflare Pages Rollback Plan

## When to Rollback

Rollback immediately if any of these occur after deployment:

| Symptom | Action |
|---------|--------|
| App crashes on load (white screen) | Rollback |
| Login/auth broken | Rollback |
| Core user flow broken (ordering, checkout) | Rollback |
| Major console errors affecting most users | Rollback |
| Page load > 5 seconds (was < 2s before) | Rollback |

## Rollback Steps (< 2 minutes)

### Step 1: Open Cloudflare Dashboard

Navigate to:
**Cloudflare Dashboard → Pages → dinein-malta → Deployments**

### Step 2: Find Last Working Deployment

- Look for the deployment BEFORE the broken one
- Should have a green checkmark (✓)
- Verify the timestamp matches "last known good"

### Step 3: Rollback

1. Click the **⋮** (three dots) menu on the deployment row
2. Select **"Rollback to this deployment"**
3. Confirm the action

### Step 4: Verify

- Wait ~30 seconds for propagation
- Hard refresh the production URL (`Cmd+Shift+R`)
- Confirm the app works

### Step 5: Notify Team

Post in team channel:
```
🚨 ROLLBACK EXECUTED
- Time: [timestamp]
- Rolled back from: [commit hash]
- Rolled back to: [commit hash]
- Reason: [brief description]
- Status: Site is now stable
- Next: Investigating root cause
```

## Post-Rollback

1. **Do not re-deploy** until root cause is identified
2. Check Cloudflare build logs for errors
3. Test fix in Preview environment before Production
4. Create incident report if user-impacting

## Prevention

- Always test in Preview environment first
- Use feature flags for risky changes
- Keep deployments small and frequent
- Monitor after every deploy

## Cloudflare Keeps History

> Cloudflare Pages retains **500 deployments**.  
> Rollback is instant (CDN edge update, no rebuild).  
> Safe to rollback multiple times if needed.
