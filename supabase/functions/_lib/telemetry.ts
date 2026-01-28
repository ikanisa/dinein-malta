// deno-lint-ignore-file no-explicit-any
/**
 * Telemetry Module for Moltbot Agent System
 * 
 * OpenTelemetry-compatible structured logging with:
 * - Span creation and management
 * - Metric collection (latency, tokens, errors)
 * - Trace correlation across tool calls
 * 
 * Note: Exports to Supabase edge function logs in structured format.
 * Can be extended to push to external observability systems.
 */

export interface TelemetryContext {
    traceId: string;
    spanId: string;
    parentSpanId?: string;
    correlationId?: string;
    agentType?: string;
    venueId?: string;
    userId?: string;
}

export interface Span {
    traceId: string;
    spanId: string;
    parentSpanId?: string;
    operationName: string;
    startTime: number;
    endTime?: number;
    durationMs?: number;
    status: "ok" | "error" | "unset";
    attributes: Record<string, string | number | boolean>;
    events: SpanEvent[];
}

export interface SpanEvent {
    name: string;
    timestamp: number;
    attributes?: Record<string, string | number | boolean>;
}

export interface Metrics {
    requestLatencyMs: number;
    toolExecutionMs: number;
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
    costUsd: number;
    errorCount: number;
}

// In-memory spans for current request (reset per request)
const activeSpans = new Map<string, Span>();

/**
 * Generate a random span ID (16 hex chars)
 */
function generateSpanId(): string {
    return crypto.randomUUID().replace(/-/g, "").substring(0, 16);
}

/**
 * Generate a trace ID (32 hex chars)
 */
function generateTraceId(): string {
    return crypto.randomUUID().replace(/-/g, "");
}

/**
 * Create a new telemetry context for a request
 */
export function createTelemetryContext(
    correlationId?: string,
    agentType?: string,
    venueId?: string,
    userId?: string
): TelemetryContext {
    return {
        traceId: generateTraceId(),
        spanId: generateSpanId(),
        correlationId,
        agentType,
        venueId,
        userId,
    };
}

/**
 * Start a new span
 */
export function startSpan(
    operationName: string,
    context: TelemetryContext,
    attributes: Record<string, string | number | boolean> = {}
): Span {
    const span: Span = {
        traceId: context.traceId,
        spanId: generateSpanId(),
        parentSpanId: context.spanId,
        operationName,
        startTime: Date.now(),
        status: "unset",
        attributes: {
            ...attributes,
            "correlation.id": context.correlationId || "",
            "agent.type": context.agentType || "",
            "venue.id": context.venueId || "",
            "user.id": context.userId || "",
        },
        events: [],
    };

    activeSpans.set(span.spanId, span);
    return span;
}

/**
 * End a span
 */
export function endSpan(span: Span, status: "ok" | "error" = "ok"): void {
    span.endTime = Date.now();
    span.durationMs = span.endTime - span.startTime;
    span.status = status;

    // Log the span in structured format
    logSpan(span);

    // Remove from active spans
    activeSpans.delete(span.spanId);
}

/**
 * Add an event to a span
 */
export function addSpanEvent(
    span: Span,
    name: string,
    attributes?: Record<string, string | number | boolean>
): void {
    span.events.push({
        name,
        timestamp: Date.now(),
        attributes,
    });
}

/**
 * Record an error on a span
 */
export function recordError(span: Span, error: Error): void {
    addSpanEvent(span, "exception", {
        "exception.type": error.name,
        "exception.message": error.message,
    });
    span.status = "error";
}

/**
 * Log a span in structured format for observability
 */
function logSpan(span: Span): void {
    const logEntry = {
        type: "span",
        traceId: span.traceId,
        spanId: span.spanId,
        parentSpanId: span.parentSpanId,
        operation: span.operationName,
        durationMs: span.durationMs,
        status: span.status,
        attributes: span.attributes,
        eventCount: span.events.length,
        timestamp: new Date().toISOString(),
    };

    console.log(JSON.stringify(logEntry));
}

/**
 * Record metrics for a request
 */
export function recordMetrics(
    context: TelemetryContext,
    metrics: Partial<Metrics>
): void {
    const logEntry = {
        type: "metrics",
        traceId: context.traceId,
        correlationId: context.correlationId,
        agentType: context.agentType,
        venueId: context.venueId,
        ...metrics,
        timestamp: new Date().toISOString(),
    };

    console.log(JSON.stringify(logEntry));
}

/**
 * Create a tool execution span
 */
export function createToolSpan(
    toolName: string,
    context: TelemetryContext,
    input?: Record<string, any>
): Span {
    return startSpan(`tool.${toolName}`, context, {
        "tool.name": toolName,
        "tool.input_size": input ? JSON.stringify(input).length : 0,
    });
}

/**
 * Finalize tool span with result
 */
export function finalizeToolSpan(
    span: Span,
    success: boolean,
    outputSize?: number
): void {
    span.attributes["tool.success"] = success;
    if (outputSize !== undefined) {
        span.attributes["tool.output_size"] = outputSize;
    }
    endSpan(span, success ? "ok" : "error");
}

/**
 * Create a Claude API span
 */
export function createClaudeSpan(
    context: TelemetryContext,
    model: string
): Span {
    return startSpan("claude.completion", context, {
        "llm.model": model,
        "llm.provider": "anthropic",
    });
}

/**
 * Finalize Claude span with token usage
 */
export function finalizeClaudeSpan(
    span: Span,
    inputTokens: number,
    outputTokens: number,
    costUsd?: number
): void {
    span.attributes["llm.input_tokens"] = inputTokens;
    span.attributes["llm.output_tokens"] = outputTokens;
    span.attributes["llm.total_tokens"] = inputTokens + outputTokens;
    if (costUsd !== undefined) {
        span.attributes["llm.cost_usd"] = costUsd;
    }
    endSpan(span, "ok");
}

/**
 * High-level request tracking
 */
export class RequestTracker {
    private context: TelemetryContext;
    private rootSpan: Span;
    private toolSpans: Span[] = [];
    private startTime: number;

    constructor(
        correlationId?: string,
        agentType?: string,
        venueId?: string,
        userId?: string
    ) {
        this.context = createTelemetryContext(correlationId, agentType, venueId, userId);
        this.rootSpan = startSpan("agent.request", this.context);
        this.startTime = Date.now();
    }

    getContext(): TelemetryContext {
        return this.context;
    }

    startTool(toolName: string, input?: Record<string, any>): Span {
        const span = createToolSpan(toolName, this.context, input);
        this.toolSpans.push(span);
        return span;
    }

    endTool(span: Span, success: boolean, outputSize?: number): void {
        finalizeToolSpan(span, success, outputSize);
    }

    complete(success: boolean, metrics?: Partial<Metrics>): void {
        // Record final metrics
        const finalMetrics: Partial<Metrics> = {
            ...metrics,
            requestLatencyMs: Date.now() - this.startTime,
        };

        recordMetrics(this.context, finalMetrics);

        // End root span
        endSpan(this.rootSpan, success ? "ok" : "error");
    }

    recordError(error: Error): void {
        recordError(this.rootSpan, error);
    }
}
