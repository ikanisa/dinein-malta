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

const orderStatusSchema = z.object({
  order_id: z.string().uuid(),
  order_code: z.string().min(1),
});

Deno.serve(async (req) => {
  const startTime = Date.now();
  const requestId = getOrCreateRequestId(req);
  const logger = createLogger({ requestId, action: "order_status" });

  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  if (req.method !== "POST") {
    return errorResponse("Method not allowed", 405);
  }

  try {
    logger.requestStart(req.method, "/order_status");
    const supabaseAdmin = createAdminClient();

    const body = await req.json();
    const parsed = orderStatusSchema.safeParse(body);
    if (!parsed.success) {
      logger.warn("Validation failed", { errors: parsed.error.issues });
      return errorResponse("Invalid request data", 400, parsed.error.issues);
    }

    const { order_id, order_code } = parsed.data;
    const { data: order, error } = await supabaseAdmin
      .from("orders")
      .select("id, status, created_at, total_amount, currency, order_code")
      .eq("id", order_id)
      .single();

    if (error || !order) {
      logger.warn("Order not found", { orderId: order_id });
      return errorResponse("Order not found", 404);
    }

    if (order_code && order.order_code !== order_code) {
      logger.warn("Order code mismatch", { orderId: order_id });
      return errorResponse("Order not found", 404);
    }

    const durationMs = Date.now() - startTime;
    logger.requestEnd(200, durationMs);

    return jsonResponse({
      success: true,
      requestId,
      order,
    });
  } catch (error) {
    const durationMs = Date.now() - startTime;
    logger.error("Order status error", { error: String(error), durationMs });
    return errorResponse("Internal server error", 500, String(error));
  }
});
