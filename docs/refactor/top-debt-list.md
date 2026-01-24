# DineIn Refactor — Top 20 Technical Debt Items

> **Phase A Deliverable** — Prioritized debt list for refactor planning  
> Generated: 2026-01-24

---

## Scoring Legend

| Severity | Impact |
|----------|--------|
| 🔴 High | Blocks features, causes bugs, security risk |
| 🟡 Medium | Maintenance burden, inconsistency |
| 🟢 Low | Nice to fix, minimal impact |

| Effort | Time |
|--------|------|
| XS | < 1 hour |
| S | 1-4 hours |
| M | 4-8 hours |
| L | 1-2 days |
| XL | 2+ days |

---

## Top 20 Debt Items

### 1. 🔴 **packages/db uses mock data instead of real Supabase queries**
- **File:** `packages/db/src/index.ts`
- **Severity:** High | **Effort:** L
- **Why:** Apps bypass this package and make direct Supabase calls. No single source of truth for data access.
- **Fix:** Create typed query helpers (getVenueBySlug, createOrder, etc.) and migrate apps to use them.

---

### 2. 🔴 **No E2E tests for critical journeys**
- **Location:** Missing entirely
- **Severity:** High | **Effort:** L
- **Why:** Cannot safely refactor without regression tests. STARTER RULES require QR→menu→order test.
- **Fix:** Add Playwright E2E for: customer order flow, venue status update, admin claim approval.

---

### 3. 🔴 **Duplicate index.css across all 3 apps (36KB × 3)**
- **Files:** 
  - `apps/customer/src/index.css`
  - `apps/venue/src/index.css`
  - `apps/admin/src/index.css`
- **Severity:** High | **Effort:** M
- **Why:** Changes must be made in 3 places. 108KB of duplicated CSS.
- **Fix:** Consolidate into `packages/ui/src/styles/` and import from there.

---

### 4. 🟡 **Duplicate design-system folders in venue and admin**
- **Files:**
  - `apps/venue/src/design-system/` (6 files)
  - `apps/admin/src/design-system/` (6 files)
- **Severity:** Medium | **Effort:** S
- **Why:** Duplicates tokens already in `packages/ui/src/tokens/`. Inconsistent usage.
- **Fix:** Delete local folders, import tokens from `@dinein/ui`.

---

### 5. 🟡 **Cart store type inconsistency (id as number vs string UUID)**
- **File:** `apps/customer/src/store/useCartStore.ts`
- **Severity:** Medium | **Effort:** S
- **Why:** CartItem.id is typed as number but UUIDs are strings. Causes type errors.
- **Fix:** Change CartItem.id to string type throughout.

---

### 6. 🟡 **Apps duplicate Radix UI dependencies**
- **Files:** All 3 app `package.json` files
- **Severity:** Medium | **Effort:** M
- **Why:** 13 Radix packages duplicated in each app. Should be peer deps from packages/ui.
- **Fix:** Remove from apps, add as peerDependencies in packages/ui.

---

### 7. 🔴 **Potential scope violations in edge functions**
- **Files:**
  - `supabase/functions/create_payment_intent/`
  - `supabase/functions/momo_charge/`
  - `supabase/functions/revolut_charge/`
- **Severity:** High | **Effort:** M
- **Why:** STARTER RULES prohibit payment API integrations. These may be dead code or violations.
- **Fix:** Audit and remove if unused. Payments should be handoff only.

---

### 8. 🟡 **Large page components that should be split**
- **Files:**
  - `apps/venue/src/pages/MenuManager.tsx` (12.8KB)
  - `apps/venue/src/pages/OrdersQueue.tsx` (7.8KB)
  - `apps/venue/src/pages/IngestMenu.tsx` (8.2KB)
  - `apps/customer/src/pages/Checkout.tsx` (7.7KB)
- **Severity:** Medium | **Effort:** M
- **Why:** Hard to maintain and test. Single responsibility violated.
- **Fix:** Extract into smaller components (MenuItemEditor, CategoryList, OrderCard, etc.)

---

### 9. 🟡 **Duplicate shared folders in venue and admin**
- **Files:**
  - `apps/venue/src/shared/` (9 files)
  - `apps/admin/src/shared/` (9 files)
- **Severity:** Medium | **Effort:** M
- **Why:** Likely contains UI components that belong in packages/ui.
- **Fix:** Audit contents, migrate to packages/ui or packages/core.

---

### 10. 🟢 **A2HS prompt appears too early**
- **File:** `apps/customer/src/App.tsx`
- **Severity:** Low | **Effort:** XS
- **Why:** STARTER RULES require prompt after meaningful engagement (order placed, 2+ items, 45s+).
- **Fix:** Delay prompt trigger based on engagement criteria.

---

### 11. 🟡 **Stories folder not integrated in CI**
- **Files:**
  - `apps/venue/src/stories/` (16 files)
  - `apps/admin/src/stories/` (16 files)
- **Severity:** Medium | **Effort:** S
- **Why:** Storybook stories exist but no CI job runs them. Drift risk.
- **Fix:** Either add Storybook to CI or remove unused stories.

---

### 12. 🟡 **Placeholder routes in admin app**
- **File:** `apps/admin/src/App.tsx`
- **Severity:** Medium | **Effort:** S
- **Why:** `/dashboard/users` and `/dashboard/audit` are placeholders. Incomplete MVP.
- **Fix:** Implement or remove from routing.

---

### 13. 🟡 **No unit tests for packages/core**
- **Location:** `packages/core/`
- **Severity:** Medium | **Effort:** S
- **Why:** Core domain logic (getNextOrderStatus, etc.) has no tests.
- **Fix:** Add vitest tests for all pure functions.

---

### 14. 🟢 **recharts used in all apps but only needed in venue**
- **Files:** All 3 app `package.json` files
- **Severity:** Low | **Effort:** S
- **Why:** Only venue Overview page uses charts. 122KB added to customer/admin bundles.
- **Fix:** Remove from customer and admin.

---

### 15. 🟢 **react-window not clearly used**
- **Files:** All 3 app `package.json` files
- **Severity:** Low | **Effort:** XS
- **Why:** Virtualization library installed but usage unclear.
- **Fix:** Audit usage, remove if unused.

---

### 16. 🟡 **Types not auto-generated from Supabase schema**
- **File:** `packages/db/src/types.ts`
- **Severity:** Medium | **Effort:** M
- **Why:** Manual type definitions may drift from actual DB schema.
- **Fix:** Set up supabase gen types workflow.

---

### 17. 🟢 **packages/commons unclear purpose**
- **Location:** `packages/commons/`
- **Severity:** Low | **Effort:** XS
- **Why:** Only 2 files, purpose unclear. May be dead.
- **Fix:** Audit and remove or document.

---

### 18. 🟡 **39 migrations with many incremental fixes**
- **Location:** `supabase/migrations/`
- **Severity:** Medium | **Effort:** L
- **Why:** Migration sprawl makes schema understanding hard. Many fix_ migrations.
- **Fix:** Consider squashing old migrations (after current state is stable).

---

### 19. 🟢 **qrcode package in all apps but only used in venue**
- **Files:** All 3 app `package.json` files
- **Severity:** Low | **Effort:** XS
- **Why:** QR generation only in venue Settings. Adds to customer/admin bundles.
- **Fix:** Remove from customer and admin.

---

### 20. 🟡 **country.ts overlap with index.ts exports in packages/core**
- **Files:**
  - `packages/core/src/index.ts`
  - `packages/core/src/country.ts`
- **Severity:** Medium | **Effort:** XS
- **Why:** Both files export country-related types. Confusion risk.
- **Fix:** Consolidate exports in index.ts or clearly separate concerns.

---

## Priority Matrix

| Effort ↓ / Severity → | 🔴 High | 🟡 Medium | 🟢 Low |
|-----------------------|---------|-----------|--------|
| **XS** | — | #20 | #10, #15, #17, #19 |
| **S** | — | #4, #5, #11, #12, #13 | #14 |
| **M** | #3, #7 | #6, #8, #9, #16 | — |
| **L** | #1, #2 | #18 | — |
| **XL** | — | — | — |

---

## Recommended Attack Order

1. **#2** — Add E2E tests (safety net for all other changes)
2. **#3** — Consolidate CSS (immediate bundle win)
3. **#5** — Fix cart type (unblocks customer flow refactor)
4. **#1** — Build packages/db query layer (foundation for data refactor)
5. **#4, #6** — Deduplicate design-system and Radix deps
6. **#7** — Audit and remove payment edge functions if unused
7. **#8, #9** — Split large components and consolidate shared folders
