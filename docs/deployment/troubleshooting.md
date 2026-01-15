# Deployment Troubleshooting

Common issues and solutions for deploying and running the DineIn Malta PWA.

## Build Errors

### Error: Module not found

**Symptoms:**
- Build fails with "Cannot find module"
- Import errors during build

**Solutions:**

```bash
# Clear cache and reinstall
cd apps/web
rm -rf node_modules package-lock.json
npm install

# Or if using monorepo
cd /path/to/dinein
rm -rf node_modules apps/web/node_modules
npm install
```

### Error: Type errors

**Symptoms:**
- TypeScript compilation errors
- Type mismatch warnings

**Solutions:**

```bash
# Run type check separately to see all errors
cd apps/web
npm run typecheck

# Fix errors incrementally
# Check tsconfig.json settings
```

### Error: "npm ci can only install with an existing package-lock.json"

**Symptoms:**
- CI/CD build fails
- Missing package-lock.json

**Solutions:**

- Ensure `apps/web/package-lock.json` is committed to git
- Or use `npm install --legacy-peer-deps` instead of `npm ci` in build command

### Error: Out of memory during build

**Symptoms:**
- Build process killed
- "JavaScript heap out of memory"

**Solutions:**

```bash
# Increase Node memory limit
export NODE_OPTIONS="--max-old-space-size=4096"
npm run build
```

## Deployment Issues

### Error: Authentication failed (Cloudflare)

**Symptoms:**
- Wrangler login fails
- Deployment rejected

**Solutions:**

```bash
# Re-authenticate
wrangler login

# Verify authentication
wrangler whoami
```

### Error: Project not found (Cloudflare)

**Symptoms:**
- "Project 'dinein-malta' not found"

**Solutions:**

```bash
# Create project first
wrangler pages project create dinein-malta

# Or check project name matches in wrangler.toml
```

### Error: Routes return 404

**Symptoms:**
- Direct URLs return 404
- SPA routing not working

**Solutions:**

1. Verify `_redirects` file exists in `apps/web/public/`:
   ```
   /*    /index.html   200
   ```

2. Check file is copied to `dist/` after build:
   ```bash
   ls -la apps/web/dist/_redirects
   ```

3. Ensure Cloudflare Pages SPA routing is enabled (should be automatic)

### Error: Environment variables not working

**Symptoms:**
- `process.env.VITE_SUPABASE_URL` is undefined
- API calls fail

**Solutions:**

1. **Cloudflare Pages:**
   - Variables must be set in Cloudflare Dashboard → Settings → Environment Variables
   - Use `VITE_` prefix for Vite variables
   - Rebuild after changing variables
   - Check variables are set for correct environment (Production/Preview)

2. **Local Development:**
   - Create `.env.local` in `apps/web/`
   - Use `VITE_` prefix
   - Restart dev server after changes

3. **Verify variables are accessible:**
   ```javascript
   console.log(import.meta.env.VITE_SUPABASE_URL)
   ```

### Error: Service worker not updating

**Symptoms:**
- Old version of app still loads
- Changes not reflected after deployment

**Solutions:**

1. **Clear browser cache:**
   - Hard refresh: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows)
   - Or clear site data in DevTools

2. **Verify service worker:**
   - Check DevTools → Application → Service Workers
   - Unregister old service worker
   - Reload page

3. **Check `sw.js` is in `dist/`:**
   ```bash
   ls -la apps/web/dist/sw.js
   ```

### Error: Build fails in CI/CD

**Symptoms:**
- GitHub Actions workflow fails
- Cloudflare Pages build fails

**Solutions:**

1. **Check build logs:**
   - GitHub Actions: Actions tab → Failed workflow → Logs
   - Cloudflare: Dashboard → Pages → Deployment → Build logs

2. **Common issues:**
   - Missing environment variables (set in GitHub Secrets/Cloudflare Settings)
   - Node version mismatch (should be 20)
   - Missing dependencies (check `package-lock.json` is committed)

3. **Test build locally:**
   ```bash
   cd apps/web
   npm ci --legacy-peer-deps
   npm run build
   ```

## Runtime Issues

### Error: White screen on load

**Symptoms:**
- App loads but shows blank page
- Console shows errors

**Solutions:**

1. **Check browser console:**
   - Look for JavaScript errors
   - Check for failed network requests

2. **Verify environment variables:**
   - Check `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set
   - Verify values are correct

3. **Check Supabase connection:**
   - Verify Supabase project is active
   - Test API endpoint manually

### Error: CORS errors

**Symptoms:**
- "Access-Control-Allow-Origin" errors in console
- API requests blocked

**Solutions:**

1. **Verify Supabase CORS settings:**
   - Go to Supabase Dashboard → Settings → API
   - Check allowed origins include your domain

2. **Check request origins:**
   - Ensure requests come from allowed domains
   - Check for typos in URLs

### Error: Authentication not working

**Symptoms:**
- Can't log in
- Redirects not working

**Solutions:**

1. **Vendor Login:**
   - Verify email/password provider is enabled
   - Check user exists in `vendor_users` table
   - Verify user has correct role

2. **Admin Login:**
   - Verify Google OAuth is configured
   - Check redirect URL matches exactly
   - Verify user exists in `admin_users` table

3. **Anonymous:**
   - Verify anonymous provider is enabled
   - Check RLS policies allow anonymous access

### Error: RLS policy blocking access

**Symptoms:**
- Data not loading
- Permission denied errors

**Solutions:**

1. **Run RLS verification:**
   ```bash
   # Via Supabase Dashboard SQL Editor
   # Run: supabase/scripts/verify_rls_status.sql
   ```

2. **Check policy expressions:**
   - Verify policies match user roles
   - Test with different user types

3. **Review audit logs:**
   - Check `audit_logs` table for access patterns

## Performance Issues

### Slow page load

**Symptoms:**
- Initial load > 5 seconds
- Long Time to Interactive (TTI)

**Solutions:**

1. **Check bundle size:**
   ```bash
   scripts/analyze-bundle.sh
   ```
   - Should be < 200KB for main bundle
   - Check for large dependencies

2. **Optimize assets:**
   - Compress images
   - Enable compression (Cloudflare does this automatically)
   - Check for unused dependencies

3. **Monitor Web Vitals:**
   - Check browser console for metrics
   - Use Lighthouse in DevTools

### Large bundle size

**Symptoms:**
- Bundle analysis shows > 200KB
- Slow initial load

**Solutions:**

1. **Check for large dependencies:**
   ```bash
   npm run build
   # Review dist/assets/ for large files
   ```

2. **Code splitting:**
   - Verify `vite.config.ts` has proper chunking
   - Check lazy loading for routes

3. **Tree shaking:**
   - Remove unused imports
   - Use ESM imports

## Supabase Issues

### Error: Edge function not found

**Symptoms:**
- API calls to edge functions fail
- 404 errors

**Solutions:**

1. **Verify function is deployed:**
   ```bash
   supabase functions list --project-ref your-project-ref
   ```

2. **Redeploy function:**
   ```bash
   supabase functions deploy function-name --project-ref your-project-ref
   ```

### Error: Database connection failed

**Symptoms:**
- Supabase client can't connect
- Database queries fail

**Solutions:**

1. **Check Supabase project status:**
   - Go to Dashboard → Project Settings
   - Verify project is active (not paused)

2. **Verify connection string:**
   - Check `VITE_SUPABASE_URL` is correct
   - Ensure URL doesn't have trailing slash

3. **Check network:**
   - Test connectivity to Supabase
   - Check firewall settings

### Error: Migration fails

**Symptoms:**
- Migration errors in SQL Editor
- Schema changes not applied

**Solutions:**

1. **Check migration order:**
   - Run migrations chronologically
   - Don't skip migrations

2. **Verify SQL syntax:**
   - Test in SQL Editor first
   - Check for syntax errors

3. **Check for conflicts:**
   - Verify no duplicate constraints
   - Check for conflicting indexes

## Getting Help

### Debug Mode

Enable verbose logging:

```bash
# Set debug flag
export DEBUG=true
npm run dev
```

### Logs

**Cloudflare Pages:**
- Dashboard → Pages → Deployment → Logs

**Supabase:**
- Dashboard → Logs → Edge Functions
- Dashboard → Logs → Postgres Logs

**Browser:**
- DevTools → Console
- DevTools → Network

### Support Resources

- **Cloudflare Docs**: https://developers.cloudflare.com/pages
- **Supabase Docs**: https://supabase.com/docs
- **GitHub Issues**: Create issue with error details and logs

## Common Solutions Checklist

- [ ] Cleared browser cache and hard refreshed
- [ ] Verified environment variables are set correctly
- [ ] Checked build logs for specific errors
- [ ] Verified dependencies are installed (`npm install`)
- [ ] Confirmed Supabase project is active
- [ ] Checked RLS policies are correct
- [ ] Verified service worker is up to date
- [ ] Tested in different browser/incognito mode
- [ ] Checked network connectivity
- [ ] Reviewed error logs (browser console, Cloudflare, Supabase)

---

**Still stuck?** Check the other deployment guides:
- [Cloudflare Pages](./cloudflare-pages.md)
- [Local Development](./local-development.md)
- [Supabase Setup](./supabase-setup.md)
