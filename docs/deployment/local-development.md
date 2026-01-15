# Local Development Setup

Guide for setting up the DineIn Malta PWA for local development and testing.

## Prerequisites

- Node.js 20+ ([Download](https://nodejs.org/))
- npm or yarn
- Git

## Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd dinein
```

### 2. Install Dependencies

From the repository root:

```bash
npm install
```

Or from the app directory:

```bash
cd apps/web
npm install
```

### 3. Environment Variables

Create `.env.local` file in `apps/web/`:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Note:** Never commit `.env.local` to git. It's already in `.gitignore`.

### 4. Run Development Server

```bash
cd apps/web
npm run dev
```

The app will be available at `http://localhost:5173` (or the port shown in terminal).

## Environment Variables

### Client-Side Variables

For local development, create `.env.local` in `apps/web/`:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Getting Supabase Credentials

1. Go to Supabase Dashboard → Your Project → Settings → API
2. Copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon/public key** → `VITE_SUPABASE_ANON_KEY`

**Important:** `GEMINI_API_KEY` is not needed for local development unless you're testing edge functions locally.

## Development Workflow

### Hot Module Replacement (HMR)

The development server supports hot module replacement:
- Changes to components update instantly
- No page refresh needed
- State is preserved when possible

### Running Type Checks

```bash
cd apps/web
npm run typecheck
```

### Running Linter

```bash
cd apps/web
npm run lint
npm run lint:fix  # Auto-fix issues
```

### Running Tests

```bash
cd apps/web
npm test
npm run test:watch  # Watch mode
npm run test:coverage  # With coverage
```

### Building for Production (Local Test)

```bash
cd apps/web
npm run build
npm run preview  # Preview production build locally
```

## Project Structure

```
apps/web/
├── components/      # React components
├── pages/          # Route components
├── services/       # API services
├── context/        # React contexts
├── hooks/          # Custom React hooks
├── utils/          # Utility functions
├── public/         # Static assets
└── types/          # TypeScript types
```

## Common Tasks

### Adding a New Component

1. Create component in `apps/web/components/`
2. Export from `components/index.ts` if needed
3. Import and use in pages

### Adding a New Page

1. Create page in `apps/web/pages/`
2. Add route in `apps/web/App.tsx`
3. Update navigation if needed

### Adding a New Service

1. Create service in `apps/web/services/`
2. Follow existing service patterns
3. Use Supabase client from `services/supabase.ts`

## Troubleshooting

### Port Already in Use

If port 5173 is already in use:

```bash
npm run dev -- --port 3000
```

### Module Not Found

Clear cache and reinstall:

```bash
rm -rf node_modules package-lock.json
npm install
```

### TypeScript Errors

Run type check to see all errors:

```bash
npm run typecheck
```

### Build Errors

Check for missing dependencies:

```bash
npm install
npm run build
```

### Supabase Connection Issues

1. Verify `.env.local` file exists and has correct values
2. Check Supabase project is active
3. Verify network connection
4. Check browser console for CORS errors

## Development Best Practices

### Code Quality

- Run `npm run lint` before committing
- Fix TypeScript errors before pushing
- Write tests for new features

### Git Workflow

1. Create feature branch
2. Make changes
3. Run linter and tests
4. Commit with descriptive messages
5. Push and create PR

### Testing Locally

- Test all user roles (client, vendor, admin)
- Test on different screen sizes
- Test offline functionality
- Verify service worker updates

## Database Setup (Optional)

If you need a local Supabase instance:

```bash
# Install Supabase CLI
npm install -g supabase

# Start local Supabase
supabase start

# Apply migrations
supabase db reset
```

See [Supabase Setup](./supabase-setup.md) for more details.

## Performance Testing

### Lighthouse

Run Lighthouse audit:

```bash
npm run build
npm run preview
# Then run Lighthouse from Chrome DevTools
```

### Bundle Analysis

Analyze bundle size:

```bash
scripts/analyze-bundle.sh
```

## Next Steps

- [Cloudflare Pages Deployment](./cloudflare-pages.md)
- [Supabase Setup](./supabase-setup.md)
- [Troubleshooting](./troubleshooting.md)

---

**Need help?** See [Troubleshooting](./troubleshooting.md) or check the main [README](../../README.md).
