/**
 * Safety Tools
 * 
 * Integrates detection rules into the tool pipeline.
 */

import { detectPromptInjection, detectAbuse, DetectionResult } from "../security/detection_rules.ts";
import { getResponseAction, applyResponseAction, ResponseAction } from "../security/response_actions.ts";
import { createIncident } from "../security/incident_handler.ts";
import { getSafeMessage } from "../security/safe_messages.ts";
import { validateToolInput } from "../policies/validators.ts";
import { ClientContext } from "../clients/dinein_api.ts";

export interface AbuseCheckResult {
    allowed: boolean;
    severity: string;
    message?: string;
    incidentId?: string;
}

export const safetyTools = {
    /**
     * Check a user message for abuse, injection, or policy violations.
     * This should be called BEFORE processing any user input.
     */
    "abuse.check_message": async (
        input: { text: string; tenantId?: string },
        context: ClientContext
    ): Promise<AbuseCheckResult> => {
        await validateToolInput("abuse.check_message", input);

        // Run detection rules
        const injectionResult = detectPromptInjection(input.text, { tenantId: input.tenantId });
        const abuseResult = detectAbuse(input.text);

        // Use the higher severity
        const detection: DetectionResult =
            injectionResult.score >= abuseResult.score ? injectionResult : abuseResult;

        // Get response action
        const action = getResponseAction(detection);

        // Apply side effects if needed
        if (action.logIncident) {
            const incident = await createIncident(detection, {
                requestId: context.requestId,
                sessionKey: context.sessionKey,
                actorId: context.actorId || "anonymous",
                excerpt: input.text.substring(0, 200)
            });

            await applyResponseAction(action, {
                sessionKey: context.sessionKey,
                actorId: context.actorId || "anonymous",
                requestId: context.requestId
            });

            return {
                allowed: !detection.shouldBlock,
                severity: detection.severity,
                message: action.userMessage ? getSafeMessage("guest", action.userMessage) : undefined,
                incidentId: incident.id
            };
        }

        return {
            allowed: !detection.shouldBlock,
            severity: detection.severity,
            message: detection.shouldBlock ? getSafeMessage("guest", "injection_refusal") : undefined
        };
    },

    /**
     * Score an order for fraud risk.
     */
    "fraud.score_order": async (
        input: { guestId: string; venueId: string; submitsLast10Min: number; cancelsLast30Min: number },
        _context: ClientContext
    ): Promise<{ score: number; flags: string[] }> => {
        let score = 0;
        const flags: string[] = [];

        if (input.submitsLast10Min >= 5) {
            score += 0.4;
            flags.push("rapid_submit");
        }
        if (input.cancelsLast30Min >= 3) {
            score += 0.3;
            flags.push("cancel_spam");
        }

        return { score, flags };
    },

    /**
     * Request a block on a risky actor (approval-gated).
     */
    "risk.block_request": async (
        input: { targetType: "guest" | "session" | "device"; targetId: string; reason: string },
        _context: ClientContext
    ): Promise<{ approvalRequired: boolean; approvalId?: string }> => {
        // Always requires approval
        console.log(`[RISK_BLOCK_REQUEST] ${input.targetType}:${input.targetId} - ${input.reason}`);
        return {
            approvalRequired: true,
            approvalId: crypto.randomUUID()
        };
    }
};
