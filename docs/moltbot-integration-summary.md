# Moltbot ↔ DineIn Integration Summary

> **WF-NEXT-15** — Single authoritative blueprint: architecture, sequences, and final checklist.

---

## Architecture Overview

```mermaid
flowchart TB
    subgraph Clients["Client Apps"]
        FL["Flutter Client"]
        CPWA["Client PWA"]
        BPWA["Bar PWA"]
        APWA["Admin PWA"]
    end

    subgraph Backend["DineIn Backend"]
        GW["API Gateway + Edge Functions"]
        POLICY["Policy Engine"]
        AUDIT["Audit Logger"]
    end

    subgraph Data["Supabase"]
        DB[(Database + RLS)]
        RT["Realtime Channels"]
    end

    subgraph AI["Moltbot Runtime (Private)"]
        UI_O["UI Orchestrator"]
        WAITER["Waiter Agent"]
        MGR["Venue Manager Agent"]
        ADMIN["Platform Admin Agent"]
        RESEARCH["Research Intel Agent"]
    end

    OBS["Observability"]

    FL & CPWA --> GW
    BPWA & APWA --> GW
    GW --> POLICY --> AUDIT
    GW <--> DB
    GW <--> AI
    DB --> RT --> Clients
    AI -.->|"Tool calls"| GW
    GW --> OBS
```

---

## Component Responsibilities

| Component | Responsibilities | Never Does |
|-----------|------------------|------------|
| **Flutter Client** | Render UIPlan, dispatch safe intents, waiter chat UI | Never calls Moltbot, never executes unknown intents |
| **Client PWA** | Same as Flutter: UIPlan rendering + intent dispatch | Never calls Moltbot directly |
| **Bar PWA** | Orders + service calls queue, manager console (drafts, approvals), venue audit | No direct AI calls |
| **Admin PWA** | Platform approvals, support tickets, audit search/export, risk controls | No direct AI calls |
| **Backend Gateway** | Auth, tenant/venue context, policy enforcement, data access via RLS, calls Moltbot, validates outputs, telemetry + audit | No business logic leakage |
| **Supabase** | Multi-tenant data store, RLS isolation, realtime channels | No agent logic |
| **Moltbot Runtime** | Agents (UI Orchestrator, Waiter, Manager, Admin, Research), tool routing, allowlist enforcement | No direct DB access |
| **Observability** | Dashboards (latency, errors, denials), alerts (probing, bypass, anomalies) | — |

---

## Data Flow Principle

> **All trust boundaries terminate in the backend.**

```
Client → Backend: UIPlan request, intent execution, waiter messages
Backend → Moltbot: agent run with sessionKey + requestId
Moltbot → Backend: tool calls (via tool wrappers) with policy checks
Backend → Supabase: queries/mutations subject to RLS + server checks
Supabase → Clients: realtime events (scoped)
```

---

## Sequence Diagrams

### SEQ-01: Home Screen UIPlan

```mermaid
sequenceDiagram
    participant C as Client
    participant B as Backend
    participant M as Moltbot (ui_orchestrator)
    participant DB as Supabase

    C->>B: POST /ai/ui-plan {screen:home, location, filters}
    B->>B: Create requestId, resolve tenant context
    B->>M: Run agent with sessionKey
    M->>B: Tool: venues.list_nearby
    B->>DB: Query venues (RLS)
    DB-->>B: Results
    B-->>M: Tool response
    M->>B: Tool: offers.list_applicable
    B->>DB: Query offers
    DB-->>B: Results
    B-->>M: Tool response
    M-->>B: UIPlan JSON
    B->>B: Validate schema, log audit
    B-->>C: UIPlan + ttlSeconds
    C->>C: Render + cache
```

---

### SEQ-02: Add to Cart and Checkout

```mermaid
sequenceDiagram
    participant C as Client
    participant B as Backend
    participant DB as Supabase

    C->>B: POST /api/cart/add-item {visitId, itemId, qty}
    B->>B: Validate visitId ownership
    B->>DB: Update cart
    DB-->>B: OK
    B->>B: Log audit
    B-->>C: Updated cart

    C->>B: GET /api/pricing/quote {visitId}
    B->>DB: Fetch cart + offers
    B-->>C: Quote {total, items, hash, expiresAt}

    C->>B: GET /ai/ui-plan {screen:checkout}
    B-->>C: UIPlan (checkout section)
    C->>C: Show totals + confirm button
```

---

### SEQ-03: Order Submit (Idempotent)

```mermaid
sequenceDiagram
    participant C as Client
    participant B as Backend
    participant DB as Supabase
    participant RT as Realtime

    C->>C: Generate clientConfirmationId
    C->>B: POST /api/order/submit {visitId, quoteHash, clientConfirmationId}
    B->>B: Verify quote <= 60s + cart_hash matches
    B->>DB: Check unique(visit_id, clientConfirmationId)
    alt First submit
        B->>DB: Create order + lines snapshot
        DB-->>B: orderId
        B->>RT: Emit order.placed
        B-->>C: {orderId, status: "placed"}
    else Duplicate
        B-->>C: 409 CONFLICT {existingOrderId}
    end
    C->>RT: Subscribe to order updates
```

---

### SEQ-04: Waiter Chat (Guided Ordering)

```mermaid
sequenceDiagram
    participant C as Client
    participant B as Backend
    participant M as Moltbot (waiter)
    participant DB as Supabase

    C->>B: POST /ai/waiter {message, visitId}
    B->>B: abuse.check_message + rate limit
    B->>M: Run waiter agent
    M->>B: Tool: menu.search
    B->>DB: Query menu
    DB-->>B: Items
    B-->>M: Tool response
    M->>B: Tool: cart.quote
    B->>DB: Compute quote
    DB-->>B: Quote
    B-->>M: Tool response
    M-->>B: Reply with suggestions + actionRef
    B-->>C: {reply, suggestedActions}

    Note over C: User taps "Confirm Order"
    C->>B: POST /api/order/submit {visitId, clientConfirmationId}
    Note over C,B: Client executes submit, NOT the agent
```

> **Safety**: Agent recommends; client executes submit after explicit user confirmation.

---

### SEQ-05: Call Staff / Request Bill

```mermaid
sequenceDiagram
    participant C as Client
    participant B as Backend
    participant DB as Supabase
    participant RT as Realtime
    participant BAR as Bar PWA

    C->>B: POST /api/service/call-staff {visitId, type}
    B->>DB: Create service_call
    DB-->>B: callId
    B->>RT: Emit service_call.created (venue channel)
    B-->>C: {callId, status: "pending"}

    RT-->>BAR: service_call.created
    BAR->>BAR: Show in queue
    BAR->>B: POST /api/service/acknowledge {callId}
    B->>DB: Update status
    B->>RT: Emit service_call.updated
    RT-->>C: Status update (optional)
```

---

### SEQ-06: Research Intel → Proposal → Approval

```mermaid
sequenceDiagram
    participant SCHED as Scheduler
    participant B as Backend
    participant M as Moltbot (research_intel)
    participant DB as Supabase
    participant MGR as Manager/Admin

    SCHED->>B: Trigger research job
    B->>M: Run research_intel agent (research mode)
    M->>B: Tool: research.search_web
    B-->>M: Results
    M->>B: Tool: research.extract
    B-->>M: Parsed content
    M->>B: Tool: research_to_ops.propose_actions
    B->>DB: Store digest + proposals
    DB-->>B: proposalId
    B->>MGR: Notify inbox

    MGR->>B: POST /api/approvals/resolve {proposalId, decision: approve}
    B->>DB: Create approval record
    B->>M: Run production agent (NOT research) with approvalId
    M->>B: Execute action tools
    B->>DB: Apply changes
    B-->>MGR: Action completed
```

---

## Final Implementation Checklist

### Security & Policy

- [ ] Deny-by-default tool allowlists per agent enforced
- [ ] Production mode blocks research tools; research mode blocks mutations
- [ ] Tenant/venue context enforced end-to-end (no cross-tenant reads)
- [ ] `order.submit` requires fresh quote + cart_hash match + clientConfirmationId
- [ ] Approvals required for publish/refunds/access changes; backend rejects bypass
- [ ] `abuse.check_message` before waiter processing; rate limits active

### Backend

- [ ] DB schema created with indexes
- [ ] RLS policies verified (guest/staff/admin)
- [ ] Edge endpoints implemented for all MVP tools
- [ ] Realtime channels configured and scoped
- [ ] Telemetry and audit logs wired with requestId/sessionKey

### Moltbot Plugin

- [ ] DineIn plugin created with tool wrappers and schema validators
- [ ] Agents installed: ui_orchestrator + waiter (MVP), manager/admin (next), research (optional)
- [ ] UIPlan schema validation enforced before return

### Frontend (Flutter + PWA)

- [ ] UIPlan renderer implemented with section registry
- [ ] Intent dispatcher allowlisted; unknown intents ignored and logged
- [ ] Confirm dialogs enforced for `requiresConfirmation`
- [ ] Offline mode shows cached UI and disables mutations
- [ ] Waiter chat UI implemented with no auto-execution of actionRefs

### Bar + Admin PWA

- [ ] Bar queue for orders and service calls working
- [ ] Approvals inbox + draft editors + simulations (venue scope)
- [ ] Admin audit search/export + incident queue

### Testing

- [ ] Seed fixtures load reliably
- [ ] E2E tests T1–T7 pass
- [ ] Redteam suite passes (no tool bypass, no leakage)

### Rollout

- [ ] Feature flags + kill switches operational
- [ ] Shadow mode metrics stable
- [ ] Gates to Assisted and Full mode defined and monitored

---

## Acceptance Criteria

1. This checklist can be executed to reach a safe MVP launch
2. Sequence diagrams map exactly to implemented endpoints and agents
3. No direct Moltbot exposure; backend remains control plane
4. All trust boundaries terminate in the backend
5. Research mode is fully sandboxed from production mutations
