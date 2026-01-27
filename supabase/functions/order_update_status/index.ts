import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import {
  handleCors,
  jsonResponse,
  errorResponse,
  createAdminClient,
  requireAuth,
  checkRateLimit,
  requireVendorOrAdmin,
  createLogger,
  getOrCreateRequestId,
  createAuditLogger,
  AuditAction,
  EntityType,
  RateLimitConfig,
} from "../_lib/mod.ts";

// --- Input Validation Schema ---
const orderUpdateSchema = z.object({
  order_id: z.string().uuid(),
  status: z.enum(["served", "cancelled"]),
});

type OrderUpdateStatusInput = z.infer<typeof orderUpdateSchema>;

const RATE_LIMIT: RateLimitConfig = {
  maxRequests: 60,
  window: "1 hour",
  endpoint: "order_update_status",
};

Deno.serve(async (req) => {
  const startTime = Date.now();
  const requestId = getOrCreateRequestId(req);
  const logger = createLogger({ requestId, action: "order_update_status" });

  // Handle CORS preflight
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  if (req.method !== "POST") {
    return errorResponse("Method not allowed", 405);
  }

  try {
    logger.requestStart(req.method, "/order_update_status");

    const supabaseAdmin = createAdminClient();

    // Authenticate user
    const authResult = await requireAuth(req, logger);
    if (authResult instanceof Response) return authResult;
    const { user, supabaseUser } = authResult;

    // Parse + validate input
    const body = await req.json();
    const parsed = orderUpdateSchema.safeParse(body);
    if (!parsed.success) {
      logger.warn("Validation failed", { errors: parsed.error.issues });
      return errorResponse("Invalid request data", 400, parsed.error.issues);
    }

    const input: OrderUpdateStatusInput = parsed.data;
    logger.info("Processing order status update", { orderId: input.order_id, newStatus: input.status });

    // Rate limiting
    const rateLimitResult = await checkRateLimit(supabaseAdmin, user.id, RATE_LIMIT, logger);
    if (rateLimitResult instanceof Response) return rateLimitResult;

    // Create audit logger
    const audit = createAuditLogger(supabaseAdmin, user.id, requestId, logger);

    // ========================================================================
    // STEP 1: Fetch order to verify vendor membership
    // ========================================================================
    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .select("id, venue_id, status")
      .eq("id", input.order_id)
      .single();

    if (orderError || !order) {
      logger.warn("Order not found", { orderId: input.order_id });
      return errorResponse("Order not found", 404);
    }

    // ========================================================================
    // STEP 2: Verify user is vendor member or admin
    // ========================================================================
    const rbacResult = await requireVendorOrAdmin(
      supabaseAdmin,
      supabaseUser,
      order.venue_id,
      user.id,
      logger
    );
    if (rbacResult instanceof Response) return rbacResult;

    // ========================================================================
    // STEP 3: Validate status transition
    // ========================================================================
    if (order.status !== "received") {
      logger.warn("Invalid status transition", { currentStatus: order.status, newStatus: input.status });
      return errorResponse(
        `Invalid status transition. Order is currently '${order.status}', can only transition from 'received'`,
        400
      );
    }

    // ========================================================================
    // STEP 4: Update order status
    // ========================================================================
    const { data: updatedOrder, error: updateError } = await supabaseAdmin
      .from("orders")
      .update({ status: input.status })
      .eq("id", input.order_id)
      .select()
      .single();

    if (updateError || !updatedOrder) {
      logger.error("Failed to update order status", { error: updateError?.message });
      return errorResponse("Failed to update order status", 500, updateError?.message);
    }

    // ========================================================================
    // STEP 5: Write audit log
    // ========================================================================
    await audit.log(AuditAction.ORDER_STATUS_UPDATE, EntityType.ORDER, order.id, {
      vendorId: order.venue_id,
      previousStatus: order.status,
      newStatus: input.status,
    });

    // ========================================================================
    // STEP 6: Return updated order
    // ========================================================================
    const durationMs = Date.now() - startTime;
    logger.requestEnd(200, durationMs);

    return jsonResponse({
      success: true,
      requestId,
      order: updatedOrder,
    });
  } catch (error) {
    const durationMs = Date.now() - startTime;
    logger.error("Order status update error", { error: String(error), durationMs });
    return errorResponse("Internal server error", 500, String(error));
  }
});
