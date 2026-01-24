# 99_what_to_avoid.md - Failure Modes & Banned Features

## Banned Features (Scope Exclusions)
- **NO Delivery**: No drivers, tracking, or delivery status.
- **NO Maps/Geolocation**: No Google Maps, "near me", or location permissions.
- **NO Payment APIs**: No Stripe, PayPal integration. Manual handoff only.
- **NO In-App Scanner**: No QR scanning UI. Use system camera.

## Common Agent Mistakes
- **Mega Prompts**: Don't try to build everything at once. One slice only.
- **UI Drift**: Don't use raw CSS colors. Use `@dinein/ui` tokens.
- **Deep Nesting**: Avoid component trees deeper than 3-4 levels.
- **Ignoring RLS**: Never create a table without `enable row level security`.
- **Assuming Online**: Always handle offline/error states.
