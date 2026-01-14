# Cloudflare Pages Release Checklist

## Pre-Deploy

- [ ] All tests pass (`npm run test:all`)
- [ ] TypeScript compiles (`npm run typecheck`)
- [ ] ESLint clean (`npm run lint`)
- [ ] Build succeeds locally (`npm run build`)
- [ ] Env vars verified in Cloudflare Dashboard (Production + Preview)
- [ ] No secrets in `VITE_*` env vars

## Deploy

- [ ] Push to `main` branch (auto-deploys to Production)
- [ ] Monitor Cloudflare Dashboard for build status
- [ ] Build completes without errors

## Post-Deploy Verification

- [ ] Site loads at production URL
- [ ] Hard refresh (`Cmd+Shift+R`) loads new bundle
- [ ] Deep links work (e.g., `/vendor/dashboard` returns 200, not 404)
- [ ] Service worker updates (check DevTools → Application → Service Workers)
- [ ] API calls work (check browser console for errors)
- [ ] Security headers present (check DevTools → Network → Response Headers)

## Rollback Trigger Conditions

Rollback immediately if:
- App crashes on load
- Critical flow broken (login, ordering, payments)
- Console errors affecting > 50% of users
- Performance regression > 3s load time

## Rollback Steps

1. Go to **Cloudflare Dashboard → Pages → dinein-malta → Deployments**
2. Find previous working deployment (green checkmark)
3. Click **⋮ → Rollback to this deployment**
4. Confirm rollback
5. Notify team in Slack/Discord
6. Investigate failed deployment before re-attempting
