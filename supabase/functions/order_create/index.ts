import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import {
  handleCors,
  jsonResponse,
  errorResponse,
  createAdminClient,
  optionalAuth,
  createLogger,
  getOrCreateRequestId,
  createAuditLogger,
  AuditAction,
  EntityType,
} from "../_lib/mod.ts";

// --- Input Validation Schema ---
const orderItemSchema = z.object({
  menu_item_id: z.string().uuid(),
  qty: z.number().int().positive(),
  modifiers_json: z.unknown().optional(),
});

const createOrderSchema = z.object({
  vendor_id: z.string().uuid(),
  table_public_code: z.string().min(1),
  items: z.array(orderItemSchema).min(1),
  notes: z.string().max(1000).optional(),
});

type CreateOrderInput = z.infer<typeof createOrderSchema>;

Deno.serve(async (req) => {
  const startTime = Date.now();
  const requestId = getOrCreateRequestId(req);
  const logger = createLogger({ requestId, action: "order_create" });

  // Handle CORS preflight
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  if (req.method !== "POST") {
    return errorResponse("Method not allowed", 405);
  }

  try {
    logger.requestStart(req.method, "/order_create");

    // Initialize admin client
    const supabaseAdmin = createAdminClient();

    // Optional authentication - works for both authenticated and public users
    const authResult = await optionalAuth(req, logger);
    const userId = authResult?.user?.id || null;
    logger.info("Auth check", { authenticated: !!userId });

    // Parse + validate input
    const body = await req.json();
    const parsed = createOrderSchema.safeParse(body);
    if (!parsed.success) {
      logger.warn("Validation failed", { errors: parsed.error.issues });
      return errorResponse("Invalid request data", 400, parsed.error.issues);
    }

    const input: CreateOrderInput = parsed.data;
    logger.info("Processing order", { vendorId: input.vendor_id, itemCount: input.items.length });

    // Create audit logger for this request (use 'anonymous' for public orders)
    const audit = createAuditLogger(supabaseAdmin, userId || 'anonymous', requestId, logger);

    // ========================================================================
    // STEP 1: Validate vendor exists and is active
    // ========================================================================
    const { data: vendor, error: vendorError } = await supabaseAdmin
      .from("vendors")
      .select("id, status")
      .eq("id", input.vendor_id)
      .single();

    if (vendorError || !vendor) {
      logger.warn("Vendor not found", { vendorId: input.vendor_id });
      return errorResponse("Vendor not found", 404);
    }

    if (vendor.status !== "active") {
      logger.warn("Vendor not active", { vendorId: input.vendor_id, status: vendor.status });
      return errorResponse("Vendor is not active", 400);
    }

    // ========================================================================
    // STEP 2: Validate table belongs to vendor and is active
    // ========================================================================
    const rawTableInput = input.table_public_code.trim();
    const normalizedTableCode = rawTableInput.toUpperCase();

    let table: { id: string; vendor_id: string; table_number: number; label: string } | null = null;

    const { data: tableByCode } = await supabaseAdmin
      .from("tables")
      .select("id, vendor_id, table_number, label")
      .eq("public_code", normalizedTableCode)
      .eq("vendor_id", input.vendor_id)
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
            .select("id, vendor_id, table_number, label")
            .eq("table_number", tableNumber)
            .eq("vendor_id", input.vendor_id)
            .eq("is_active", true)
            .single();

          if (tableByNumber) {
            table = tableByNumber;
          }
        }
      }
    }

    if (!table) {
      logger.warn("Table not found", { tableCode: rawTableInput, vendorId: input.vendor_id });
      return errorResponse("Table not found or inactive", 404);
    }

    // ========================================================================
    // STEP 3: Fetch menu items and validate availability
    // ========================================================================
    const menuItemIds = input.items.map((item) => item.menu_item_id);
    const { data: menuItems, error: menuItemsError } = await supabaseAdmin
      .from("menu_items")
      .select("id, name, price, is_available, vendor_id")
      .in("id", menuItemIds)
      .eq("vendor_id", input.vendor_id);

    if (menuItemsError || !menuItems || menuItems.length === 0) {
      logger.warn("Menu items not found", { menuItemIds });
      return errorResponse("Menu items not found", 404);
    }

    // Validate all items belong to vendor and are available
    const menuItemsMap = new Map(menuItems.map((item) => [item.id, item]));
    for (const inputItem of input.items) {
      const menuItem = menuItemsMap.get(inputItem.menu_item_id);
      if (!menuItem) {
        return errorResponse(`Menu item ${inputItem.menu_item_id} not found`, 404);
      }
      if (!menuItem.is_available) {
        return errorResponse(`Menu item ${menuItem.name} is not available`, 400);
      }
      if (inputItem.qty <= 0) {
        return errorResponse(`Invalid quantity for ${menuItem.name}`, 400);
      }
    }

    // ========================================================================
    // STEP 4: Compute total amount server-side
    // ========================================================================
    let totalAmount = 0;
    const orderItemsData = input.items.map((inputItem) => {
      const menuItem = menuItemsMap.get(inputItem.menu_item_id)!;
      const itemTotal = Number(menuItem.price) * inputItem.qty;
      totalAmount += itemTotal;

      return {
        name_snapshot: menuItem.name,
        price_snapshot: menuItem.price,
        qty: inputItem.qty,
        modifiers_json: inputItem.modifiers_json || null,
      };
    });

    totalAmount = Math.round(totalAmount * 100) / 100;

    // ========================================================================
    // STEP 5: Generate unique order code
    // ========================================================================
    const generateOrderCode = () => {
      const timestamp = Date.now().toString(36).toUpperCase().slice(-4);
      const random = Math.random().toString(36).substring(2, 6).toUpperCase();
      return `DIN-${timestamp}-${random}`;
    };

    let orderCode = generateOrderCode();
    let attempts = 0;
    let codeExists = true;

    while (codeExists && attempts < 10) {
      const { data: existing } = await supabaseAdmin
        .from("orders")
        .select("id")
        .eq("vendor_id", input.vendor_id)
        .eq("order_code", orderCode)
        .single();

      if (!existing) {
        codeExists = false;
      } else {
        orderCode = generateOrderCode();
        attempts++;
      }
    }

    if (codeExists) {
      logger.error("Failed to generate unique order code after retries");
      return errorResponse("Failed to generate unique order code", 500);
    }

    // ========================================================================
    // STEP 6: Insert order and order items
    // ========================================================================
    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .insert({
        vendor_id: input.vendor_id,
        table_id: table.id,
        client_auth_user_id: userId || null,
        order_code: orderCode,
        status: "received",
        payment_status: "unpaid",
        total_amount: totalAmount,
        currency: "EUR",
        notes: input.notes || null,
      })
      .select()
      .single();

    if (orderError || !order) {
      logger.error("Failed to create order", { error: orderError?.message });
      return errorResponse("Failed to create order", 500, orderError?.message);
    }

    // Insert order items
    const orderItemsToInsert = orderItemsData.map((item) => ({
      order_id: order.id,
      ...item,
    }));

    const { data: insertedItems, error: itemsError } = await supabaseAdmin
      .from("order_items")
      .insert(orderItemsToInsert)
      .select();

    if (itemsError || !insertedItems) {
      logger.error("Failed to insert order items, cleaning up order", { error: itemsError?.message });
      await supabaseAdmin.from("orders").delete().eq("id", order.id);
      return errorResponse("Failed to create order items", 500, itemsError?.message);
    }

    // ========================================================================
    // STEP 7: Write audit log
    // ========================================================================
    await audit.log(AuditAction.ORDER_CREATE, EntityType.ORDER, order.id, {
      vendorId: input.vendor_id,
      tableId: table.id,
      orderCode,
      totalAmount,
      itemCount: input.items.length,
    });

    // ========================================================================
    // STEP 8: Return created order with items
    // ========================================================================
    const durationMs = Date.now() - startTime;
    logger.requestEnd(201, durationMs);

    return jsonResponse({
      success: true,
      requestId,
      order: {
        ...order,
        items: insertedItems,
      },
    }, 201);
  } catch (error) {
    const durationMs = Date.now() - startTime;
    logger.error("Order creation error", { error: String(error), durationMs });
    return errorResponse("Internal server error", 500, String(error));
  }
});
