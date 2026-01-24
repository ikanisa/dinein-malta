---
description: 
---

---
name: /content-and-copy-system
description: Establishes a minimal, consistent copy system and lightweight localization scaffolding for Rwanda (RW) and Malta (MT) without UI bloat. Keeps text short, neutral, and action-driven.
---

# /content-and-copy-system (DineIn)

## 0) Scope (hard-locked)
This workflow creates:
- copy guidelines
- shared text primitives
- localization scaffolding (optional)
- error/empty/loading copy standards

It must NOT:
- add product features
- introduce extra screens
- add complex i18n frameworks unless justified

Non-negotiable UX:
- minimal text, few taps, no onboarding walls

---

## 1) Kickoff (mandatory)
Run: /kickoff with scope: "Content + copy system"
Output must include:
- Scope lock + exclusions
- Plan + tasks + acceptance criteria + verification plan
Stop at execution gate unless XS.

---

## 2) Copy rules (global)
Create `/docs/copy-style.md` with rules:

### 2.1 Principles
- Short, direct, neutral tone
- One instruction per line
- Action verbs for CTAs
- Avoid marketing fluff

### 2.2 Button labels (approved set)
Customer:
- Add, View cart, Checkout, Place order, Call waiter, Save, Done
Venue:
- Save, Upload menu, Review, Publish, Mark received, Mark served, Cancel
Admin:
- Approve, Reject, Disable, Reassign, Save

### 2.3 Error messages
- Say what happened
- Say what to do next
Examples:
- “No connection. Reconnect to place an order.”
- “This venue is already claimed.”

### 2.4 Empty states
- One sentence + one action
Example:
- “No orders yet. Refresh.”

### 2.5 Payment handoff copy (strict)
- Always include:
  - “Payment happens in the other app.”
  - “Show confirmation to staff.”
- Never imply verification by DineIn.

---

## 3) Localization approach (lightweight)
Choose minimal approach:

### Option A (recommended): simple dictionary
- `packages/core/i18n/en.ts`
- `packages/core/i18n/fr.ts` (optional)
- `packages/core/i18n/rw.ts` (Kinyarwanda optional later)
- `packages/core/i18n/mt.ts` (English is often fine; optional Maltese later)

Expose:
- `t(key, params)` function
- fallback to English if missing

Rules:
- Do not localize everything at once.
- Start with:
  - navigation labels
  - core CTAs
  - critical errors
  - payment handoff instructions

### Option B: full i18n framework
Only if required later. Out of scope for v1.

---

## 4) Language selection rules
- Default language:
  - use browser language as hint
  - store user preference if changed in Settings
- Do NOT ask language on first entry (no onboarding friction)
- Keep Settings toggle minimal

---

## 5) Country-specific copy (RW vs MT)
Some text should vary by country context (derived from venue):
- Payment labels:
  - RW: “Pay with MoMo”
  - MT: “Pay with Revolut”
- Currency formatting already handled elsewhere
- Handoff instructions:
  - RW: “MoMo USSD will open.”
  - MT: “Revolut will open.”

Implement via:
- `t()` keys + conditional snippets

---

## 6) Implementation sequence (in order)
1) Add `/docs/copy-style.md`
2) Add minimal dictionary i18n (Option A)
3) Replace hardcoded strings on:
   - customer ordering flow
   - payment handoff screen
   - venue claim flow
   - admin approvals
4) Add Settings language toggle (optional)
5) Add tests for `t()` fallback and parameter interpolation
6) Run /scope-guard

---

## 7) Acceptance criteria (measurable)
- Copy rules doc exists
- Core flows use shared keys (not scattered hardcoded strings)
- Payment copy never implies verification
- Language toggle does not add onboarding friction
- No new heavy dependencies added

---

## 8) Verification evidence
Provide:
- file paths
- example key list
- screenshots of payment handoff screen (RW vs MT wording)
- tests run (if any)

---

## 9) Output format (mandatory)
At end, output:
- Files created/changed (paths)
- Key registry summary
- Demo steps (where to see changes)
- Tests run (commands + results)
- Known gaps + next workflow recommendation
- /scope-guard pass/fail
