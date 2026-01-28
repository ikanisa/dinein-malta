// deno-lint-ignore-file no-explicit-any
/**
 * Audit Export Edge Function
 * 
 * Exports agent action logs for compliance and analytics.
 * Supports JSON and CSV formats with field redaction.
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface ExportRequest {
    start_date: string;      // ISO date
    end_date: string;        // ISO date
    format: "json" | "csv";  // Export format
    agent_type?: string;     // Optional agent filter
    venue_id?: string;       // Optional venue filter
    redact_inputs?: boolean; // Redact tool inputs (default: true)
    limit?: number;          // Max records (default: 1000)
}

interface AgentAction {
    id: string;
    session_id: string;
    correlation_id: string;
    tenant_id: string | null;
    venue_id: string | null;
    user_id: string | null;
    agent_type: string;
    action_type: string;
    tool_name: string | null;
    tool_input: Record<string, any> | null;
    tool_result: Record<string, any> | null;
    input_tokens: number | null;
    output_tokens: number | null;
    cost_usd: number | null;
    created_at: string;
}

// Fields to redact (contain sensitive data)
const SENSITIVE_FIELDS = [
    "password",
    "token",
    "secret",
    "api_key",
    "credit_card",
    "ssn",
];

function redactSensitiveData(obj: Record<string, any> | null): Record<string, any> | null {
    if (!obj) return null;

    const redacted: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
        if (SENSITIVE_FIELDS.some(f => key.toLowerCase().includes(f))) {
            redacted[key] = "[REDACTED]";
        } else if (typeof value === "object" && value !== null) {
            redacted[key] = redactSensitiveData(value);
        } else {
            redacted[key] = value;
        }
    }
    return redacted;
}

function convertToCSV(data: AgentAction[]): string {
    if (data.length === 0) return "";

    const headers = [
        "id",
        "session_id",
        "correlation_id",
        "tenant_id",
        "venue_id",
        "user_id",
        "agent_type",
        "action_type",
        "tool_name",
        "tool_input",
        "tool_result",
        "input_tokens",
        "output_tokens",
        "cost_usd",
        "created_at",
    ];

    const rows = data.map(row => {
        return headers.map(h => {
            const value = (row as any)[h];
            if (value === null || value === undefined) return "";
            if (typeof value === "object") return JSON.stringify(value).replace(/"/g, '""');
            return String(value).replace(/"/g, '""');
        }).map(v => `"${v}"`).join(",");
    });

    return [headers.join(","), ...rows].join("\n");
}

serve(async (req: Request) => {
    // Handle CORS preflight
    if (req.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        // Validate auth
        const authHeader = req.headers.get("Authorization");
        if (!authHeader) {
            return new Response(JSON.stringify({ error: "Unauthorized" }), {
                status: 401,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        // Create Supabase client
        const supabaseUrl = Deno.env.get("SUPABASE_URL");
        const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

        if (!supabaseUrl || !supabaseServiceKey) {
            throw new Error("Missing Supabase configuration");
        }

        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // Verify user is admin
        const token = authHeader.replace("Bearer ", "");
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError || !user) {
            return new Response(JSON.stringify({ error: "Invalid token" }), {
                status: 401,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        // Check admin role
        const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();

        if (profile?.role !== "admin") {
            return new Response(JSON.stringify({ error: "Admin access required" }), {
                status: 403,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        // Parse request
        const body: ExportRequest = await req.json();

        // Validate required fields
        if (!body.start_date || !body.end_date) {
            return new Response(JSON.stringify({ error: "start_date and end_date required" }), {
                status: 400,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        const format = body.format || "json";
        const limit = Math.min(body.limit || 1000, 10000); // Max 10k records
        const redactInputs = body.redact_inputs !== false; // Default true

        // Build query
        let query = supabase
            .from("agent_actions")
            .select("*")
            .gte("created_at", body.start_date)
            .lte("created_at", body.end_date)
            .order("created_at", { ascending: false })
            .limit(limit);

        if (body.agent_type) {
            query = query.eq("agent_type", body.agent_type);
        }
        if (body.venue_id) {
            query = query.eq("venue_id", body.venue_id);
        }

        const { data, error } = await query;

        if (error) {
            console.error("Query error:", error);
            throw error;
        }

        // Redact sensitive data if requested
        let exportData = data as AgentAction[];
        if (redactInputs) {
            exportData = exportData.map(row => ({
                ...row,
                tool_input: redactSensitiveData(row.tool_input),
                tool_result: redactSensitiveData(row.tool_result),
            }));
        }

        // Format response
        if (format === "csv") {
            const csv = convertToCSV(exportData);
            return new Response(csv, {
                headers: {
                    ...corsHeaders,
                    "Content-Type": "text/csv",
                    "Content-Disposition": `attachment; filename="audit_export_${body.start_date}_${body.end_date}.csv"`,
                },
            });
        }

        // JSON format
        return new Response(JSON.stringify({
            meta: {
                start_date: body.start_date,
                end_date: body.end_date,
                record_count: exportData.length,
                redacted: redactInputs,
                exported_at: new Date().toISOString(),
            },
            data: exportData,
        }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });

    } catch (error) {
        console.error("Export error:", error);
        return new Response(JSON.stringify({
            error: error instanceof Error ? error.message : "Export failed",
        }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
});
