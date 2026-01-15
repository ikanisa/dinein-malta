# DineIn Malta - Web Application

This is the main web application for the DineIn Malta platform.

## Quick Start

**Prerequisites:** Node.js 20+

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set environment variables in `.env.local`:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

   **Note:** `GEMINI_API_KEY` is only used server-side in Supabase edge functions, not in client builds. See [Supabase Setup](../../docs/deployment/supabase-setup.md) for edge function configuration.

3. Run the app:
   ```bash
   npm run dev
   ```

## Documentation

For complete setup and deployment instructions, see:
- [Main README](../../README.md)
- [Deployment Guide](../../docs/DEPLOYMENT.md)
- [Local Development](../../docs/deployment/local-development.md)
- [Supabase Setup](../../docs/deployment/supabase-setup.md)
