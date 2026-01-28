/**
 * Response Actions
 * 
 * Actions to take based on detection severity.
 */

import { Severity, DetectionResult } from "./detection_rules.ts";

export interface ResponseAction {
    block: boolean;
    blockDurationMinutes: number;
    logIncident: boolean;
    escalateToAdmin: boolean;
    rateLimit: boolean;
    rateLimitSeconds: number;
    requireReauth: boolean;
    userMessage: string;
}

const RESPONSE_CONFIG: Record<Severity, ResponseAction> = {
    low: {
        block: false,
        blockDurationMinutes: 0,
        logIncident: false,
        escalateToAdmin: false,
        rateLimit: false,
        rateLimitSeconds: 0,
        requireReauth: false,
        userMessage: "" // Proceed normally
    },
    medium: {
        block: false,
        blockDurationMinutes: 0,
        logIncident: true,
        escalateToAdmin: false,
        rateLimit: true,
        rateLimitSeconds: 30,
        requireReauth: false,
        userMessage: "injection_refusal"
    },
    high: {
        block: true,
        blockDurationMinutes: 10,
        logIncident: true,
        escalateToAdmin: true,
        rateLimit: true,
        rateLimitSeconds: 60,
        requireReauth: false,
        userMessage: "injection_refusal"
    },
    critical: {
        block: true,
        blockDurationMinutes: 30,
        logIncident: true,
        escalateToAdmin: true,
        rateLimit: true,
        rateLimitSeconds: 300,
        requireReauth: true,
        userMessage: "injection_refusal"
    }
};

/**
 * Get the response action for a given detection result.
 */
export function getResponseAction(detection: DetectionResult): ResponseAction {
    return RESPONSE_CONFIG[detection.severity];
}

/**
 * Apply the response action (execute side effects).
 */
export async function applyResponseAction(
    action: ResponseAction,
    context: { sessionKey: string; actorId: string; requestId: string }
): Promise<void> {
    // These would call actual backend services

    if (action.logIncident) {
        console.log(`[INCIDENT] sessionKey=${context.sessionKey}, requestId=${context.requestId}`);
        // await incidentHandler.create(...)
    }

    if (action.block) {
        console.log(`[BLOCK] sessionKey=${context.sessionKey} for ${action.blockDurationMinutes} minutes`);
        // await sessionManager.block(context.sessionKey, action.blockDurationMinutes)
    }

    if (action.rateLimit) {
        console.log(`[RATE_LIMIT] ${context.sessionKey} cooldown ${action.rateLimitSeconds}s`);
        // await rateLimiter.applyCooldown(context.sessionKey, action.rateLimitSeconds)
    }

    if (action.escalateToAdmin) {
        console.log(`[ESCALATE] Notify platform_admin for ${context.requestId}`);
        // await adminNotifier.notify(...)
    }
}
