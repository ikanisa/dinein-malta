# 07_e2e_prompt.md - End-to-End Testing

Use this prompt when writing E2E tests for critical flows.

## 1) Scope (Happy Paths Only)
- **Customer**: Scan -> Menu -> Cart -> Place Order.
- **Venue**: Login -> Dashboard -> Change Status.
- **Admin**: Login -> Approve Venue.

## 2) Principles
- **Stable Selectors**: Use `data-testid`.
- **Deterministic Data**: Seed DB before run.
- **Mobile Viewport**: Always test mobile size first.

## 3) Task List
- [ ] Define Flow Steps
- [ ] Write Test Spec
- [ ] Run Test
- [ ] Verify Pass
