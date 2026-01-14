# DineIn Malta - Universal PWA

A single, unified Progressive Web Application for the DineIn Malta platform with role-based access control.

## Architecture

This is a **monorepo with a single deployable app** (`apps/web`) that serves three user roles:

1. **Client (Public)**: Browse venues, place orders, make reservations
2. **Vendor (Private)**: Manage menu, orders, tables, reservations
3. **Admin (Private)**: Create vendors, manage users, system administration

### Key Features

- ✅ Single PWA deployment (Cloudflare Pages)
- ✅ Role-based routing with frontend guards + Supabase RLS
- ✅ Anonymous authentication for public access
- ✅ Google OAuth for admin access
- ✅ Email/password for vendor access
- ✅ PWA-first (installable, offline support, service worker)
- ✅ Mobile-first responsive design
- ✅ Minimal, clean architecture

## Project Structure

```
dinein/
├── apps/
│   └── web/                   # Single PWA application
│       ├── src/               # Source code
│       │   ├── pages/         # Route components
│       │   ├── components/    # Reusable components
│       │   ├── context/       # React contexts
│       │   └── services/      # API services
│       └── public/            # Static assets, icons, manifest
├── supabase/
│   ├── migrations/            # Database migrations
│   ├── functions/             # Edge functions
│   ├── seed/                  # Seed data
│   └── scripts/               # Utility scripts
├── docs/                      # Documentation
└── scripts/                   # Dev scripts
```

## Getting Started

### Prerequisites

- Node.js 20+
- npm
- Supabase project (or local Supabase instance)

### Environment Variables

Create `.env` file in `apps/web/`:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
GEMINI_API_KEY=your_gemini_api_key
```

### Local Development

```bash
cd apps/web
npm install
npm run dev
```

The app will be available at `http://localhost:3000`

### Build for Production

```bash
cd apps/web
npm run build
npm run preview  # Test production build locally
```

### Code Quality

```bash
npm run typecheck  # Type checking
npm run lint       # Linting
npm run lint:fix   # Auto-fix linting issues
npm run format     # Format code
npm test           # Run tests
```

## Deployment

See [Deployment Guide](./docs/DEPLOYMENT.md) for detailed instructions.

### Cloudflare Pages (Automatic)

Push to `main` branch triggers automatic deployment.

### Custom Domain

1. Add custom domain in Cloudflare Pages dashboard
2. Update DNS records as instructed
3. SSL certificate auto-provisioned

## Supabase Setup

### 1. Apply Migrations

```bash
# Via Supabase Dashboard (recommended)
# Go to SQL Editor and run migrations in order:
# - supabase/migrations/20251216131852_dinein_v1_schema.sql
# - supabase/migrations/20250120000000_phase1_rls_performance_fix.sql
# - ... (other migrations)

# Or via CLI
supabase db push
```

### 2. Deploy Edge Functions

```bash
supabase functions deploy gemini-features --project-ref YOUR_PROJECT_REF
supabase functions deploy vendor_claim --project-ref YOUR_PROJECT_REF
supabase functions deploy order_create --project-ref YOUR_PROJECT_REF
supabase functions deploy order_update_status --project-ref YOUR_PROJECT_REF
supabase functions deploy order_mark_paid --project-ref YOUR_PROJECT_REF
supabase functions deploy tables_generate --project-ref YOUR_PROJECT_REF
```

### 3. Configure Authentication

- Enable **Anonymous** authentication in Supabase Dashboard
- Enable **Google OAuth** provider for admin access
- Configure OAuth redirect URL: `https://your-domain.com/admin/dashboard`
- Set up email/password for vendors

## Route Structure

### Public Routes (Client)
- `/` - Home page
- `/explore` - Discover nearby venues (Gemini-powered)
- `/v/:vendorSlug` - Vendor menu page
- `/v/:vendorSlug/t/:tableCode` - Menu with table context
- `/profile` - User profile
- `/order/:id` - Order status

### Vendor Routes (Private - requires vendor role)
- `/vendor/login` - Vendor login
- `/vendor` - Vendor dashboard
- `/vendor/menu` - Manage menu
- `/vendor/orders` - Manage orders
- `/vendor/tables` - Manage tables & QR codes

### Admin Routes (Private - requires admin role)
- `/admin/login` - Admin login (Google OAuth)
- `/admin` - Admin dashboard
- `/admin/vendors` - Manage vendors (create, edit, activate)
- `/admin/users` - Manage vendor users
- `/admin/system` - System settings

## Authentication & Authorization

### Client (Public)
- Uses **anonymous authentication** (auto-initialized)
- No login required
- Can browse venues, place orders

### Vendor
- **Email/password** authentication
- Must be provisioned by admin in `vendor_users` table
- Can only access their assigned vendor's data

### Admin
- **Google OAuth** authentication only
- Must exist in `admin_users` table
- Full system access

### Role Checking

**Frontend**: Route guards (`RequireAuth` component) prevent unauthorized access
**Backend**: Supabase RLS policies enforce data access at database level

## Vendor Provisioning (Admin-Only)

Vendors can **only** be created by admins:

1. Admin logs in via Google OAuth
2. Admin navigates to `/admin/vendors`
3. Admin selects venue from Gemini discovery results
4. Admin creates vendor record with status (pending/active)
5. Admin creates vendor user accounts and assigns roles

**Public vendor claiming has been removed** - this is now an admin-only operation.

## Development

### Adding New Features

1. Create components in `apps/web/components/`
2. Add pages in `apps/web/pages/`
3. Update routes in `apps/web/App.tsx`
4. Add services in `apps/web/services/`
5. Update RLS policies in `supabase/migrations/` if needed

### Testing

```bash
cd apps/web
npm test
npm run test:watch
npm run test:coverage
```

## Documentation

- [User Journeys](./docs/user-journeys.md) - Complete user flows
- [Production Readiness](./docs/production-readiness.md) - Production checklist
- [Deployment Guide](./docs/DEPLOYMENT.md) - Deployment instructions
- [Changelog](./docs/CHANGELOG.md) - Version history

## License

Private - All rights reserved
