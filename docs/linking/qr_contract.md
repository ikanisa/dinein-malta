# DineIn QR URL Contract

**Canonical URL Format**:
`https://dinein.app/v/{venueSlug}`

## Rules
1.  **Protocol**: MUST be `https`. `http` is strictly forbidden.
2.  **Domain**: MUST be `dinein.app` (or the configured production domain).
3.  **Path**: MUST start with `/v/`.
4.  **Slug**:
    *   Case-insensitive (but prefer lowercase).
    *   URL-safe characters only (hyphens allowed).
    *   Example: `kigali-heights-rooftop`
5.  **Query Parameters**:
    *   Optional: `?t={tableNumber}` (e.g., `?t=12`).
    *   Optional: `?ref={source}` (e.g., `?ref=poster`).
    *   **Constraint**: The presence of query parameters MUST NOT affect the routing decision (i.e., it still goes to Venue Menu).

## Forbidden Formats
*   `dinein://v/{slug}` (Custom schemes are unreliable for QRs).
*   `https://dinein.app/#/v/{slug}` (Hash routing breaks native App Links).
*   `https://short.link/xyz` (Redirects break App Link association verification on some OS versions).
