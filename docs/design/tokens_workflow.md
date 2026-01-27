# Shared Design Tokens Workflow

**Goal**: Keep PWA and Flutter app styles perfectly synchronized.

## The Source of Truth
`design/tokens/dinein.tokens.json`
This is the **only** place where brand colors, spacing, and radii should be edited.

## How to make changes
1.  **Edit JSON**: Open `design/tokens/dinein.tokens.json` and modify the value.
    *   *Example*: Change `brand.primary` from `#000000` to `#121212`.
2.  **Generate**: Run the generator script.
    ```bash
    node tools/tokens/generate.js
    ```
    *   This updates `apps/flutter_customer/.../generated_tokens.dart`
    *   This updates `packages/ui-landing/.../generated.ts`
3.  **Commit**: Commit both the JSON and the generated files.

## CI/CD Guard (Manual Process for now)
*   If you change the JSON but forget to run the generator, the build might not break, but the apps will drift.
*   **Best Practice**: Always run the generator immediately after saving the JSON.

## Outputs
*   **Flutter**: `DineInTokens` class with `static const Color` and `double`.
*   **PWA**: `DineInTokens` object with `readonly` properties.
