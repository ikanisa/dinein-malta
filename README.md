# DineIn Malta — Monorepo

## 1) Project Overview
**DineIn Malta** is an AI-first Progressive Web App (PWA) facilitating instant dine-in ordering and table reservations. It serves two distinct user groups via a single unified interface:
- **Guests**: Scan QR codes to view menus, order, and pay without installing an app.
- **Staff/Admins**: Manage venues, menus, and orders via a protected portal.

**Key Capabilities:**
- ⚡ **Instant App**: Mobile-first PWA with "Soft Liquid Glass" UI.
- 🔒 **RBAC**: Strict separation between Guest, Staff, and Admin roles.
- 🌍 **Offline-Ready**: Service Worker caching for reliable low-connectivity usage.
- 🚀 **Edge-First**: Deployed globally via Cloudflare Pages with Supabase backend.

## 2) Tech Stack
- **Frontend**: React 18, Vite, TailwindCSS 4, Radix UI.
- **State**: React Context + Supabase Realtime.
- **Backend**: Supabase (Postgres, Auth, Edge Functions).
- **Deployment**: Cloudflare Pages.
- **Testing**: Playwright (E2E).

## 3) Monorepo Structure
```bash
dinein/
├── apps/
│   └── dinein-web/       # Main PWA (Client + Admin Portal)
├── packages/             # Shared logic (future expansion)
├── supabase/             # DB schema, migrations, edge functions
├── scripts/              # CI/CD and utility scripts
└── README.md             # This file
```

## 4) Environments & Configuration
### Required Environment Variables
Create a `.env` file in `apps/dinein-web/` based on `.env.example`.

| Variable | Description | Safe to Expose? |
| :--- | :--- | :--- |
| `VITE_SUPABASE_URL` | Your Supabase Project URL | ✅ Yes |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase Anon Public Key | ✅ Yes |

> **Fail-Fast**: The app checks for these variables on boot (in `supabase.ts`) and will log a warning/mock the client if missing, preventing white-screen crashes.

## 5) Local Development
Run these commands from the **root** directory:

```bash
# 1. Install dependencies
npm install

# 2. Start local development server (apps/dinein-web)
npm run dev

# 3. Build for production
npm run build

# 4. Lint code
npm run lint

# 5. Run E2E Tests
npm run test:e2e -w apps/dinein-web
```

## 6) Database & Supabase
- **Setup**: Link your local project using `npx supabase link`.
- **Migrations**:
  - Apply: `npx supabase db push`
  - Reset: `npx supabase db reset` (Caution: Wipes local data)
- **RLS**: Row Level Security is **mandatory**. Staff/Admins can only access their tenant's data.

## 7) RBAC: Staff vs Admin
| Role | Capabilities | Enforcement |
| :--- | :--- | :--- |
| **Guest** | View Menu, Cart, Order | Public Routes |
| **Staff** | View Orders, status | `useAuth` Guard |
| **Admin** | Manage Venues, Users | `useAdminGuard` + RLS |

**Verification**:
To test RBAC, try navigating to `/admin` as a guest. You should be redirected to home immediately.

## 8) UI/UX Standards
- **Design System**: "Soft Liquid Glass" (blurred backgrounds, translucent cards).
- **Responsive**: Mobile-first. Test on 360x800 viewport.
- **States**: Every async component MUST handle `Loading`, `Empty`, and `Error` states.
- **Typeface**: Inter/System Sans.

## 9) PWA Notes
- **Manifest**: Located in `public/manifest.json`. Theme color: `#4F46E5`.
- **Updates**: Service Worker (`sw.ts`) uses skip-waiting to ensure fresh content on reload.
- **Offline**: App Shell caches automatically. API requests may fail gracefully.

## 10) Testing & QA
- **Smoke Tests**: `npm run test:e2e -w apps/dinein-web` runs the critical path (Home -> Order -> Admin Guard).
- **Manual QA**: Use the **Responsive Design Mode** in Chrome DevTools to verify layout on mobile devices.

## 11) Deployment (Cloudflare Pages)
| Setting | Value |
| :--- | :--- |
| **Root Directory** | `apps/dinein-web` |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |
| **Node Version** | `20+` |

**Production Branch**: `main` (Auto-deploys).

## 12) Operations / Runbook
- **Endless Loading**: Check `VITE_SUPABASE_URL`. Check Network tab for RLS 403s.
- **Stale Assets**: hard refresh (`Cmd+Shift+R`). PWA update logic handles versioning.
- **Logs**: Supabase Dashboard > Logs (for backend); Browser Console (for client).

## 13) Contributing
1.  Isolate your feature in a new branch.
2.  No "drive-by" refactors.
3.  Ensure `npm run build` and `npm run lint` pass.
4.  Add E2E tests for new critical flows.

## 14) License
Proprietary — DineIn Malta.
