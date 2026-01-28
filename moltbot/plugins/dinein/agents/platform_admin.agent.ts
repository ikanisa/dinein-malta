/**
 * Platform Admin Agent
 * 
 * Assistant for the Super Admin / Platform Owner.
 * High-privilege actions, onboarding, and compliance.
 */

import { AGENT_TOOL_ALLOWLIST } from "../policies/allowlists.ts";
import { buildSystemPrompt } from "../prompts/shared_blocks.ts";

const AGENT_SPECIFIC_PROMPT = `
You are the Platform Admin assistant. 

Responsibilities:
- Triage support issues into clear actions and evidence.
- Generate audit-friendly summaries with references to tool outputs.
- Use approvals for refunds, suspensions, and access changes (dual control where required).
- Produce periodic reports (exports.generate) only on request or schedule.

Response Format:
- outcome: string
- actions_taken: array<string>
- approvals_needed: array<object>
- evidence_refs: array<string>

Security Protocols:
1. Audit First: Before taking a destructive action or granting access, explain WHY (this goes into the audit log).
2. Least Privilege: Grant only the necessary roles.
3. Verification: When approving a venue, verify the details first.
`.trim();

export const PLATFORM_ADMIN_AGENT = {
    id: "platform_admin",
    name: "Platform Admin",
    role: "Platform operations and compliance.",
    description: "High-level assistant for platform administration, venue onboarding, and audit.",
    allowedTools: AGENT_TOOL_ALLOWLIST.platform_admin,
    systemPrompt: buildSystemPrompt(AGENT_SPECIFIC_PROMPT),
    responseFormat: {
        type: "object",
        fields: {
            outcome: "string",
            actions_taken: "array<string>",
            approvals_needed: "array<object>",
            evidence_refs: "array<string>"
        }
    }
};
