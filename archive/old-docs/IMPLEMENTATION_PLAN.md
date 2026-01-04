# 🛠️ Implementation Plan - Fix All Audit Issues

## Quick Start

This document provides step-by-step implementation guides to fix all issues identified in the comprehensive audit.

---

## Phase 1: Critical Database Fixes (Priority: P0)

### Task 1.1: Create `profiles` Table Migration

**File:** `supabase/migrations/20250116000003_create_profiles_table.sql`

```sql
-- Create profiles table for user profile management
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Guest',
  role TEXT NOT NULL DEFAULT 'CLIENT',
  favorites JSONB DEFAULT '[]'::jsonb,
  notifications_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for quick lookups
CREATE INDEX IF NOT EXISTS idx_profiles_id ON public.profiles(id);

-- Updated_at trigger
DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- RLS Policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Users can insert their own profile (on first creation)
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_insert_own"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);
```

**Apply:** Via Supabase Dashboard SQL Editor

---

### Task 1.2: Create `audit_logs` Table Migration

**File:** `supabase/migrations/20250116000004_create_audit_logs_table.sql`

```sql
-- Create audit_logs table for admin audit trail
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_auth_user_id UUID NOT NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  metadata_json JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON public.audit_logs(actor_auth_user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON public.audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON public.audit_logs(created_at DESC);

-- RLS: Admin only
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "audit_logs_admin_select" ON public.audit_logs;
CREATE POLICY "audit_logs_admin_select"
  ON public.audit_logs FOR SELECT
  USING (public.is_admin());

-- Service role can insert (from Edge Functions)
DROP POLICY IF EXISTS "audit_logs_service_insert" ON public.audit_logs;
CREATE POLICY "audit_logs_service_insert"
  ON public.audit_logs FOR INSERT
  WITH CHECK (true); -- Service role bypasses RLS anyway
```

**Apply:** Via Supabase Dashboard SQL Editor

---

### Task 1.3: Fix Menu Management Architecture

**Step 1:** Update `apps/universal/services/mockDatabase.ts`

Replace the `updateVenueMenu` function and add proper menu CRUD:

```typescript
// Add these new functions after the existing menu functions

// CREATE Menu Item
export const createMenuItem = async (
  vendorId: string,
  item: Omit<MenuItem, 'id'>
): Promise<MenuItem> => {
  const { data, error } = await supabase
    .from('menu_items')
    .insert({
      vendor_id: vendorId,
      name: item.name,
      description: item.description,
      price: item.price,
      category: item.category,
      is_available: item.available,
      tags_json: item.tags || [],
      image_url: item.imageUrl || null,
      currency: 'EUR'
    })
    .select()
    .single();
    
  if (error) throw error;
  return mapMenuItem(data);
};

// UPDATE Menu Item
export const updateMenuItem = async (
  itemId: string,
  updates: Partial<MenuItem>
): Promise<MenuItem> => {
  const dbUpdates: any = {};
  if (updates.name) dbUpdates.name = updates.name;
  if (updates.description !== undefined) dbUpdates.description = updates.description;
  if (updates.price !== undefined) dbUpdates.price = updates.price;
  if (updates.category) dbUpdates.category = updates.category;
  if (updates.available !== undefined) dbUpdates.is_available = updates.available;
  if (updates.tags) dbUpdates.tags_json = updates.tags;
  if (updates.imageUrl !== undefined) dbUpdates.image_url = updates.imageUrl;
  
  const { data, error } = await supabase
    .from('menu_items')
    .update(dbUpdates)
    .eq('id', itemId)
    .select()
    .single();
    
  if (error) throw error;
  return mapMenuItem(data);
};

// DELETE Menu Item
export const deleteMenuItem = async (itemId: string): Promise<void> => {
  const { error } = await supabase
    .from('menu_items')
    .delete()
    .eq('id', itemId);
    
  if (error) throw error;
};

// GET Menu Items for Vendor
export const getMenuItemsForVendor = async (vendorId: string): Promise<MenuItem[]> => {
  const { data, error } = await supabase
    .from('menu_items')
    .select('*')
    .eq('vendor_id', vendorId)
    .order('category', { ascending: true })
    .order('name', { ascending: true });
    
  if (error) throw error;
  return (data || []).map(mapMenuItem);
};

// Replace the old updateVenueMenu function
export const updateVenueMenu = async (venueId: string, menu: MenuItem[]): Promise<void> => {
  // Get current menu items
  const currentItems = await getMenuItemsForVendor(venueId);
  const currentIds = new Set(currentItems.map(i => i.id));
  const newIds = new Set(menu.map(i => i.id));
  
  // Delete items not in new menu
  for (const item of currentItems) {
    if (!newIds.has(item.id)) {
      await deleteMenuItem(item.id);
    }
  }
  
  // Create or update items
  for (const item of menu) {
    if (item.id.startsWith('new-') || !currentIds.has(item.id)) {
      // Create new item
      const { id, ...itemData } = item;
      await createMenuItem(venueId, itemData);
    } else {
      // Update existing item
      await updateMenuItem(item.id, item);
    }
  }
};

// Update mapVenue to fetch menu items
const mapVenue = async (row: any): Promise<Venue> => {
  // Fetch menu items separately
  const menuItems = await getMenuItemsForVendor(row.id);
  
  return {
    id: row.id,
    googlePlaceId: row.google_place_id,
    name: row.name,
    address: row.address || '',
    description: '', // Not in schema, could add if needed
    revolutHandle: row.revolut_link || '',
    phone: row.phone,
    whatsappNumber: row.whatsapp,
    website: row.website,
    openingHours: row.hours_json ? JSON.stringify(row.hours_json) : undefined,
    tags: [],
    menu: menuItems, // Now fetched from menu_items table
    imageUrl: row.photos_json?.[0] || undefined,
    ownerId: undefined, // Would need to join vendor_users
    lat: row.lat,
    lng: row.lng,
    currency: row.currency || 'EUR',
    status: row.status
  };
};
```

**Step 2:** Add `mapMenuItem` helper function:

```typescript
const mapMenuItem = (row: any): MenuItem => {
  return {
    id: row.id,
    name: row.name,
    description: row.description || '',
    price: parseFloat(row.price),
    imageUrl: row.image_url || undefined,
    category: row.category || 'Mains',
    available: row.is_available ?? true,
    tags: row.tags_json || [],
    options: [] // Could add options_json field if needed
  };
};
```

**Step 3:** Update `getVenueBySlug` to fetch menu:

```typescript
export const getVenueBySlug = async (slug: string): Promise<Venue | null> => {
  const { data, error } = await supabase
    .from('vendors')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'active')
    .single();
    
  if (error || !data) return null;
  return await mapVenue(data);
};
```

---

### Task 1.4: Fix Reservation Schema Mismatch

**Update `apps/universal/types.ts`:**

```typescript
export interface Reservation {
  id: string;
  venueId: string;
  clientAuthUserId: string; // Changed from customerName
  partySize: number;
  datetime: string; // Changed from dateTime (number) to ISO string
  notes?: string;
  status: ReservationStatus;
  createdAt: string; // ISO string
}
```

**Update `apps/universal/services/mockDatabase.ts`:**

```typescript
// Update mapReservation function
const mapReservation = (row: any): Reservation => {
  return {
    id: row.id,
    venueId: row.vendor_id,
    clientAuthUserId: row.client_auth_user_id,
    partySize: row.party_size,
    datetime: row.datetime, // Already ISO string from DB
    notes: row.notes || undefined,
    status: mapReservationStatus(row.status),
    createdAt: row.created_at
  };
};

// Update createReservation function
export const createReservation = async (resData: {
  venueId: string;
  partySize: number;
  datetime: string; // ISO timestamp
  notes?: string;
}): Promise<Reservation> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Must be authenticated to create reservation');
  
  const { data, error } = await supabase
    .from('reservations')
    .insert({
      vendor_id: resData.venueId,
      client_auth_user_id: user.id,
      party_size: resData.partySize,
      datetime: resData.datetime,
      notes: resData.notes
    })
    .select()
    .single();
    
  if (error) throw error;
  return mapReservation(data);
};

// Update getReservationsForVenue
export const getReservationsForVenue = async (venueId: string): Promise<Reservation[]> => {
  const { data, error } = await supabase
    .from('reservations')
    .select('*')
    .eq('vendor_id', venueId)
    .order('datetime', { ascending: true });
    
  if (error) throw error;
  return (data || []).map(mapReservation);
};

// Add helper for status mapping
const mapReservationStatus = (dbStatus: string): ReservationStatus => {
  const upper = dbStatus.toUpperCase();
  if (upper === 'PENDING') return ReservationStatus.PENDING;
  if (upper === 'ACCEPTED') return ReservationStatus.CONFIRMED;
  if (upper === 'DECLINED') return ReservationStatus.DECLINED;
  if (upper === 'CANCELLED') return ReservationStatus.CANCELLED;
  return ReservationStatus.PENDING;
};
```

---

## Phase 2: Code Cleanup (Priority: P1)

### Task 2.1: Remove Gemini Mock Mode Toggle

**Update `apps/universal/services/geminiService.ts`:**

```typescript
// REMOVE these lines:
// const STORAGE_KEY = 'dinein_live_ai_mode';
// let LIVE_AI_MODE = localStorage.getItem(STORAGE_KEY) === 'true';
// export const setLiveAiMode = (enable: boolean) => { ... }
// export const isLiveAiMode = () => LIVE_AI_MODE;

// REPLACE with always-on API calls with DB fallback:

export const findNearbyPlaces = async (lat: number, lng: number, excludeNames: string[] = []) => {
  try {
    const result = await invokeGemini('discover', { lat, lng });
    return result || [];
  } catch (e) {
    console.warn('Gemini API failed, falling back to database', e);
    // Fallback to DB on error (not a mode toggle)
    const dbVenues = await getFeaturedVenues(10);
    return dbVenues.filter(v => !excludeNames.includes(v.name));
  }
};

export const discoverGlobalVenues = async () => {
  try {
    return await invokeGemini('search', { query: "popular bars and restaurants in Malta" });
  } catch(e) {
    console.warn('Gemini API failed, falling back to database', e);
    return await getFeaturedVenues(10);
  }
};

// Update all other functions similarly - always try API, fallback to DB/empty on error
```

**Update `apps/universal/pages/DeveloperSwitchboard.tsx`:**

```typescript
// REMOVE the AI Mode Toggle section entirely
// Keep only the navigation buttons
```

---

### Task 2.2: Rename `mockDatabase.ts`

**Steps:**
1. Rename file: `apps/universal/services/mockDatabase.ts` → `apps/universal/services/databaseService.ts`
2. Update all imports:
   ```bash
   # Find all imports
   grep -r "from './mockDatabase'" apps/universal
   grep -r "from '../services/mockDatabase'" apps/universal
   
   # Replace with:
   # from './databaseService'
   # from '../services/databaseService'
   ```

**Files to update:**
- `apps/universal/pages/AdminDashboard.tsx`
- `apps/universal/pages/ClientHome.tsx`
- `apps/universal/pages/ClientMenu.tsx`
- `apps/universal/pages/VendorDashboard.tsx`
- `apps/universal/services/geminiService.ts`
- Any other files importing mockDatabase

---

### Task 2.3: Add Error Boundaries

**Create `apps/universal/components/ErrorBoundary.tsx`:**

```typescript
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { GlassCard } from './GlassCard';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    // TODO: Send to error tracking service
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      return (
        <div className="min-h-screen flex items-center justify-center p-6">
          <GlassCard className="max-w-md w-full p-6 text-center">
            <h2 className="text-2xl font-bold mb-4 text-red-500">Something went wrong</h2>
            <p className="text-muted mb-4">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Reload Page
            </button>
          </GlassCard>
        </div>
      );
    }

    return this.props.children;
  }
}
```

**Update `apps/universal/App.tsx`:**

```typescript
import { ErrorBoundary } from './components/ErrorBoundary';

// Wrap routes with ErrorBoundary
<ErrorBoundary>
  <Routes>
    {/* ... existing routes ... */}
  </Routes>
</ErrorBoundary>
```

---

### Task 2.4: Fix PWA Icon URLs

**Update `apps/universal/manifest.json`:**

```json
{
  "name": "DineIn Universal",
  "short_name": "DineIn",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#000000",
  "theme_color": "#000000",
  "orientation": "portrait-primary",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

**Ensure icons are in `public/icons/` directory**

---

## Phase 3: Frontend Improvements (Priority: P1)

### Task 3.1: Add Input Validation

**Create `apps/universal/utils/validation.ts`:**

```typescript
export const validateEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const validatePhone = (phone: string): boolean => {
  return /^\+?[\d\s-()]+$/.test(phone);
};

export const validateRequired = (value: any): boolean => {
  if (typeof value === 'string') return value.trim().length > 0;
  return value != null;
};

export const validatePrice = (price: number): boolean => {
  return price >= 0 && price <= 10000;
};

export const validateUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};
```

**Use in forms throughout the app**

---

### Task 3.2: Improve Loading States

**Update components to show loading indicators during async operations:**

```typescript
// Example pattern:
const [loading, setLoading] = useState(false);

const handleSubmit = async () => {
  setLoading(true);
  try {
    await someAsyncOperation();
  } finally {
    setLoading(false);
  }
};

return (
  <button disabled={loading}>
    {loading ? <Spinner /> : 'Submit'}
  </button>
);
```

---

## Phase 4: Verification & Testing

### Task 4.1: Verify Edge Functions Deployed

```bash
# Check deployed functions
supabase functions list

# Test gemini-features function
curl -X POST https://elhlcdiosomutugpneoc.supabase.co/functions/v1/gemini-features \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"action": "discover", "payload": {"lat": 35.8989, "lng": 14.5146}}'
```

### Task 4.2: Test Database Migrations

```sql
-- Verify profiles table exists
SELECT * FROM public.profiles LIMIT 1;

-- Verify audit_logs table exists
SELECT * FROM public.audit_logs LIMIT 1;

-- Verify menu_items can be queried
SELECT * FROM public.menu_items LIMIT 1;
```

---

## Quick Reference: File Changes Summary

### New Files to Create:
1. `supabase/migrations/20250116000003_create_profiles_table.sql`
2. `supabase/migrations/20250116000004_create_audit_logs_table.sql`
3. `apps/universal/components/ErrorBoundary.tsx`
4. `apps/universal/utils/validation.ts`

### Files to Modify:
1. `apps/universal/services/mockDatabase.ts` → Rename to `databaseService.ts` + fix menu/reservation functions
2. `apps/universal/services/geminiService.ts` → Remove mock mode
3. `apps/universal/types.ts` → Fix Reservation type
4. `apps/universal/pages/DeveloperSwitchboard.tsx` → Remove AI toggle
5. `apps/universal/App.tsx` → Add ErrorBoundary
6. `apps/universal/manifest.json` → Fix icon URLs
7. All files importing `mockDatabase` → Update imports

### Estimated Time:
- Phase 1: 8-10 hours
- Phase 2: 4-6 hours
- Phase 3: 6-8 hours
- Phase 4: 2-4 hours
- **Total: 20-28 hours (3-4 days)**

---

## Testing Checklist

After implementing fixes, test:

- [ ] User can create profile
- [ ] User can update profile
- [ ] Menu items can be created
- [ ] Menu items can be updated
- [ ] Menu items can be deleted
- [ ] Reservations can be created
- [ ] Gemini API calls work
- [ ] DB fallback works when API fails
- [ ] Error boundaries catch errors
- [ ] PWA icons display correctly
- [ ] All Edge Functions respond
- [ ] Admin audit logs work

---

**Ready to proceed?** Start with Phase 1, Task 1.1 (Create profiles table migration).

