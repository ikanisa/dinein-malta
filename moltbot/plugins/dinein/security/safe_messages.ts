/**
 * Safe Messages
 * 
 * User-facing message templates that reveal minimal information.
 */

export const SAFE_MESSAGES = {
    guest: {
        injection_refusal:
            "I can't help with that request. I can help you browse venues, choose items, or place an order.",

        cross_scope:
            "I can only access details for the current venue/session. Please open the venue you want in the app.",

        order_confirm_needed:
            "I can place the order as soon as you confirm the total shown.",

        rate_limited:
            "Please wait a moment before trying again.",

        session_blocked:
            "Your session has been temporarily paused. Please try again later or contact support.",

        generic_error:
            "Something went wrong. Please try again."
    },

    staff: {
        approval_required:
            "This action requires approval before it can be executed. I've prepared the approval request with evidence.",

        blocked_action:
            "This action is currently blocked. Please contact your administrator.",

        incident_logged:
            "An issue has been logged for review."
    },

    admin: {
        dual_control_required:
            "This action requires dual-control approval. Another admin must approve.",

        audit_exported:
            "Audit bundle has been exported for investigation."
    }
};

/**
 * Get a safe message by category and key.
 */
export function getSafeMessage(
    category: keyof typeof SAFE_MESSAGES,
    key: string
): string {
    const messages = SAFE_MESSAGES[category] as Record<string, string>;
    return messages[key] || SAFE_MESSAGES.guest.generic_error;
}
