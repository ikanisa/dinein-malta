# QR Code Generation Specification

**Usage**: Printed materials (Table stands, posters, stickers).

## Data Encoding
*   **Content**: `https://dinein.app/v/{venueSlug}`
*   **Encoding Mode**: Byte / Alphanumeric.

## Visual Design
1.  **Error Correction**: **Level Q** (Quartile, ~25%) or **Level M** (Medium, ~15%).
    *   *Why*: Allows for minor damage or dirt on the table stand without breaking scan.
2.  **Quiet Zone**: Minimum 4 modules (white space) around the code.
3.  **Colors**:
    *   Dots: Black (or very dark brand color).
    *   Background: White.
    *   **Contrast is King**. Do not use inverted (white on black) or low-contrast combos.
4.  **Logo**:
    *   Optional "DineIn" icon in center (requires Level Q or H).
    *   Ensure logo covers < 20% of the area.

## Physical Size Guidelines
*   **Table Stand (Scan distance ~30cm)**: Minimum **2.5cm x 2.5cm** (1 inch).
*   **A4 Poster (Scan distance ~1m)**: Minimum **5cm x 5cm**.
*   **Wall/Window (Scan distance >1m)**: Minimum **10cm x 10cm**.

## Verification
*   **ALWAYS** test print a sample at 100% scale before mass production.
*   Test with:
    1.  iOS Camera
    2.  Android Camera / Lens
    3.  DineIn App (if using internal scanner, though scope says system cam).
