/**
 * Agent Tool Allowlists
 * 
 * Defines which tools are available to each agent type.
 * Deny-by-default: only tools listed here can be used.
 */

export const AGENT_TOOL_ALLOWLIST = {
    ui_orchestrator: [
        "foundation.*",
        "venues.search",
        "venues.list_nearby",
        "venues.get",
        "menu.get",
        "menu.search",
        "offers.list_applicable",
        "guest.get_profile",
        "guest.get_history",
        "ui.compose",
        "ui.validate",
        "ui.explain",
    ],
    waiter: [
        "foundation.*",
        "visit.*",
        "cart.*",
        "order.status",
        "order.submit", // Requires confirmation
        "menu.*",
        "offers.*",
        "pricing.quote",
        "service.*",
        "guest.*",
        "abuse.check_message",
    ],
    venue_assistant_manager: [
        "foundation.*",
        "venue_ops.*", // read-only ops
        "menu.draft.*",
        "promo.draft.*",
        "inventory.*",
        "reviews.*",
        "approval.request",
    ],
    platform_admin: [
        "foundation.*",
        "platform.*",
        "support.*",
        "audit.*",
        "approval.resolve", // Admin can approve
    ],
    research_intel: [
        "foundation.*",
        "research.*", // Full research suite
        "proposals.propose_actions",
    ],
};
