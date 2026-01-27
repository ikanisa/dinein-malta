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
const orderMarkPaidSchema = z.object({
  order_id: z.string().uuid(),
});

type OrderMarkPaidInput = z.infer<typeof orderMarkPaidSchema>;

const RATE_LIMIT: RateLimitConfig = {
  maxRequests: 60,
  window: "1 hour",
  endpoint: "order_mark_paid",
};

Deno.serve(async (req) => {
  const startTime = Date.now();
  const requestId = getOrCreateRequestId(req);
  const logger = createLogger({ requestId, action: "order_mark_paid" });

  // Handle CORS preflight
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  if (req.method !== "POST") {
    return errorResponse("Method not allowed", 405);
  }

  try {
    logger.requestStart(req.method, "/order_mark_paid");

    const supabaseAdmin = createAdminClient();

    // Authenticate user
    const authResult = await requireAuth(req, logger);
    if (authResult instanceof Response) return authResult;
    const { user, supabaseUser } = authResult;

    // Parse + validate input
    const body = await req.json();
    const parsed = orderMarkPaidSchema.safeParse(body);
    if (!parsed.success) {
      logger.warn("Validation failed", { errors: parsed.error.issues });
      return errorResponse("Invalid request data", 400, parsed.error.issues);
    }

    const input: OrderMarkPaidInput = parsed.data;
    logger.info("Processing mark order paid", { orderId: input.order_id });

    // Rate limiting
    const rateLimitResult = await checkRateLimit(supabaseAdmin, user.id, RATE_LIMIT, logger);
    if (rateLimitResult instanceof Response) return rateLimitResult;

    // Create audit logger
    const audit = createAuditLogger(supabaseAdmin, user.id, requestId, logger);

    // ========================================================================
    // STEP 1: Fetch order to verify vendor membership and current status
    // ========================================================================
    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .select("id, venue_id, payment_status")
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
    // STEP 3: Check idempotency - if already paid, return success
    // ========================================================================
    if (order.payment_status === "paid") {
      logger.info("Order already paid (idempotent)", { orderId: input.order_id });
      return jsonResponse({
        success: true,
        requestId,
        order_id: input.order_id,
        message: "Order is already marked as paid",
        idempotent: true,
      });
    }

    // ========================================================================
    // STEP 4: Update payment status
    // ========================================================================
    const { data: updatedOrder, error: updateError } = await supabaseAdmin
      .from("orders")
      .update({ payment_status: "paid" })
      .eq("id", input.order_id)
      .select()
      .single();

    if (updateError || !updatedOrder) {
      logger.error("Failed to mark order as paid", { error: updateError?.message });
      return errorResponse("Failed to update payment status", 500, updateError?.message);
    }

    // ========================================================================
    // STEP 5: Write audit log
    // ========================================================================
    await audit.log(AuditAction.ORDER_MARK_PAID, EntityType.ORDER, order.id, {
      vendorId: order.venue_id,
      previousStatus: order.payment_status,
      newStatus: "paid",
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
    logger.error("Order mark paid error", { error: String(error), durationMs });
    return errorResponse("Internal server error", 500, String(error));
  }
});
