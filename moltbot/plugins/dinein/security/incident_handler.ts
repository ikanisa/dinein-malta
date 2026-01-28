/**
 * Incident Handler
 * 
 * Creates, tracks, and manages security incidents.
 */

import { Severity, DetectionResult } from "./detection_rules.ts";

export interface Incident {
    id: string;
    requestId: string;
    sessionKey: string;
    actorId: string;
    severity: Severity;
    triggers: string[];
    status: "open" | "triaging" | "remediating" | "closed";
    createdAt: string;
    updatedAt: string;
    notes: string[];
    actionsLog: string[];
}

/**
 * Create a new incident record.
 */
export async function createIncident(
    detection: DetectionResult,
    context: { requestId: string; sessionKey: string; actorId: string; excerpt?: string }
): Promise<Incident> {
    const incident: Incident = {
        id: crypto.randomUUID(),
        requestId: context.requestId,
        sessionKey: context.sessionKey,
        actorId: context.actorId,
        severity: detection.severity,
        triggers: detection.triggers,
        status: "open",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        notes: context.excerpt ? [`Excerpt: ${sanitizeExcerpt(context.excerpt)}`] : [],
        actionsLog: ["Incident created automatically by detection system"]
    };

    // In production: save to database
    console.log(`[INCIDENT_CREATED] ${JSON.stringify(incident)}`);

    return incident;
}

/**
 * Update incident status and log actions.
 */
export async function updateIncident(
    incidentId: string,
    update: { status?: Incident["status"]; note?: string; action?: string }
): Promise<void> {
    console.log(`[INCIDENT_UPDATE] id=${incidentId} update=${JSON.stringify(update)}`);
    // In production: update database record
}

/**
 * Close an incident with resolution details.
 */
export async function closeIncident(
    incidentId: string,
    resolution: { outcome: string; followUp?: string }
): Promise<void> {
    console.log(`[INCIDENT_CLOSED] id=${incidentId} outcome=${resolution.outcome}`);
    // In production: update status to 'closed', add resolution notes
}

/**
 * Sanitize user content for safe storage in incident logs.
 * Truncate and remove potential secrets.
 */
function sanitizeExcerpt(text: string): string {
    // Truncate to 200 chars
    let sanitized = text.substring(0, 200);
    // Mask potential tokens/secrets
    sanitized = sanitized.replace(/[A-Za-z0-9_-]{20,}/g, "[REDACTED]");
    return sanitized;
}
