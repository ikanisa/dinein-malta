
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import {
  handleCors,
  jsonResponse,
  errorResponse,
  createAdminClient,
  createLogger,
  getOrCreateRequestId,
} from "../_lib/mod.ts";

const ringBellSchema = z.object({
  venue_id: z.string().uuid(),
  table_number: z.string().min(1),
  session_id: z.string().min(1),
});

Deno.serve(async (req) => {
  const startTime = Date.now();
  const requestId = getOrCreateRequestId(req);
  const logger = createLogger({ requestId, action: "ring_bell" });

  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  if (req.method !== "POST") {
    return errorResponse("Method not allowed", 405);
  }

  try {
    logger.requestStart(req.method, "/ring_bell");
    const supabaseAdmin = createAdminClient();

    const body = await req.json();
    const parsed = ringBellSchema.safeParse(body);
    if (!parsed.success) {
      logger.warn("Validation failed", { errors: parsed.error.issues });
      return errorResponse("Invalid request data", 400, parsed.error.issues);
    }

    const input = parsed.data;
    const clientIp = req.headers.get("x-forwarded-for") || "unknown";

    const { data: venue, error: venueError } = await supabaseAdmin
      .from("venues")
      .select("id, status")
      .eq("id", input.venue_id)
      .single();

    if (venueError || !venue) {
      logger.warn("Venue not found", { venueId: input.venue_id });
      return errorResponse("Venue not found", 404);
    }

    if (venue.status !== "active") {
      logger.warn("Venue not active", { venueId: input.venue_id, status: venue.status });
      return errorResponse("Venue is not active", 400);
    }

    const rawTableInput = input.table_number.trim();
    const normalizedTableCode = rawTableInput.toUpperCase();

    let table: { id: string; venue_id: string; table_number: number } | null = null;

    const { data: tableByCode } = await supabaseAdmin
      .from("tables")
      .select("id, venue_id, table_number")
      .eq("public_code", normalizedTableCode)
      .eq("venue_id", input.venue_id)
      .eq("is_active", true)
      .single();

    if (tableByCode) {
      table = tableByCode;
    } else {
      const isLikelyPublicCode = /^TBL-[A-Z0-9]+$/i.test(rawTableInput);
      if (!isLikelyPublicCode) {
        const digitsMatch = rawTableInput.match(/\d+/);
        const tableNumber = digitsMatch ? Number.parseInt(digitsMatch[0], 10) : NaN;
        if (!Number.isNaN(tableNumber)) {
          const { data: tableByNumber } = await supabaseAdmin
            .from("tables")
            .select("id, venue_id, table_number")
            .eq("table_number", tableNumber)
            .eq("venue_id", input.venue_id)
            .eq("is_active", true)
            .single();

          if (tableByNumber) {
            table = tableByNumber;
          }
        }
      }
    }

    if (!table) {
      logger.warn("Table not found", { tableInput: rawTableInput, venueId: input.venue_id });
      return errorResponse("Table not found or inactive", 404);
    }

    const now = new Date();
    const { count } = await supabaseAdmin
      .from("security_audit_log")
      .select("id", { count: "exact", head: true })
      .eq("event_type", "ring_bell")
      .or(`session_hash.eq.${input.session_id},ip_address.eq.${clientIp}`)
      .gte("created_at", new Date(now.getTime() - 60000).toISOString());

    if (count && count >= 2) {
      await supabaseAdmin.from("security_audit_log").insert({
        event_type: "ring_bell",
        session_hash: input.session_id,
        venue_id: input.venue_id,
        status: "BLOCKED",
        reason: "Rate Limit",
        ip_address: clientIp,
        metadata: { table_no: table.table_number.toString() },
      });
      return errorResponse("Waiter notified. Please wait.", 429);
    }

    const { error: insertError } = await supabaseAdmin
      .from("service_requests")
      .insert({
        venue_id: input.venue_id,
        table_no: table.table_number.toString(),
        status: "pending",
      });

    if (insertError) {
      logger.error("Failed to create service request", { error: insertError.message });
      return errorResponse("Failed to ring bell", 500, insertError.message);
    }

    await supabaseAdmin.from("security_audit_log").insert({
      event_type: "ring_bell",
      session_hash: input.session_id,
      venue_id: input.venue_id,
      status: "SUCCESS",
      ip_address: clientIp,
      metadata: { table_no: table.table_number.toString() },
    });

    const durationMs = Date.now() - startTime;
    logger.requestEnd(200, durationMs);

    return jsonResponse({ success: true, requestId }, 200);
  } catch (error) {
    const durationMs = Date.now() - startTime;
    logger.error("Ring bell error", { error: String(error), durationMs });
    return errorResponse("Internal server error", 500, String(error));
  }
});
