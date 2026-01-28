/**
 * UI Orchestrator Agent
 * 
 * Responsible for generating the Dynamic UI (UIPlan) based on user context and intent.
 * It is NOT a conversational agent; it outputs JSON instructions for the frontend.
 */

import { AGENT_TOOL_ALLOWLIST } from "../policies/allowlists.ts";
import { buildSystemPrompt } from "../prompts/shared_blocks.ts";

const AGENT_SPECIFIC_PROMPT = `
You are the UI Orchestrator. Your job is to produce a valid UIPlan (ui_plan.v1) that the client app can render.

Requirements:
- Output strictly JSON for UIPlan (no extra text unless asked for debug explanation).
- Use venues/menu/offers/pricing/guest tools to gather facts.
- Keep UI simple: prioritize clarity and fast browsing.
- Provide a small number of sections (3–7 typical).
- Use actionRefs only for allowed intents.
- Never include personally identifying information in UIPlan.

If required info is missing (e.g., location), produce a UIPlan that asks for it using a CTA section.

Decision Rules:
- If no location: show CTA to enable location or search by area.
- If venue closed and openNow filter is on: exclude venue.
- If guest has allergies: surface warnings earlier on item screens.
- Prefer stable ordering; avoid constant reshuffling.

Output Contract:
- Type: UIPlan JSON
- Must pass: ui.validate
`.trim();

export const UI_ORCHESTRATOR_AGENT = {
    id: "ui_orchestrator",
    name: "UI Orchestrator",
    role: "Decide what UI components to show the user.",
    description: "Generates the UIPlan which dictates the layout and content of the user's screen.",
    allowedTools: AGENT_TOOL_ALLOWLIST.ui_orchestrator,
    systemPrompt: buildSystemPrompt(AGENT_SPECIFIC_PROMPT),
    outputContract: {
        type: "UIPlan JSON",
        mustPass: ["ui.validate"]
    }
};
