# DineIn Web

A premium Progressive Web Application for instant table reservations and QR ordering at Malta's best local venues.

## Tech Stack

- **Framework**: React 18 + Vite
- **Styling**: Tailwind CSS + "Soft Liquid Glass" design system
- **Animation**: Framer Motion
- **Backend**: Supabase (Auth, Database, Storage)
- **PWA**: Workbox with Background Sync for offline orders
- **Hosting**: Cloudflare Pages

## Quick Start

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run audit` | Run Lighthouse audit |
| `npm run analyze` | Analyze bundle size |

## Deployment (Cloudflare Pages)

### Prerequisites
- Cloudflare account with Pages enabled
- Supabase project with credentials

### Environment Variables
Configure in Cloudflare Pages dashboard:

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key |

### Deploy Steps
1. Connect repository to Cloudflare Pages
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Add environment variables
5. Deploy

### Rollback
1. Go to Cloudflare Pages → Deployments
2. Find previous successful deployment
3. Click "Rollback to this deployment"

## Security

- **CSP Headers**: Configured in `public/_headers`
- **RLS Policies**: Database-level access control via Supabase
- **No XSS Vectors**: Code audited for `eval()` and `dangerouslySetInnerHTML`

## Performance

| Metric | Score |
|--------|-------|
| Lighthouse Performance | 87 |
| Lighthouse Accessibility | 85 |
| Lighthouse Best Practices | 100 |
| Lighthouse SEO | 91 |

### Bundle Optimization
- Initial chunk < 75KB
- Heavy libs (Recharts, Framer Motion) lazy-loaded
- Assets cached with immutable headers

## PWA Features

- **Offline Support**: Service worker with precaching
- **Background Sync**: Orders queue when offline
- **Installable**: Add to home screen on mobile

## Project Structure

```
src/
├── components/     # Reusable UI components
├── features/       # Feature-specific modules
├── flows/          # Page-level flows (PWA, Admin, Vendor)
├── shared/         # Shared utilities and services
└── sw.ts           # Custom service worker
```

## License

Private - DineIn Malta
