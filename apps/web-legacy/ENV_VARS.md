# Environment Variables (Cloudflare Pages)

## Production vs Preview

Ensure these variables are set in the Cloudflare Pages dashboard (Settings > Environment variables).

| Variable | Description | Required? | Notes |
|----------|-------------|-----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Project URL | YES | |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Anon Key | YES | Safe for client |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Service Role | YES (Edge) | Used in Edge Functions (if any) |
| `NEXT_PUBLIC_APP_URL` | App Base URL | YES | Used for metadata/redirects |

## Notes
- Do NOT expose `SUPABASE_SERVICE_ROLE_KEY` with `NEXT_PUBLIC_`.
- Edge Runtime routes will access these from the environment.
