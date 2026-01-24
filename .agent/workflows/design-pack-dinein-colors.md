---
description: 
---

---
name: /design-pack-dinein-colors
description: Establishes a final dine-in color system (no photos) with 2 approved palettes, full token mapping, gradients, glass surfaces, status colors, and usage rules across customer/venue/admin PWAs.
---

# /design-pack-dinein-colors (DineIn)

## 0) Scope (hard-locked)
This workflow defines design tokens and usage rules only:
- colors, gradients, surfaces, borders, shadows, glass blur
- status colors (success/warn/danger)
- country accent variants (subtle)

It must NOT:
- add product features
- add images/photos
- introduce new navigation or new flows

It must preserve:
- minimal UI, rich widgets
- consistent token usage across apps via packages/ui

---

## 1) Kickoff (mandatory)
Run: /kickoff with scope: "Design pack: colors + tokens"
Output must include:
- Scope lock + exclusions
- Plan + tasks + acceptance criteria + verification plan
Stop at execution gate unless XS.

---

## 2) The Two Approved Palettes (pick one default, keep the other available)
You MUST implement exactly two palettes and nothing else:
- Palette A (default): **Candlelight Modern**
- Palette B (optional): **Bright Bistro**

Each palette must provide:
- base background + layered surfaces
- primary accent (dine-in warm)
- secondary accent (gold)
- text + muted text
- border/divider
- overlay + scrim
- status colors (success/warn/danger)
- focus ring color

---

## 3) Token mapping (single source of truth)
Create tokens under `packages/ui/tokens/`:
- `colors.ts` (semantic tokens only)
- `gradients.ts`
- `shadows.ts`
- `blur.ts`

Rules:
- Apps must never use raw hex codes.
- No “brand” token names in components (e.g., `orange500`)—only semantic tokens.

---

## 4) Palette A — Candlelight Modern (dark, premium, dine-in)
Purpose: feels like candlelight + polished wood + amber glass. Zero images needed.

### A.1 Semantic colors (hex)
Backgrounds:
- bg:            #0B0B0E
- bg2:           #0F1015

Surfaces (glass/tiles):
- surface:       #12131A
- surface2:      #161825
- surface3:      #1B1F2E

Text:
- text:          #F4F1EA
- textMuted:     #B9B4A7
- textSubtle:    #8E889A

Borders/dividers:
- border:        #26283A
- divider:       #1E2030

Primary / accents:
- primary:       #FF7A1A   (amber orange)
- primaryHover:  #FF8E3A
- primaryActive: #F06A10
- gold:          #D7B45A

Status:
- success:       #2ECC71
- warning:       #F5A524
- danger:        #FF4D4F
- info:          #3BA7FF

Focus:
- focusRing:     #FFB15C

Overlays:
- scrim:         rgba(0,0,0,0.55)
- overlay:       rgba(18,19,26,0.72)

### A.2 Gradients (use sparingly)
- gradientPrimary: linear-gradient(135deg, #FF7A1A 0%, #D7B45A 55%, #FF7A1A 100%)
- gradientCardEdge: linear-gradient(180deg, rgba(255,122,26,0.25), rgba(215,180,90,0.10))
- gradientSubtle: linear-gradient(180deg, rgba(255,122,26,0.10), rgba(0,0,0,0.0))

### A.3 Glass recipe (the “liquid glass” vibe)
- glassBg: rgba(18,19,26,0.62)
- glassBorder: rgba(255,255,255,0.08)
- glassHighlight: rgba(255,122,26,0.12)
- blur: 14–18px

---

## 5) Palette B — Bright Bistro (light, airy, still dine-in)
Purpose: feels like a clean bistro menu + warm sunlight. Still premium.

### B.1 Semantic colors (hex)
Backgrounds:
- bg:            #FCFAF6
- bg2:           #F7F2EA

Surfaces:
- surface:       #FFFFFF
- surface2:      #FFF8EE
- surface3:      #F2EEE7

Text:
- text:          #141318
- textMuted:     #4E4B57
- textSubtle:    #7A7685

Borders/dividers:
- border:        #E6DFD4
- divider:       #EFE7DC

Primary / accents:
- primary:       #FF6A00
- primaryHover:  #FF7B24
- primaryActive: #E95F00
- gold:          #C9A44A

Status:
- success:       #16A34A
- warning:       #D97706
- danger:        #DC2626
- info:          #2563EB

Focus:
- focusRing:     #FF9A4A

Overlays:
- scrim:         rgba(20,19,24,0.28)
- overlay:       rgba(255,255,255,0.75)

### B.2 Gradients
- gradientPrimary: linear-gradient(135deg, #FF6A00 0%, #C9A44A 60%, #FF6A00 100%)
- gradientSubtle: linear-gradient(180deg, rgba(255,106,0,0.10), rgba(255,255,255,0.0))

### B.3 Glass recipe
- glassBg: rgba(255,255,255,0.65)
- glassBorder: rgba(20,19,24,0.10)
- glassHighlight: rgba(255,106,0,0.10)
- blur: 12–16px

---

## 6) Country accents (subtle, NOT brand takeover)
Country accents must be extremely subtle and only used in:
- tiny badge edge
- promo card stripe
- “Active country” indicator in Settings/Home

### RW accent (subtle green hint)
- rwAccent: rgba(46,204,113,0.18)
### MT accent (subtle blue hint)
- mtAccent: rgba(59,167,255,0.18)

Rules:
- Do not recolor primary buttons by country.
- Do not introduce new palettes per country.

---

## 7) Where each token is used (strict usage guide)
### Primary CTA button
- background: primary
- hover/active: primaryHover/primaryActive
- text: bg or text depending on contrast (pick one and standardize)
- focus: focusRing

### Cards / list items
- background: surface (or glassBg for “glass cards”)
- border: border (or glassBorder)
- optional: gradientCardEdge on the card edge only

### Bottom sheets
- background: surface2 (or overlay for glass)
- scrim: scrim

### Chips (categories)
- default: surface3 + border
- selected: subtle gradientSubtle + border + text

### Status pills
- success/warning/danger/info with 15–22% alpha backgrounds and solid text/icon color

---

## 8) Do-not-do list (prevents ugly drift)
- No raw hex in app code (only tokens).
- No more than 2 gradients per screen.
- Never put a full-screen gradient background behind text.
- No neon saturation; keep it “restaurant warm,” not “gaming UI.”
- No images required to “feel premium”—typography + spacing + glass does it.

---

## 9) Implementation sequence (in order)
1) Add token files under packages/ui/tokens/
2) Add ThemeProvider that switches Palette A/B
3) Refactor shared components to consume semantic tokens
4) Add “Theme preview” dev-only page (optional)
5) Apply to 3 proof screens:
   - Customer venue menu
   - Venue dashboard
   - Admin claims list
6) Document usage in /docs/design/colors.md
7) Run /scope-guard (must pass)

---

## 10) Acceptance criteria (measurable)
- Exactly 2 palettes exist (A and B)
- No raw hex used in apps (best effort enforce via lint/grep)
- Proof screens match tokens and look consistent
- Widgets (cart pill, sheets, chips, status pills) read clearly in both palettes
- No new features introduced

---

## 11) Verification evidence
Provide:
- Paths of token files added
- Screenshot set (A and B) for proof screens
- Grep/lint evidence that raw hex is minimized
- /scope-guard pass/fail

---

## 12) Output format (mandatory)
At end, output:
- Files created/changed (paths)
- Palette A/B summary
- Token coverage checklist (what exists)
- Screens updated as proof
- /scope-guard pass/fail
