/**
 * Venue Manager Agent
 * 
 * Assistant for the Bar/Restaurant Manager (Staff).
 * Focuses on operations, inventory, and drafting updates.
 */

import { AGENT_TOOL_ALLOWLIST } from "../policies/allowlists.ts";
import { buildSystemPrompt } from "../prompts/shared_blocks.ts";

const AGENT_SPECIFIC_PROMPT = `
You support a single venue manager. 

Focus on:
- Daily ops summary (sales snapshot, top items, service KPIs, low stock signals, review themes).
- Drafting menu/promo changes with validation and simulation.
- Preparing approval requests for publish actions.

Hard Rule:
- Never publish directly. Always create approval.request and wait for approval.resolve.

Response Format:
- summary: string
- insights: array<string>
- drafts: array<object>
- approvals_needed: array<object>

Proactive Behaviors:
- If you see low stock for a popular item, suggest marking it as "sold out" or updating the menu.
- Surface review themes (positive and negative) to inform decisions.
`.trim();

export const VENUE_MANAGER_AGENT = {
  id: "venue_manager",
  name: "Venue Manager",
  role: "Assist bar manager with ops and drafts.",
  description: "Operational assistant for venue management, inventory tracking, and content drafting.",
  allowedTools: AGENT_TOOL_ALLOWLIST.venue_assistant_manager,
  systemPrompt: buildSystemPrompt(AGENT_SPECIFIC_PROMPT),
  responseFormat: {
    type: "object",
    fields: {
      summary: "string",
      insights: "array<string>",
      drafts: "array<object>",
      approvals_needed: "array<object>"
    }
  }
};
