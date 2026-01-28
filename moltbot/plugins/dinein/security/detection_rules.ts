/**
 * Detection Rules
 * 
 * Scoring functions for identifying security threats.
 */

export type Severity = "low" | "medium" | "high" | "critical";

export interface DetectionResult {
    severity: Severity;
    score: number;
    triggers: string[];
    shouldBlock: boolean;
}

// Patterns for prompt injection detection
const INJECTION_PATTERNS = {
    ignoreRules: /ignore\s+(previous|all|these|system)\s+(rules|instructions|prompts)/i,
    revealSecrets: /(reveal|show|print|display|output)\s+(secret|token|api.?key|password|prompt)/i,
    toolInjection: /(call|use|invoke|execute)\s+(tool|function|admin|order\.submit|refund)/i,
    socialEngineering: /i\s+(am|'m)\s+(the\s+)?(ceo|admin|owner|manager|developer)/i,
    bypassPolicy: /(bypass|skip|ignore|disable)\s+(policy|security|check|validation)/i
};

// Patterns for abuse detection
const ABUSE_PATTERNS = {
    harassment: /(hate|stupid|idiot|dumb|ugly|kill|die|threat)/i,
    sexualHarassment: /(sexy|hot|naked|date\s+me|send\s+nudes)/i,
    threats: /(i\s+will\s+hurt|i\s+will\s+kill|bomb|attack|sue\s+you)/i
};

/**
 * Check user message for prompt injection attempts.
 */
export function detectPromptInjection(text: string, context?: { tenantId?: string }): DetectionResult {
    let score = 0.2; // base
    const triggers: string[] = [];

    if (INJECTION_PATTERNS.ignoreRules.test(text)) {
        score += 0.3;
        triggers.push("match_ignore_rules");
    }
    if (INJECTION_PATTERNS.revealSecrets.test(text)) {
        score += 0.4;
        triggers.push("secret_request");
    }
    if (INJECTION_PATTERNS.toolInjection.test(text)) {
        score += 0.4;
        triggers.push("tool_call_injection");
    }
    if (INJECTION_PATTERNS.socialEngineering.test(text)) {
        score += 0.3;
        triggers.push("social_engineering");
    }
    if (INJECTION_PATTERNS.bypassPolicy.test(text)) {
        score += 0.3;
        triggers.push("bypass_policy");
    }

    // Check for foreign tenant/venue IDs (UUID pattern not matching context)
    const uuidPattern = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi;
    const foundIds = text.match(uuidPattern) || [];
    if (context?.tenantId && foundIds.some(id => id !== context.tenantId)) {
        score += 0.5;
        triggers.push("cross_tenant_ids");
    }

    const severity = scorToSeverity(score);
    return {
        severity,
        score,
        triggers,
        shouldBlock: severity === "high" || severity === "critical"
    };
}

/**
 * Check message for harassment/abuse.
 */
export function detectAbuse(text: string): DetectionResult {
    let score = 0.1;
    const triggers: string[] = [];

    if (ABUSE_PATTERNS.harassment.test(text)) {
        score += 0.4;
        triggers.push("harassment");
    }
    if (ABUSE_PATTERNS.sexualHarassment.test(text)) {
        score += 0.5;
        triggers.push("sexual_harassment");
    }
    if (ABUSE_PATTERNS.threats.test(text)) {
        score += 0.6;
        triggers.push("threats");
    }

    const severity = scorToSeverity(score);
    return {
        severity,
        score,
        triggers,
        shouldBlock: severity === "high" || severity === "critical"
    };
}

/**
 * Check web content for injection (Research agent only).
 */
export function detectWebContentInjection(content: string): DetectionResult {
    let score = 0.3; // higher base for web content
    const triggers: string[] = [];

    // Check for instruction-like patterns
    if (/\[SYSTEM\]|<INSTRUCTION>|<!-- ignore/i.test(content)) {
        score += 0.4;
        triggers.push("hidden_instruction");
    }
    if (INJECTION_PATTERNS.toolInjection.test(content)) {
        score += 0.4;
        triggers.push("tool_injection_in_content");
    }
    if (/password|credential|login.*form/i.test(content)) {
        score += 0.3;
        triggers.push("credential_harvest_pattern");
    }

    const severity = scorToSeverity(score);
    return {
        severity,
        score,
        triggers,
        shouldBlock: severity === "high" || severity === "critical"
    };
}

function scorToSeverity(score: number): Severity {
    if (score >= 0.9) return "critical";
    if (score >= 0.7) return "high";
    if (score >= 0.5) return "medium";
    return "low";
}
