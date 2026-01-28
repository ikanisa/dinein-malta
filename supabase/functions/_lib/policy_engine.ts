/**
 * Policy Engine for Moltbot Agent Tool Access Control
 * 
 * Enforces least-privilege access by mapping each agent type to its
 * allowed tool set. Deny-by-default: any tool not explicitly listed
 * is blocked for that agent.
 */

// =============================================================================
// AGENT TYPES
// =============================================================================

export type AgentType =
    | "guest"
    | "bar_manager"
    | "admin"
    | "ui_orchestrator"
    | "research_intel";

// =============================================================================
// TOOL POLICY DEFINITIONS
// =============================================================================

/**
 * Maps agent_type -> list of allowed tool names.
 * This is the single source of truth for tool permissions.
 */
const TOOL_POLICIES: Record<AgentType, Set<string>> = {
    // Guest agent (AI Waiter): menu browsing, cart, orders, preferences
    guest: new Set([
        // Foundation tools (per Moltbot spec)
        "health.ping",
        "auth.whoami",
        "auth.get_roles",
        "session.get",
        "session.set",
        "rate_limit.check",
        "tenant.resolve_context",
        "audit.log",

        // Menu & catalog
        "menu_search",
        "get_item_details",
        "get_popular_items",

        // Cart & ordering
        "add_to_cart",
        "view_cart",
        "remove_from_cart",
        "place_order",
        "check_order_status",

        // Service calls
        "call_staff",

        // Guest intelligence
        "save_preference",
        "get_my_preferences",
        "get_past_orders",
        "get_recommendations",
    ]),


    // Bar Manager agent: operations, orders, analytics, drafts
    bar_manager: new Set([
        // Foundation tools (per Moltbot spec)
        "health.ping",
        "auth.whoami",
        "auth.get_roles",
        "session.get",
        "session.set",
        "rate_limit.check",
        "tenant.resolve_context",
        "audit.log",

        // Order management (existing tools)
        "get_active_orders",
        "update_order_status",
        "get_sales_summary",

        // Venue ops (read) - dot notation
        "shift.get_current",
        "staff.list",
        "inventory.status",
        "inventory.low_stock",
        "reviews.fetch",
        "service.kpi.snapshot",
        "sales.snapshot",

        // Venue ops (read) - underscore notation (actual tool names)
        "shift_get_current",
        "staff_list",
        "inventory_status",
        "inventory_low_stock",
        "reviews_fetch",
        "service_kpi_snapshot",


        // Menu drafts (requires approval to publish)
        "menu.draft.create",
        "menu.draft.update",
        "menu.draft.validate",
        "menu.publish.request",
        "menu.publish.status",

        // Menu drafts - underscore notation
        "menu_draft_create",
        "menu_draft_update",
        "menu_draft_validate",
        "menu_publish_request",
        "menu_publish_status",

        // Promo drafts (requires approval to publish)
        "promo.draft.create",
        "promo.draft.simulate",
        "promo.publish.request",
        "promo.pause.request",

        // Promo drafts - underscore notation
        "promo_draft_create",
        "promo_draft_simulate",
        "promo_publish_request",

        // Approvals
        "approval.request",
        "approval.status",
    ]),

    // Admin agent: platform ops, support, compliance
    admin: new Set([
        // Foundation tools (per Moltbot spec)
        "health.ping",
        "auth.whoami",
        "auth.get_roles",
        "session.get",
        "session.set",
        "rate_limit.check",
        "tenant.resolve_context",
        "audit.log",

        // Platform operations
        "platform.venue.onboard",
        "platform.venue.verify",
        "platform.venue.healthcheck",
        "platform.user.search",
        "platform.access.grant.request",
        "platform.access.revoke.request",

        // Support operations
        "support.ticket.create",
        "support.ticket.update",
        "support.ticket.assign",
        "support.refund.request",

        // Analytics & reports
        "analytics.metric",
        "analytics.dashboard_snapshot",
        "exports.generate",

        // Audit & compliance
        "audit.search",
        "audit.export",
        "policy.update.request",
        "data.retention.apply",

        // Approvals (admin can resolve)
        "approval.request",
        "approval.status",
        "approval.resolve",


        // Admin tools - underscore notation (actual tool names)
        "platform_venue_list",
        "platform_venue_verify",
        "platform_venue_suspend",
        "platform_user_search",
        "support_ticket_list",
        "support_ticket_update",
        "support_refund_approve",
        "approval_list_pending",
        "approval_get_details",
        "approval_resolve",
        "analytics_platform_summary",
        "analytics_venue_health",
        "audit_search",
    ]),

    // UI Orchestrator: discovery, personalization, UIPlan composition
    ui_orchestrator: new Set([
        // Foundation tools (per Moltbot spec)
        "health.ping",
        "auth.whoami",
        "auth.get_roles",
        "session.get",
        "session.set",
        "rate_limit.check",
        "tenant.resolve_context",
        "audit.log",

        // Discovery - dot notation
        "venues.search",
        "venues.list_nearby",
        "venues.get",
        "venues.get_hours",
        "venues.get_assets",

        // Discovery - underscore notation (actual tool names)
        "venues_search",
        "venues_list",
        "venues_get",


        // Menu catalog (read-only)
        "menu.get",
        "menu.search",
        "menu.get_item",
        "addons.list",
        "allergens.get_item_profile",
        "dietary.check",

        // Menu catalog - underscore notation
        "menu_get",

        // Offers & pricing
        "offers.list_applicable",
        "offers.get",
        "offers.apply_preview",
        "pricing.quote",

        // Offers - underscore notation
        "offers_list_applicable",

        // Guest profile (for personalization)
        "guest.get_profile",
        "guest.get_history",

        // Guest - underscore notation
        "guest_get_profile",

        // UI Plan output
        "ui.compose",
        "ui.validate",
        "ui.explain",

        // UI Plan - underscore notation
        "ui_compose",
        "ui_validate",
    ]),

    // Research Intel: browser tools + proposals ONLY (no mutations)
    research_intel: new Set([
        // Foundation tools (per Moltbot spec)
        "health.ping",
        "auth.whoami",
        "auth.get_roles",
        "session.get",
        "session.set",
        "rate_limit.check",
        "tenant.resolve_context",
        "audit.log",

        // Research browser (geo-fenced)
        "research.search_web",
        "research.open_url",
        "research.extract",

        // Research processing
        "research.classify",
        "research.score_source",
        "research.geo_filter",
        "research.dedupe",
        "research.summarize",

        // Citations
        "research.cite",


        // Proposals only (no direct execution)
        "research_to_ops.propose_actions",
    ]),
};

// =============================================================================
// FORBIDDEN TOOLS (explicit deny regardless of policy)
// These are NEVER allowed for the specified agent types.
// =============================================================================

const FORBIDDEN_TOOLS: Record<AgentType, Set<string>> = {
    guest: new Set([
        "approval.resolve",
        "platform.venue.onboard",
        "research.search_web",
        "menu.publish.request",
    ]),
    bar_manager: new Set([
        "platform.venue.onboard",
        "research.search_web",
        "approval.resolve", // Can request, but admin resolves
    ]),
    admin: new Set([
        "research.search_web", // Admin uses research_intel for research
    ]),
    ui_orchestrator: new Set([
        "approval.resolve",
        "research.search_web",
        "order.submit", // UI orchestrator doesn't submit orders
    ]),
    research_intel: new Set([
        // Research has NO mutation tools
        "order.submit",
        "menu.publish.request",
        "promo.publish.request",
        "approval.resolve",
        "platform.access.grant.request",
        "support.refund.request",
    ]),
};

// =============================================================================
// POLICY CHECK FUNCTION
// =============================================================================

export interface PolicyCheckResult {
    allowed: boolean;
    reason?: string;
}

/**
 * Check if an agent is allowed to use a specific tool.
 * Deny-by-default: tool must be explicitly in the allowlist.
 */
export function checkPolicy(agentType: AgentType, toolName: string): PolicyCheckResult {
    // Check forbidden list first
    const forbidden = FORBIDDEN_TOOLS[agentType];
    if (forbidden?.has(toolName)) {
        return {
            allowed: false,
            reason: `Tool "${toolName}" is explicitly forbidden for agent type "${agentType}"`,
        };
    }

    // Check allowlist
    const allowed = TOOL_POLICIES[agentType];
    if (!allowed) {
        return {
            allowed: false,
            reason: `Unknown agent type: ${agentType}`,
        };
    }

    if (!allowed.has(toolName)) {
        return {
            allowed: false,
            reason: `Tool "${toolName}" is not in the allowlist for agent type "${agentType}"`,
        };
    }

    return { allowed: true };
}

/**
 * Get all allowed tools for an agent type.
 * Useful for generating tool definitions to send to Claude.
 */
export function getAllowedTools(agentType: AgentType): string[] {
    return Array.from(TOOL_POLICIES[agentType] || []);
}

// =============================================================================
// CORRELATION ID GENERATION
// =============================================================================

/**
 * Generate a unique correlation ID for tracing requests across tools.
 * Format: corr_{timestamp}_{random}
 */
export function generateCorrelationId(): string {
    const timestamp = Date.now().toString(36);
    const random = crypto.randomUUID().split("-")[0];
    return `corr_${timestamp}_${random}`;
}

// =============================================================================
// AUDIT LOGGING HELPERS
// =============================================================================

export interface AuditEntry {
    correlationId: string;
    agentType: AgentType;
    toolName: string;
    allowed: boolean;
    reason?: string;
    tenantId?: string;
    venueId?: string;
    userId?: string;
    timestamp: string;
}

/**
 * Create a structured audit log entry for policy decisions.
 */
export function createAuditEntry(
    correlationId: string,
    agentType: AgentType,
    toolName: string,
    result: PolicyCheckResult,
    context?: { tenantId?: string; venueId?: string; userId?: string }
): AuditEntry {
    return {
        correlationId,
        agentType,
        toolName,
        allowed: result.allowed,
        reason: result.reason,
        tenantId: context?.tenantId,
        venueId: context?.venueId,
        userId: context?.userId,
        timestamp: new Date().toISOString(),
    };
}
