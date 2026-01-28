# Moltbot Plugin Implementation Blueprint (Tools + Policies + Agents + Backend Calls)

**Purpose**: Provide an implementation-grade blueprint for Antigravity to create the Moltbot plugin that registers the DineIn toolbelt, enforces per-agent allowlists, and exposes safe agent endpoints that our backend can call.

## 1. Moltbot Plugin Structure

**Repo Root**: `moltbot/plugins/dinein/`

```text
moltbot/plugins/dinein/
├── plugin.ts                # main entry: registers tools, agents, policies
├── agents/
│   ├── ui_orchestrator.agent.ts
│   ├── waiter.agent.ts
│   ├── venue_manager.agent.ts
│   ├── platform_admin.agent.ts
│   └── research_intel.agent.ts
├── tools/
│   ├── foundation.ts        # tenant/policy/audit/session/rate wrappers
│   ├── venues.ts            # venues.list_nearby, venues.get, venues.search
│   ├── menu.ts              # menu.get, menu.get_item, addons, allergens
│   ├── offers.ts            # offers.list_applicable, offers.get
│   ├── pricing.ts           # pricing.quote
│   ├── visit.ts             # visit.start, visit.get, visit.end
│   ├── cart.ts              # cart.get, cart.add_item, cart.update_item...
│   ├── order.ts             # order.submit, order.status
│   ├── service.ts           # service.call_staff, service.request_bill
│   ├── guest.ts             # guest.get_profile, guest.update_preferences
│   ├── safety.ts            # abuse.check_message
│   ├── ui_plan.ts           # ui.compose, ui.validate, ui.explain
│   └── research/
│       ├── search_web.ts
│       ├── open_url.ts
│       ├── extract.ts
│       ├── process.ts
│       └── proposals.ts
├── policies/
│   ├── allowlists.ts        # per-agent allowed tools
│   ├── validators.ts        # per-tool input validators
│   ├── approvals.ts         # approval matrix
│   └── research_fences.ts
├── clients/
│   └── dinein_api.ts        # HTTP client to DineIn backend/Supabase edge
├── schemas/
│   ├── ui_plan.v1.json
│   └── tool_schemas.v1.json
└── observability/
    ├── audit.ts
    └── metrics.ts
```

## 2. Tool Registration Plan

**Strategy**: Tools are thin adapters that call the DineIn backend (Supabase Edge or API) using a service token. Moltbot never connects directly to the DB. The backend enforces tenant isolation and logging.

**Common Wrapper Flow**:
1. Validate input schema (`policies/validators.ts`).
2. Resolve tenant context (`foundation.tenant.resolve_context`) from sessionKey+actor.
3. `policy.check(action, resource)` - deny if false.
4. Attach correlation IDs (`requestId`, `toolCallId`, `sessionKey`).
5. Call DineIn API client with signed service auth.
6. Audit log: inputsHash/outputsHash + latency + outcome.
7. Return minimal data only (strip internal IDs/secrets).

**Naming Conventions**:
- Tool names exactly match the catalog (e.g., `venues.list_nearby`, `menu.get`).
- All tool outputs are JSON-serializable and schema-validated.

## 3. Agent Definitions

### UI Orchestrator
- **System Prompt Rules**:
  - Output `UIPlan` JSON only, plus a brief explanation for logs.
  - Never invent prices/hours/discounts; must call tools.
  - Prefer fewer sections; optimize clarity.
- **Allowed Tools**: `policies/allowlists.ts#ui_orchestrator`
- **Output Contract**: `UIPlan` v1 (primary), `debug.explanation` (optional).

### Waiter
- **System Prompt Rules**:
  - Act like a calm, efficient waiter.
  - Use tools to fetch menu details, add to cart, quote totals.
  - Require explicit confirmation before `order.submit`.
  - Escalate to staff via `service.call_staff` for complaints/allergy risks.
- **Allowed Tools**: `policies/allowlists.ts#waiter`
- **Output Contract**: Assistant message (text), optional UI actions.

### Venue Manager
- **System Prompt Rules**:
  - Assist the bar manager; focus on ops, insights, drafts.
  - No publish without approvals.
- **Allowed Tools**: `policies/allowlists.ts#venue_assistant_manager`

### Platform Admin
- **System Prompt Rules**:
  - Operate platform workflows; always approval-gate critical actions.
  - Provide audit-friendly summaries with references.
- **Allowed Tools**: `policies/allowlists.ts#platform_admin`

### Research Intel
- **System Prompt Rules**:
  - Browsing allowed only through `research.*` tools.
  - All findings must include citations + confidence.
  - Propose actions as drafts only; never execute.
- **Allowed Tools**: `policies/allowlists.ts#research_intel`

## 4. Gateway Policy Hooks

**Deny-by-default**: True.

**Enforcement Points**:
- Before any tool call: verify tool in agent allowlist.
- Validate input schema per tool.
- If `mode=production`, block `research.*` tools.
- If `mode=research`, block all mutation tools.
- Block `openExternalUrl` unless domain allowlisted for that mode.

**Response on Deny**: Return `NOT_FOUND` (avoid enumeration) or `FORBIDDEN` with safe message.

## 5. Backend Call Contracts

**Principle**: Backend calls Moltbot; apps call backend only.

**Endpoints mappings**:
- `/ai/ui-plan` -> calls Moltbot agent `ui_orchestrator`
- `/ai/waiter` -> calls Moltbot agent `waiter`
- `/ai/manager` -> calls Moltbot agent `venue_manager`
- `/ai/admin` -> calls Moltbot agent `platform_admin`
- `/ai/research` -> calls Moltbot agent `research_intel`

**Session Key Rules**:
- Guest/Table: `tenant:{tenantId}:venue:{venueId}:visit:{visitId}`
- Staff: `tenant:{tenantId}:venue:{venueId}:staff:{staffId}`
- Admin: `tenant:{tenantId}:admin:{adminId}`

**Request Payload to Moltbot**:
- **Fields**:
  - `model`: 'moltbot:<agentId>'
  - `user`: stable actor id
  - `messages`: history array
- **Headers**:
  - `x-moltbot-session-key`: <sessionKey>
  - `authorization`: Bearer <gateway_token>
  - `x-request-id`: <requestId>
  - `x-tenant-id`: <tenantId>

**Response Handling**:
- If UIPlan: validate again server-side, then send to client.
- If tool errors: map to standard error codes; show graceful fallback.

## 6. Observability Hooks

**Metrics**:
- `agent_latency_ms` by agentId
- `tool_latency_ms` by toolName
- `tool_error_rate` by toolName+code
- `checkout_funnel` conversion metrics

**Audit**:
- Log every tool call + denial.
- Log every approval request/resolution.
- Link `requestId` -> agent run -> tool calls.
