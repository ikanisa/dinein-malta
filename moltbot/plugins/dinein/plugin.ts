/**
 * DineIn Moltbot Plugin
 * 
 * Registers the DineIn toolbelt, agents, and policies.
 */

import { UI_ORCHESTRATOR_AGENT } from "./agents/ui_orchestrator.agent.ts";
import { WAITER_AGENT } from "./agents/waiter.agent.ts";
import { VENUE_MANAGER_AGENT } from "./agents/venue_manager.agent.ts";
import { PLATFORM_ADMIN_AGENT } from "./agents/platform_admin.agent.ts";
import { RESEARCH_INTEL_AGENT } from "./agents/research_intel.agent.ts";
import { AGENT_TOOL_ALLOWLIST } from "./policies/allowlists.ts";

export const DineInPlugin = {
    name: "dinein-core",
    version: "1.0.0",
    agents: [
        UI_ORCHESTRATOR_AGENT,
        WAITER_AGENT,
        VENUE_MANAGER_AGENT,
        PLATFORM_ADMIN_AGENT,
        RESEARCH_INTEL_AGENT,
    ],
    policies: {
        allowlists: AGENT_TOOL_ALLOWLIST,
    },
    onInit: () => {
        console.log("DineIn Moltbot Plugin initialized");
    },
};
