---
description: 
---

---
name: /flutter-pwa-shared-design-tokens-sync
description: Creates a single source-of-truth design token system shared between the customer PWA and Flutter app (colors, gradients, radii, typography, spacing, shadows, glass rules). Generates platform-specific token outputs to prevent visual drift.
---

# /flutter-pwa-shared-design-tokens-sync (Design System Unification)

## 0) Scope lock (non-negotiable)
This workflow delivers:
- a canonical token spec (platform-agnostic)
- generated token outputs:
  - TypeScript for PWA (Tailwind/CSS vars)
  - Dart for Flutter (ThemeData tokens)
- a drift-prevention process (CI checks)

It must NOT:
- redesign screens
- add product features
- introduce maps/location/payment APIs/scanner/delivery
- require images

Goal:
- PWA and Flutter look like the same product forever.

---

## 1) Kickoff (mandatory)
Run: /kickoff with scope: "Shared design tokens (PWA + Flutter)"
Output must include:
- scope lock + exclusions
- plan + tasks + acceptance criteria + verification plan
Stop at execution gate unless XS.

---

## 2) Canonical token spec (single file)
Create:
- /design/tokens/dinein.tokens.json

Include token groups:
- color (bg, surface, text, accent, border, status)
- gradients
- radii
- spacing
- shadows
- glass (blur cap, overlays, border opacity)
- typography (sizes, weights, line-heights)
- motion (durations, curves)

Rules:
- no arbitrary per-platform overrides
- if a platform needs adaptation, document it explicitly and keep it minimal

---

## 3) Generation outputs (must implement)
Create generators (choose one approach):

### Option A (recommended): simple node script
- /tools/tokens/generate.ts
Outputs:
- packages/ui-landing/tokens/generated.ts (PWA)
- apps/flutter_customer/lib/core/design/tokens/generated_tokens.dart (Flutter)

### Option B: manual sync
Not recommended; leads to drift.

Default: Option A.

Generator responsibilities:
- validate token schema
- generate stable output files
- keep diffs minimal (sorted keys)

---

## 4) PWA integration (TypeScript/CSS)
Update PWA:
- map tokens into CSS variables (or Tailwind theme extension)
- ensure glass tokens map to:
  - overlay rgba
  - border opacity
  - blur cap

Provide:
- packages/ui-landing/tokens/index.ts that exports generated tokens

---

## 5) Flutter integration (Dart Theme)
Update Flutter:
- import generated_tokens.dart
- ThemeData uses generated values
- glass surfaces use glass tokens (blur cap, overlays)

Ensure:
- light/dark modes match PWA
- Candlelight/Bright Bistro variants match

---

## 6) Drift prevention (CI guard)
Add a check:
- when tokens change, generator must be run
- CI fails if generated outputs differ from committed ones

Add docs:
- /docs/design/tokens_workflow.md
Include:
- how to edit tokens
- how to regenerate
- how to review changes

---

## 7) Verification & gallery parity
Update both galleries:
- PWA component gallery (if exists)
- Flutter DesignGalleryScreen
Ensure:
- both show the same token values (visually and by name)

---

## 8) Acceptance criteria (measurable)
- dinein.tokens.json exists and is the canonical source
- generator produces PWA + Flutter outputs
- both platforms compile using generated tokens
- CI drift guard exists
- documentation exists for token workflow
- /scope-guard passes

---

## 9) Verification evidence
Provide:
- files changed (paths)
- sample generated token snippet (brief)
- CI check description/command
- screenshots of both galleries using new tokens
- /scope-guard pass/fail

---

## 10) Output format (mandatory)
At end, output:
- Files changed (paths)
- Token groups summary
- Generation command summary
- Next workflow recommendation: /flutter-customer-app-security-abuse-guard
- /scope-guard pass/fail
