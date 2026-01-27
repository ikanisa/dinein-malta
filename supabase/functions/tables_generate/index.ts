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
const tablesGenerateSchema = z.object({
  venue_id: z.string().uuid(),
  count: z.number().int().positive().optional(),
  table_numbers: z.array(z.number().int().positive()).optional(),
  start_number: z.number().int().positive().optional(),
}).refine((data) => {
  return (data.count && data.count > 0) || (data.table_numbers && data.table_numbers.length > 0);
}, { message: "Must provide either count or table_numbers array" });

type TablesGenerateInput = z.infer<typeof tablesGenerateSchema>;

const RATE_LIMIT: RateLimitConfig = {
  maxRequests: 20,
  window: "1 hour",
  endpoint: "tables_generate",
};

Deno.serve(async (req) => {
  const startTime = Date.now();
  const requestId = getOrCreateRequestId(req);
  const logger = createLogger({ requestId, action: "tables_generate" });

  // Handle CORS preflight
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  if (req.method !== "POST") {
    return errorResponse("Method not allowed", 405);
  }

  try {
    logger.requestStart(req.method, "/tables_generate");

    const supabaseAdmin = createAdminClient();

    // Authenticate user
    const authResult = await requireAuth(req, logger);
    if (authResult instanceof Response) return authResult;
    const { user, supabaseUser } = authResult;

    // Parse + validate input
    const body = await req.json();
    const parsed = tablesGenerateSchema.safeParse(body);
    if (!parsed.success) {
      logger.warn("Validation failed", { errors: parsed.error.issues });
      return errorResponse("Invalid request data", 400, parsed.error.issues);
    }

    const input: TablesGenerateInput = parsed.data;
    logger.info("Processing tables generate", { vendorId: input.venue_id, count: input.count });

    // Rate limiting
    const rateLimitResult = await checkRateLimit(supabaseAdmin, user.id, RATE_LIMIT, logger);
    if (rateLimitResult instanceof Response) return rateLimitResult;

    // Create audit logger
    const audit = createAuditLogger(supabaseAdmin, user.id, requestId, logger);

    // ========================================================================
    // STEP 1: Verify user is vendor member or admin
    // ========================================================================
    const rbacResult = await requireVendorOrAdmin(
      supabaseAdmin,
      supabaseUser,
      input.venue_id,
      user.id,
      logger
    );
    if (rbacResult instanceof Response) return rbacResult;

    // ========================================================================
    // STEP 2: Verify vendor exists
    // ========================================================================
    const { data: vendor } = await supabaseAdmin
      .from("venues")
      .select("id")
      .eq("id", input.venue_id)
      .single();

    if (!vendor) {
      logger.warn("Vendor not found", { vendorId: input.venue_id });
      return errorResponse("Vendor not found", 404);
    }

    // ========================================================================
    // STEP 3: Determine table numbers to create
    // ========================================================================
    let tableNumbers: number[] = [];
    if (input.table_numbers && input.table_numbers.length > 0) {
      tableNumbers = input.table_numbers;
    } else if (input.count && input.count > 0) {
      const start = input.start_number || 1;
      tableNumbers = Array.from({ length: input.count }, (_, i) => start + i);
    } else {
      return errorResponse("Must provide either count or table_numbers array", 400);
    }

    if (tableNumbers.some((n) => n <= 0)) {
      return errorResponse("Table numbers must be positive integers", 400);
    }

    // ========================================================================
    // STEP 4: Check for existing table numbers
    // ========================================================================
    const { data: existingTables } = await supabaseAdmin
      .from("tables")
      .select("table_number")
      .eq("venue_id", input.venue_id)
      .in("table_number", tableNumbers);

    if (existingTables && existingTables.length > 0) {
      const existingNumbers = existingTables.map((t) => t.table_number);
      logger.warn("Table numbers already exist", { existingNumbers });
      return errorResponse("Table numbers already exist", 400, { existing: existingNumbers });
    }

    // ========================================================================
    // STEP 5: Generate secure public codes and insert tables
    // ========================================================================
    const generatePublicCode = (): string => {
      const random = Math.random().toString(36).substring(2, 10).toUpperCase();
      return `TBL-${random}`;
    };

    const tablesToInsert = tableNumbers.map((tableNumber) => ({
      venue_id: input.venue_id,
      table_number: tableNumber,
      label: `Table ${tableNumber}`,
      public_code: generatePublicCode(),
      is_active: true,
    }));

    const { data: createdTables, error: insertError } = await supabaseAdmin
      .from("tables")
      .insert(tablesToInsert)
      .select();

    if (insertError || !createdTables) {
      logger.error("Failed to create tables", { error: insertError?.message });
      return errorResponse("Failed to create tables", 500, insertError?.message);
    }

    // ========================================================================
    // STEP 6: Write audit log
    // ========================================================================
    await audit.log(AuditAction.TABLES_GENERATE, EntityType.TABLE, null, {
      vendorId: input.venue_id,
      tableNumbers,
      count: createdTables.length,
    });

    // ========================================================================
    // STEP 7: Return created tables
    // ========================================================================
    const durationMs = Date.now() - startTime;
    logger.requestEnd(201, durationMs);

    return jsonResponse({
      success: true,
      requestId,
      tables: createdTables,
      count: createdTables.length,
    }, 201);
  } catch (error) {
    const durationMs = Date.now() - startTime;
    logger.error("Tables generate error", { error: String(error), durationMs });
    return errorResponse("Internal server error", 500, String(error));
  }
});
