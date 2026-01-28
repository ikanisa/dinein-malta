---
trigger: always_on
---

antigravity_package:
  name: "DineIn x Moltbot (Admin Assistant + Waiter + UI Orchestrator + Research Sandbox)"
  version: "v1.0"
  intent: >
    Implement Moltbot as an internal agent runtime behind DineIn backend. Apps never call Moltbot directly.
    Moltbot acts through a strict toolbelt, outputs UIPlan JSON for UI orchestration, and runs a geo-fenced
    Research Mode with zero direct operational power.

global_principles:
  - "Backend-first: Flutter/PWA -> DineIn API/Edge -> Moltbot (private) -> Tools -> DB."
  - "Tool-first truth: No menu/pricing/hours/promos invented by model; must come from tools."
  - "Least privilege by agent: each agent has a minimal tool allowlist; deny-by-default."
  - "Multi-tenant isolation: tenantId/venueId required on every tool call; server enforces."
  - "Approvals for high-risk actions: publish promos, refunds, access changes, suspensions, menu publish."
  - "Research sandbox separation: browsing is untrusted; outputs are proposals only; must be approved."
  - "Auditability: every tool invocation and approval decision logged immutably."

role_matrix:
  agents:
    ui_orchestrator:
      purpose: "Decide what to show + personalization; outputs UIPlan."
      allowed_tool_groups: ["foundation", "discovery", "menu_catalog", "offers_pricing", "guest_profile", "ui_plan", "telemetry"]
      forbidden_tool_groups: ["admin_ops", "venue_ops_mutations", "payments_refunds", "research_browser"]
    waiter:
      purpose: "Guide guest journey + cart/order + service calls."
      allowed_tool_groups: ["foundation", "visit_table", "cart_order", "menu_catalog", "offers_pricing", "service_calls", "guest_profile", "telemetry", "safety"]
      forbidden_tool_groups: ["admin_ops", "venue_ops_mutations", "research_browser"]
    venue_assistant_manager:
      purpose: "Assist bar manager: shift ops, drafts, review summaries, inventory signals."
      allowed_tool_groups: ["foundation", "venue_ops_read", "menu_drafts", "promo_drafts", "inventory_read", "reviews_kpis", "telemetry", "approvals"]
      forbidden_tool_groups: ["platform_admin_mutations", "research_browser"]
    platform_admin:
      purpose: "Platform ops: onboarding, support triage, compliance exports, access grants (approval gated)."
      allowed_tool_groups: ["foundation", "platform_ops", "support_ops", "analytics_reports", "approvals", "audit_compliance"]
      forbidden_tool_groups: ["research_browser_direct_ops"]
    research_intel:
      purpose: "Geo-fenced industry research; produces structured findings + proposals only."
      allowed_tool_groups: ["foundation", "research_browser", "research_processing", "citations", "proposals_only", "telemetry"]
      forbidden_tool_groups: ["all_mutations", "payments_refunds", "access_control_mutations", "menu_publish", "promo_publish"]

tool_groups_definition:
  foundation:
    must_include_tools:
      - auth.whoami
      - auth.get_roles
      - tenant.resolve_context
      - policy.check
      - audit.log
      - session.get
      - session.set
      - rate_limit.check
      - approval.request
      - approval.status
      - approval.resolve
      - health.ping
  ui_plan:
    must_include_tools: [ui.compose, ui.validate, ui.explain]
  discovery:
    must_include_tools: [venues.search, venues.list_nearby, venues.get, venues.get_hours, venues.get_assets]
  menu_catalog:
    must_include_tools: [menu.get, menu.search, menu.get_item, addons.list, allergens.get_item_profile, dietary.check]
  offers_pricing:
    must_include_tools: [offers.list_applicable, offers.get, offers.apply_preview, pricing.quote]
  guest_profile:
    must_include_tools: [guest.get_profile, guest.get_history, guest.update_preferences]
  visit_table:
    must_include_tools: [visit.start, visit.get, visit.assign_table, visit.end, table.list, table.get]
  cart_order:
    must_include_tools: [cart.get, cart.add_item, cart.update_item, cart.remove_item, cart.clear, cart.quote, order.submit, order.get, order.status]
  service_calls:
    must_include_tools: [service.call_staff, service.request_bill, service.request_assistance, service.log_incident]
  venue_ops_read:
    must_include_tools: [shift.get_current, staff.list, inventory.status, inventory.low_stock, reviews.fetch, service.kpi.snapshot, sales.snapshot]
  menu_drafts:
    must_include_tools: [menu.draft.create, menu.draft.update, menu.draft.validate, menu.publish.request, menu.publish.status]
  promo_drafts:
    must_include_tools: [promo.draft.create, promo.draft.simulate, promo.publish.request, promo.pause.request]
  platform_ops:
    must_include_tools: [platform.venue.onboard, platform.venue.verify, platform.venue.healthcheck, platform.user.search, platform.access.grant.request, platform.access.revoke.request]
  support_ops:
    must_include_tools: [support.ticket.create, support.ticket.update, support.ticket.assign, support.refund.request]
  analytics_reports:
    must_include_tools: [analytics.metric, analytics.dashboard_snapshot, exports.generate]
  audit_compliance:
    must_include_tools: [audit.search, audit.export, policy.update.request, data.retention.apply]
  safety:
    must_include_tools: [abuse.check_message, fraud.score_order, fraud.score_venue, risk.block_request, risk.allowlist_request]
  research_browser:
    must_include_tools: [research.search_web, research.open_url, research.extract]
  research_processing:
    must_include_tools: [research.classify, research.score_source, research.geo_filter, research.dedupe, research.summarize]
  citations:
    must_include_tools: [research.cite]
  proposals_only:
    must_include_tools: [research_to_ops.propose_actions]

workflows:

  - id: WF-00_SYSTEM_BOOTSTRAP
    name: "Private Moltbot Deployment + DineIn Backend Bridge"
    goal: "Deploy Moltbot gateway privately; create backend routes that broker all agent calls."
    triggers: ["project_start"]
    steps:
      - "Deploy Moltbot gateway in private network (tailnet/VPC). No public exposure."
      - "Enable gateway auth; store token in backend secret store only."
      - "Implement backend broker endpoints: /ai/ui-plan, /ai/waiter, /ai/manager, /ai/admin, /ai/research."
      - "Implement unified request envelope: {actor, tenant, sessionKey, locale, device, payload}."
      - "Implement strict inbound validation + size caps + profanity/jailbreak scanning (abuse.check_message)."
      - "Route each endpoint to the correct agent id and tool allowlist policy."
    outputs:
      - "Running private gateway"
      - "Backend broker endpoints live"
      - "Centralized auth + policy enforcement"
    guardrails:
      - "Apps never call Moltbot directly"
      - "Deny-by-default agent policy"
      - "All calls logged (audit.log)"

  - id: WF-01_TOOLBELT_IMPLEMENTATION
    name: "Tool Registry + Server-Enforced Tenant Isolation"
    goal: "Implement all tools as server-side functions with tenant enforcement and auditing."
    triggers: ["after_WF-00_SYSTEM_BOOTSTRAP"]
    steps:
      - "For each tool group, implement a server function (Supabase Edge/API) with required inputs."
      - "Every tool handler must call tenant.resolve_context and policy.check before touching DB."
      - "Every tool handler must log audit.log with {toolName, actor, tenantId, venueId, sessionKey, inputsHash, outputsHash}."
      - "Implement idempotency keys for order/payment-like tools."
      - "Return minimal data needed; strip secrets/internal IDs from model-visible outputs."
    outputs:
      - "Tool handlers live and policy-gated"
      - "Audit logs for every invocation"
    guardrails:
      - "All write tools require approvals or elevated roles"
      - "No cross-tenant reads (server-side checks)"

  - id: WF-02_SESSION_AND_MEMORY_HYGIENE
    name: "Session Keys + Working Memory Summaries"
    goal: "Maintain continuity per guest/table/staff without leakage."
    triggers: ["any_ai_request"]
    steps:
      - "Derive sessionKey = 'tenant:{tenantId}:venue:{venueId}:visit:{visitId}' (or staff/admin equivalent)."
      - "On each request, session.get(sessionKey) -> working_memory."
      - "If working_memory too large, summarize into stable fields (preferences, cart status, unresolved issues)."
      - "Persist only what is needed; expire visit memory on visit.end."
    outputs:
      - "Stable, scoped memory for each experience"
    guardrails:
      - "Never store cross-tenant references in memory"
      - "Do not store secrets; do not store full PII unless required"

  - id: WF-03_UI_PLAN_PIPELINE
    name: "UI Orchestration via UIPlan (Flutter + PWA)"
    goal: "Moltbot decides ‘what to show’; apps render deterministically."
    triggers: ["client_app_open", "home_refresh", "venue_open", "menu_open", "search"]
    inputs:
      required: ["guestId|deviceId", "location?", "filters?", "screenContext"]
    steps:
      - "Backend validates actor + tenant; fetch guest.get_profile + guest.get_history."
      - "Call venues.list_nearby/search depending on screenContext."
      - "Call offers.list_applicable per venue shortlist."
      - "Call menu.get minimal summaries where needed (avoid heavy payload)."
      - "Call ui.compose(planRequest) to create UIPlan."
      - "Call ui.validate(uiPlan) and reject/repair if invalid."
      - "Return {uiPlan, cacheTTL, explainDebug?} to client."
    outputs:
      - "Renderable UIPlan JSON for the app"
    guardrails:
      - "UIPlan must reference only IDs returned by tools"
      - "No ‘invented’ discounts, hours, availability"
      - "Telemetry events fired for impressions/clicks"

  - id: WF-04_WAITER_CHAT_JOURNEY
    name: "Waiter Mode (Guest Guidance + Ordering + Service)"
    goal: "Conversational waiter that can build carts, explain menu, and call staff."
    triggers: ["guest_message", "guest_add_to_cart", "guest_checkout"]
    inputs:
      required: ["visitId", "guest_message|action", "locale"]
    steps:
      - "Load visit.get + cart.get + guest.get_profile."
      - "If message contains request for recommendations -> menu.search + dietary.check + recommendations logic."
      - "If user wants item -> cart.add_item (confirm addons/notes)."
      - "Before order.submit -> cart.quote + offers.apply_preview + pricing.quote; confirm totals."
      - "order.submit only on explicit confirmation."
      - "For issues (delay/complaint) -> service.call_staff + service.log_incident."
      - "Update session memory summary after each turn."
    outputs:
      - "Assistant reply"
      - "Optional UI actions (e.g., openMenuSection, showCheckout)"
    guardrails:
      - "Explicit confirmation required for submit/cancel/modify"
      - "Allergy warnings must be explicit"
      - "Escalate to staff on safety/complaint triggers"

  - id: WF-05_VENUE_ASSISTANT_MANAGER
    name: "Bar Manager Chief-of-Staff"
    goal: "Operate drafts, insights, staff summaries, inventory signals; never publish without approval."
    triggers: ["manager_request", "daily_summary_schedule", "incident_detected"]
    steps:
      - "shift.get_current + staff.list to build current ops picture."
      - "inventory.low_stock + sales.top_items to detect risks/opportunities."
      - "reviews.fetch + reviews.summarize to extract themes."
      - "If menu changes requested -> menu.draft.create/update/validate."
      - "If promo requested -> promo.draft.create + promo.draft.simulate."
      - "Any publish -> approval.request then promo.publish.request or menu.publish.request."
    outputs:
      - "Actionable manager brief"
      - "Draft artifacts (menu draft, promo draft) + approval requests"
    guardrails:
      - "No publish without approval.resolve(decision=approve)"
      - "No staff PII exposure beyond role-appropriate context"

  - id: WF-06_PLATFORM_ADMIN_ASSISTANT
    name: "Platform Admin Ops + Compliance"
    goal: "Onboarding, support triage, analytics, compliance exports with approvals."
    triggers: ["admin_request", "support_inbox_event", "weekly_compliance_schedule"]
    steps:
      - "For onboarding