---
description: Multi-agent orchestration template (UI / Backend / QA / Integrator)
---

# Parallel Split Workflow

Use this workflow to coordinate large features across multiple work streams. Each stream has a virtual "agent" role with distinct responsibilities.

## When to Use

- Large features spanning UI, backend, and tests
- Major refactors affecting many files
- Production hardening with multiple parallel tracks
- Sprint-style work with clear deliverables

## Work Stream Definitions

### 🎨 UI Agent
**Focus**: Frontend components, pages, styling, animations

Responsibilities:
- Create/update React components
- Apply design system (Soft Liquid Glass)
- Ensure responsive layout (mobile-first)
- Loading, empty, and error states
- Accessibility (ARIA, keyboard nav, focus states)

Outputs:
- Component files in `apps/web/src/components/`
- Page files in `apps/web/src/pages/`
- CSS/Tailwind updates
- Before/after screenshots

---

### ⚙️ Backend Agent
**Focus**: Database, Edge Functions, API, RLS

Responsibilities:
- Schema migrations
- Supabase Edge Functions
- RLS policies (Staff vs Admin enforcement)
- API service layer (`apps/web/src/services/`)
- Input validation, rate limiting

Outputs:
- Migration files in `supabase/migrations/`
- Edge functions in `supabase/functions/`
- RLS policy updates
- Service files in `apps/web/src/services/`

---

### 🧪 QA Agent
**Focus**: Testing, verification, regression protection

Responsibilities:
- Unit tests (Vitest)
- Integration tests
- E2E tests (Playwright)
- RBAC verification (Staff/Admin)
- Manual test checklists
- Bug reproduction

Outputs:
- Test files in `apps/web/__tests__/` or `apps/web/src/test/`
- E2E specs in `apps/web/e2e/`
- UAT checklist updates
- Bug reports with evidence

---

### 🔗 Integrator Agent
**Focus**: Coordination, merge, deploy, docs

Responsibilities:
- Merge work from all streams
- Resolve conflicts
- Run full verification suite
- Update documentation
- Deploy to staging/production
- Create walkthrough

Outputs:
- Updated `README.md`, docs
- Deployment verification
- Final walkthrough with proof
- Git commits/PRs

---

### 📱 Mobile Experience Agent (Client-Facing PWA: Discovery/DineIn)
**Focus**: Deliver a native mobile app experience — touch-first, fast, smooth, delightful, robust on real phones

> **Mission**: Maximum native mobile app experience without breaking the minimalist design system.

#### Non-negotiables

- **Mobile-first**: Design starts at 360×800, expands upward
- **"Native feel"**: Thumb ergonomics, transitions, feedback, performance
- **Zero blank screens**: Loading/empty/error states everywhere
- **Offline/weak network**: Behavior is intentional and user-friendly
- **Respect `prefers-reduced-motion`**

#### Primary Focus Areas

**Navigation Architecture**
- Bottom navigation (or thumb-reachable primary nav) for core sections
- Clear back behavior and deep-link handling
- Avoid drawer-heavy navigation as primary on client apps unless justified

**Touch UX & Ergonomics**
- Touch targets ≥ 44px
- No hover-only affordances
- Gestures where appropriate (swipe-to-close modals, pull-to-refresh if safe)
- Key actions always reachable with one hand

**Perceived Performance**
- Skeletons instead of spinners for content loads
- Optimistic UI for safe actions (with rollback on failure)
- Route-level code splitting + prefetch only critical routes
- Virtualize long lists (feeds, menus, vendors) to avoid jank

**Motion Design**
- Subtle transitions: screen enter/exit, bottom-sheet open/close, list item feedback
- No heavy animations on low-end devices
- Must degrade gracefully under reduced-motion

**Mobile PWA Polish**
- Correct manifest + icons + theme color
- Installability works
- Service worker strategy does not cause "stale JS" bugs
- "Slow network" and "offline" states are handled with clear UX

**Device Realities**
Test at least:
- Small Android (360×800)
- iPhone-ish (390×844)
- Tablet-ish (768×1024)
- Keyboard overlays: inputs must not hide behind the keyboard

#### Deliverables

- Mini Plan + Mini Task List
- Specific changes to:
  - Navigation layout
  - Mobile component variants (bottom sheets, drawers, full-screen dialogs)
  - Loading/empty/error states
  - Performance fixes (virtualization, lazy loading)
- Verification evidence:
  - Mobile viewport walkthrough recording
  - Screenshots for 3–6 core flows
  - "Slow network" check notes (no infinite loading)

#### Handoff Format (must be explicit)

- Changed files list
- Mobile flows tested (with expected results)
- Any remaining mobile UX debt
- Risks + rollback notes

---

## Orchestration Template

### Phase 1: Planning (All Agents)

1. **Define scope** – What's the feature/change?
2. **Create task breakdown** – Split by agent
3. **Identify dependencies** – What blocks what?
4. **Agree on contracts** – API shapes, component props, test scenarios

```
┌─────────────────────────────────────────────┐
│              PLANNING PHASE                 │
├─────────────────────────────────────────────┤
│  UI: Design mockups, component list         │
│  Backend: Schema, API contracts             │
│  QA: Test plan, scenarios                   │
│  Integrator: Timeline, dependencies         │
└─────────────────────────────────────────────┘
```

### Phase 2: Parallel Execution

#### Mobile-first Rule

- **If the current app is client-facing** (Discovery/DineIn or any consumer interface), spawn a dedicated **Mobile Experience Agent**.
- **If the current app is staff/admin internal portal only**, do NOT spawn the Mobile Experience Agent (use UI/UX + QA agents instead).

Work streams execute concurrently:

```
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│   UI Agent   │   │Backend Agent │   │   QA Agent   │
├──────────────┤   ├──────────────┤   ├──────────────┤
│ Components   │   │ Migrations   │   │ Unit tests   │
│ Pages        │   │ Edge funcs   │   │ E2E setup    │
│ Styling      │   │ Services     │   │ Test data    │
└──────┬───────┘   └──────┬───────┘   └──────┬───────┘
       │                  │                  │
       └──────────────────┼──────────────────┘
                          │
                    ┌─────▼─────┐
                    │Integrator │
                    │   Agent   │
                    └───────────┘
```

### Phase 3: Integration

1. Integrator merges all work
2. Resolve conflicts
3. Run full test suite
4. Fix integration issues

### Phase 4: Verification

1. QA runs full verification
2. Manual UAT checklist
3. Screenshots/recordings
4. RBAC spot checks

### Phase 5: Ship

1. Integrator creates walkthrough
2. Deploy to staging
3. Final smoke tests
4. Deploy to production

---

## Task.md Template for Parallel Split

```markdown
# [Feature Name] - Parallel Split

## Phase 1: Planning
- [ ] Define scope and contracts
- [ ] UI: Component design
- [ ] Backend: API/schema design
- [ ] QA: Test plan

## Phase 2: UI Agent
- [ ] Create [Component A]
- [ ] Create [Component B]
- [ ] Update [Page X]
- [ ] Apply styling/animations

## Phase 2: Backend Agent
- [ ] Migration: [schema change]
- [ ] Edge function: [function name]
- [ ] Service layer: [service name]
- [ ] RLS: [policy updates]

## Phase 2: QA Agent
- [ ] Unit tests for [module]
- [ ] E2E: [user journey]
- [ ] Test data setup

## Phase 3: Integration
- [ ] Merge all streams
- [ ] Resolve conflicts
- [ ] Run full test suite

## Phase 4: Verification
- [ ] All tests pass
- [ ] Manual UAT checklist
- [ ] RBAC verification
- [ ] Performance check

## Phase 5: Ship
- [ ] Walkthrough created
- [ ] Deployed to staging
- [ ] Smoke tests pass
- [ ] Deployed to production
```

---

## Dependency Matrix

| Stream | Depends On | Delivers To |
|--------|-----------|-------------|
| UI | Backend contracts | Integrator |
| Backend | None | UI, QA |
| QA | Backend, UI (for integration tests) | Integrator |
| Integrator | All streams | Production |

---

## Communication Protocol

When switching between agent roles in a single session:

1. **Announce role switch**: "Switching to QA Agent role..."
2. **Update task.md**: Mark current stream items, start new stream
3. **Check dependencies**: Are blocker items complete?
4. **Update task_boundary**: Change TaskName to reflect stream

---

## Example Usage

For a feature like "Add reservation management":

| Agent | Tasks |
|-------|-------|
| **UI** | ReservationList, ReservationForm, ReservationCard components |
| **Backend** | reservations table migration, create_reservation edge function |
| **QA** | Unit tests for components, E2E for reservation flow |
| **Integrator** | Wire up, deploy, document |

---

## Exit Criteria

✅ All agent streams complete their tasks
✅ Integrator has merged and verified
✅ Full test suite passes
✅ UAT checklist complete
✅ Walkthrough with evidence created
✅ Deployed (or ready to deploy)
