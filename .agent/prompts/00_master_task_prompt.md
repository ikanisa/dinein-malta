# 00_master_task_prompt.md - Master Task Governance

This prompt governs the execution of any major task in the DineIn monorepo. It enforces our strict scope boundaries, build method, and verification requirements.

## 0) Pre-Check (You MUST do this)
Read `.agent/workflows/guardrails-and-prompts-kit.md` and `task.md` to understand your current context.

## 1) Scope Lock (Mandatory First Step)
Before writing any code, you must output a **Scope Lock** section restating the following non-negotiable rules:

### Hard Constraints (DO NOT VIOLATE)
- **Monorepo Structure**: Working in `apps/customer`, `apps/venue`, `apps/admin` (DineIn legacy is gone).
- **No Delivery**: No drivers, no delivery status, no tracking.
- **No Maps/Location**: No Google Maps, no "near me", no geolocation permissions.
- **No Payment APIs**: Payments are external handoff only (MoMo USSD, Revolut Link). No webhooks.
- **Tap Budget**: Customer ordering must be <= 4 taps from menu.
- **Entry**: `/v/{venueSlug}` is the only deep link entry. Sets `activeCountry` context.
- **No In-App Scanner**: We do not build QR scanners. Users use the system camera.

## 2) The Plan
After locking scope, produce a plan for your specific task:
1.  **Objective**: What are you building?
2.  **Implementation Plan**: File-by-file changes.
3.  **Task List**: Granular steps, each with a Definition of Done.
4.  **Acceptance Criteria**: How do we know it works?
5.  **Verification**: What tests? What screenshots?

## 3) Execution Rules
- **One Slice at a Time**: Do not try to build the whole app in one go. Pick one vertical slice (e.g. "Customer Menu Display") and finish it.
- **Files**: Use `packages/ui` for components. Do not copy-paste code if it exists there.
- **State**: Use `packages/core` for shared types (`OrderStatus`, `PaymentMethod`).

## 4) Evidence (The Output)
When finished, you must provide:
- **Screenshots/Video**: If UI changed.
- **Test Results**: Output of `pnpm test` or build logs.
- **Scope Guard Report**: Explicit statement that you did not add banned features.

## 5) How to proceed
"I have read the governance rules. I will now produce the Scope Lock and Plan for [Task Name]."
