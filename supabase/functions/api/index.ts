
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { executeGuestTool, executeBarManagerTool } from "../_lib/agent_tools.ts";
import { executeUIOrchestratorTool } from "../_lib/ui_orchestrator_tools.ts";
import { executeFoundationTool } from "../_lib/foundation_tools.ts";
import { executeAdminTool } from "../_lib/admin_tools.ts";
import { startVisit, getVisit, endVisit } from "../_lib/visit_tools.ts";
import { checkAbuse } from "../_lib/safety_tools.ts";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-venue-id, x-correlation-id',
};

interface RouteConfig {
    toolName: string;
    executor: "foundation" | "guest" | "ui" | "admin" | "manager";
}

// Map URIs to internal tools
const ROUTE_MAP: Record<string, RouteConfig> = {
    // Foundation
    "/auth/whoami": { toolName: "auth.whoami", executor: "foundation" },
    "/auth/get-roles": { toolName: "auth.get_roles", executor: "foundation" },
    "/tenant/context": { toolName: "tenant.resolve_context", executor: "foundation" },

    // UI Orchestrator / Discovery
    "/venues/list": { toolName: "venues_list", executor: "ui" },
    "/venues/search": { toolName: "venues_search", executor: "ui" },
    "/venues/get": { toolName: "venues_get", executor: "ui" },
    "/menu/get": { toolName: "menu_get", executor: "ui" },

    // Guest Interaction
    "/menu/item-details": { toolName: "get_item_details", executor: "guest" },
    "/cart/add": { toolName: "add_to_cart", executor: "guest" },
    "/cart/view": { toolName: "view_cart", executor: "guest" },
    "/cart/remove": { toolName: "remove_from_cart", executor: "guest" },
    "/order/place": { toolName: "place_order", executor: "guest" },
    "/order/status": { toolName: "check_order_status", executor: "guest" },
    "/service/call": { toolName: "call_staff", executor: "guest" },

    // Intelligence
    "/guest/preferences": { toolName: "get_my_preferences", executor: "guest" },
    "/guest/recommendations": { toolName: "get_recommendations", executor: "guest" },

    // Visits
    "/visit/start": { toolName: "visit.start", executor: "visit" as any },
    "/visit/get": { toolName: "visit.get", executor: "visit" as any },
    "/visit/end": { toolName: "visit.end", executor: "visit" as any },

    // Safety
    "/safety/check": { toolName: "safety.abuse_check", executor: "safety" as any },

    // Admin / Manager
    "/admin/approvals/list": { toolName: "approval_list_pending", executor: "admin" },
    "/admin/approvals/resolve": { toolName: "approval_resolve", executor: "admin" },
    "/manager/orders/active": { toolName: "get_active_orders", executor: "manager" },
};

serve(async (req) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const url = new URL(req.url);
        // Remove /function-name prefix if behind proxy, or just use pathname
        // If local serving: http://localhost:54321/functions/v1/api/auth/whoami
        // path inside function should be /auth/whoami
        // Supabase strips /functions/v1/api part if we are careful, but often we get the full path.
        // We'll strip the function name prefix dynamically.
        const functionName = "api";
        let path = url.pathname;
        if (path.includes(`/${functionName}`)) {
            path = path.split(`/${functionName}`)[1];
        }

        // Default to handling trailing slash issues
        if (path.length > 1 && path.endsWith('/')) {
            path = path.slice(0, -1);
        }

        const route = ROUTE_MAP[path];

        if (!route) {
            return new Response(JSON.stringify({ error: `Route not found: ${path}` }), {
                status: 404,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        // Initialize Supabase Client
        const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
        const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
        const authHeader = req.headers.get('Authorization');

        const supabase = createClient(supabaseUrl, supabaseKey, {
            global: { headers: { Authorization: authHeader! } },
        });

        // Get User Context
        const { data: { user } } = await supabase.auth.getUser();
        const userId = user?.id;

        // Get other headers
        const venueId = req.headers.get('x-venue-id') || undefined;
        const correlationId = req.headers.get('x-correlation-id') || crypto.randomUUID();

        // Parse Body
        let body = {};
        if (req.method === "POST" || req.method === "PUT") {
            try {
                body = await req.json();
            } catch {
                // ignore empty body
            }
        } else {
            // Parse search params for GET
            const entries = url.searchParams.entries();
            body = Object.fromEntries(entries);
        }

        // Context object
        const context = {
            user_id: userId,
            venue_id: venueId,
            correlation_id: correlationId,
            session_id: correlationId // generic fallback
        };

        // Execute Tool
        let result;
        switch (route.executor) {
            case "foundation":
                result = await executeFoundationTool(route.toolName, body, context, supabase);
                break;
            case "guest":
                result = await executeGuestTool(route.toolName, body, context, supabase);
                break;
            case "ui":
                result = await executeUIOrchestratorTool(route.toolName, body, context, supabase);
                break;
            case "admin":
                result = await executeAdminTool(route.toolName, body, context, supabase);
                break;
            case "manager":
                result = await executeBarManagerTool(route.toolName, body, context, supabase);
                break;
            case "visit":
                if (route.toolName === "visit.start") result = await startVisit(body as any, context, supabase);
                else if (route.toolName === "visit.get") result = await getVisit(body as any, context, supabase);
                else if (route.toolName === "visit.end") result = await endVisit(body as any, supabase);
                else throw new Error("Unknown visit tool");
                break;
            case "safety":
                if (route.toolName === "safety.abuse_check") result = await checkAbuse(body as any, supabase);
                else throw new Error("Unknown safety tool");
                break;
            default:
                throw new Error(`Unknown executor: ${route.executor}`);
        }

        return new Response(JSON.stringify(result), {
            status: result.success ? 200 : 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

    } catch (error) {
        return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Internal Server Error' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
});
