/**
 * Audit Logger
 * 
 * Logs tool execution, policy decisions, and approvals.
 */

export const auditLogger = {
    log: (event: string, details: unknown) => {
        console.log(`[AUDIT] ${event}`, details);
    }
};
