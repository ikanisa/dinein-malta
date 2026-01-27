# Web Routing & Fallback Rules

**Goal**: If the app is NOT installed, the web (PWA) must handle the request gracefully.

## 1. Request Handling
Matches: `GET /v/{venueSlug}*`

### Behavior
1.  **Serve PWA Entry**: Return `index.html` (since it's an SPA/PWA).
2.  **Hydrate**: PWA router detects `/v/{slug}`.
3.  **Fetch**: Web app fetches venue details by `{slug}`.
4.  **Render**: Display Venue Menu immediately.

## 2. Redirect Policy (CRITICAL)
*   **DO NOT** issue a `301` or `302` redirect from `/v/{venueSlug}` to a different path (e.g., `/app/v/{slug}`) *before* the page loads.
    *   *Reason*: Android App Links and iOS Universal Links need the exact matching URL to verify the intent. Server-side redirects can sometimes obscure the intent or cause the browser to "capture" the link before the OS does.

## 3. "Open in App" Smart Banner
If the user is on the PWA mobile view:
*   Show a banner/button: "Open in App".
*   Target URL: `https://dinein.app/v/{venueSlug}` (Same URL).
*   *Mechanism*: Clicking this link on a device with the app installed *should* re-trigger the OS intent picker or open the app (depending on OS version).
