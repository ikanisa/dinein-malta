# UI Consistency Rules (PWA vs Flutter)

To ensure the Flutter app feels like a high-quality "Soft Liquid Glass" native experience matching the PWA, follow these rules.

## 1. Design Tokens
- **Colors**:
  - Primary: Match PWA Brand Color exactly.
  - Surface: Use "Glass" effect (Blur + translucent background) where PWA uses it.
  - Text: High Emphasis (87%), Medium (60%), Disabled (38%).
- **Typography**:
  - Use the same font family (e.g., Inter/Outfit) as PWA.
  - Match font weights (Bold headers, Regular body).
- **Radii**:
  - Cards: `12px` or `16px` (Consistent with PWA).
  - Buttons: `50px` (Pill) or `8px` (Rounded).

## 2. Spacing System
- Use a `4px` or `8px` grid.
- **Micro**: `4px` / `8px` (between text and icon).
- **Small**: `12px` / `16px` (padding inside cards).
- **Medium**: `24px` (between sections).
- **Large**: `32px`+ (layout margins).

## 3. Widget Parity
- **Buttons**:
  - Primary: Full width or standard pill. Loading state = Spinner inside button (no width change).
  - Secondary: Outline or Ghost.
- **Bottom Sheets**:
  - Must have a "Handle" indicator at the top.
  - corner radius `24px` top-left/top-right.
  - Backdrop blur enabled.
- **Skeletons**:
  - Shimmer effect matching PWA animation speed.
  - Same shape as content (Circle for avatar, Rect for text).

## 4. Motion
- **Page Transitions**:
  - Android: `FadeThrough` or Standard Slide.
  - iOS: Standard Cupertino Slide.
- **Hero Animations**:
  - PWA often lacks this, but Flutter CAN use it. **Rule**: Use Hero only if it looks seamless.
- **Duration**:
  - Short: `200ms` (toggles, checks).
  - Medium: `350ms` (sheets, dialogs).

## 5. Copy & Tone
- **No "AI"**: Never mention AI.
- **No "Delivery"**: "Dine-in Only".
- **Error Messages**: Friendly, actionable.
  - Bad: "Error 500".
  - Good: "Couldn't load menu. Tap to retry."
