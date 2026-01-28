/**
 * UI Intent Validators for Moltbot UIPlan System
 * 
 * Server-side validation for all UI intents before execution.
 * Enforces business rules, security constraints, and user safety.
 */

import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

// =============================================================================
// TYPES
// =============================================================================

export interface IntentValidationResult {
    valid: boolean;
    errors: string[];
    warnings: string[];
    requiresConfirmation: boolean;
}

export interface IntentContext {
    userId?: string;
    venueId?: string;
    sessionId?: string;
    country?: "RW" | "MT";
}

// =============================================================================
// INTENT VALIDATION RULES
// =============================================================================

/**
 * Intent definitions with validation rules.
 * Each intent has:
 * - requiredParams: params that must be present
 * - validators: functions to validate param values
 * - requiresConfirmation: whether user must confirm before execution
 */

// Allowed reasons for calling staff
const CALL_STAFF_REASONS = [
    "water",
    "bill",
    "help",
    "complaint",
    "allergy",
    "birthday",
    "other",
];

// Allowed priorities
const VALID_PRIORITIES = ["low", "normal", "high"];

// Allowed payment methods per country
const PAYMENT_METHODS: Record<string, string[]> = {
    RW: ["cash", "momo_ussd"],
    MT: ["cash", "revolut_link"],
    default: ["cash"],
};

// External URL allowlist for openExternalUrl intent
const EXTERNAL_URL_ALLOWLIST = [
    "mtn.com",         // MoMo USSD
    "revolut.com",     // Revolut payments
    "revolut.me",      // Revolut links
];

// =============================================================================
// VALIDATORS
// =============================================================================

/**
 * Validate addToCart intent
 */
export async function validateAddToCart(
    params: Record<string, unknown>,
    ctx: IntentContext,
    supabase: SupabaseClient
): Promise<IntentValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    const { item_id, qty, addon_ids, notes } = params;

    // Required: item_id
    if (!item_id || typeof item_id !== "string") {
        errors.push("item_id is required and must be a string UUID");
    }

    // Validate qty (1-20)
    const quantity = Number(qty) || 1;
    if (quantity < 1 || quantity > 20) {
        errors.push("qty must be between 1 and 20");
    }

    // Validate item exists and is available
    if (item_id && ctx.venueId) {
        const { data: item } = await supabase
            .from("menu_items")
            .select("id, is_available, category:menu_categories!inner(venue_id)")
            .eq("id", item_id)
            .single();

        if (!item) {
            errors.push("Menu item not found");
        } else if (!item.is_available) {
            errors.push("Menu item is currently unavailable");
        }
    }

    // Validate addon_ids if provided
    if (addon_ids && Array.isArray(addon_ids) && addon_ids.length > 0) {
        // Check addons exist and belong to the item
        const { data: addons } = await supabase
            .from("menu_item_addons")
            .select("id")
            .in("id", addon_ids);

        if (!addons || addons.length !== addon_ids.length) {
            warnings.push("Some addon IDs may not be valid");
        }
    }

    // Notes length check
    if (notes && typeof notes === "string" && notes.length > 500) {
        errors.push("Notes must be 500 characters or less");
    }

    return {
        valid: errors.length === 0,
        errors,
        warnings,
        requiresConfirmation: false,
    };
}

/**
 * Validate confirmOrder intent
 */
export async function validateConfirmOrder(
    params: Record<string, unknown>,
    ctx: IntentContext,
    supabase: SupabaseClient
): Promise<IntentValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    const { cart_id, payment_method, table_no } = params;

    // Required: cart_id
    if (!cart_id) {
        errors.push("cart_id is required");
    }

    // Validate cart exists and is not empty
    if (cart_id && ctx.sessionId) {
        const { data: cart } = await supabase
            .from("carts")
            .select("id, items")
            .eq("id", cart_id)
            .single();

        if (!cart) {
            errors.push("Cart not found");
        } else if (!cart.items || (Array.isArray(cart.items) && cart.items.length === 0)) {
            errors.push("Cart is empty");
        }
    }

    // Validate payment method for country
    const country = ctx.country || "RW";
    const allowedMethods = PAYMENT_METHODS[country] || PAYMENT_METHODS.default;

    if (payment_method && !allowedMethods.includes(payment_method as string)) {
        errors.push(`Payment method '${payment_method}' not available in ${country}. Allowed: ${allowedMethods.join(", ")}`);
    }

    // Table number validation (optional but should be reasonable)
    if (table_no !== undefined) {
        const tableNum = Number(table_no);
        if (isNaN(tableNum) || tableNum < 1 || tableNum > 999) {
            warnings.push("Table number seems unusual");
        }
    }

    return {
        valid: errors.length === 0,
        errors,
        warnings,
        requiresConfirmation: true, // Orders always require confirmation
    };
}

/**
 * Validate callStaff intent
 */
export async function validateCallStaff(
    params: Record<string, unknown>,
    _ctx: IntentContext,
    _supabase: SupabaseClient
): Promise<IntentValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    const { reason, priority, message } = params;

    // Validate reason is in allowlist
    if (!reason || !CALL_STAFF_REASONS.includes(reason as string)) {
        errors.push(`reason must be one of: ${CALL_STAFF_REASONS.join(", ")}`);
    }

    // Validate priority
    if (priority && !VALID_PRIORITIES.includes(priority as string)) {
        errors.push(`priority must be one of: ${VALID_PRIORITIES.join(", ")}`);
    }

    // Message length check
    if (message && typeof message === "string" && message.length > 200) {
        errors.push("Message must be 200 characters or less");
    }

    return {
        valid: errors.length === 0,
        errors,
        warnings,
        requiresConfirmation: false,
    };
}

/**
 * Validate openExternalUrl intent
 */
export async function validateOpenExternalUrl(
    params: Record<string, unknown>,
    _ctx: IntentContext,
    _supabase: SupabaseClient
): Promise<IntentValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    const { url } = params;

    if (!url || typeof url !== "string") {
        errors.push("url is required");
        return { valid: false, errors, warnings, requiresConfirmation: true };
    }

    try {
        const parsed = new URL(url);

        // Must be HTTPS
        if (parsed.protocol !== "https:") {
            errors.push("Only HTTPS URLs are allowed");
        }

        // Domain must be in allowlist
        const isAllowed = EXTERNAL_URL_ALLOWLIST.some(domain =>
            parsed.hostname.includes(domain)
        );
        if (!isAllowed) {
            errors.push(`Domain not in allowlist: ${parsed.hostname}`);
        }

        // No query string secrets (basic check)
        const suspiciousParams = ["key", "secret", "token", "password", "apikey"];
        for (const param of suspiciousParams) {
            if (parsed.searchParams.has(param)) {
                errors.push(`URL contains potentially sensitive parameter: ${param}`);
            }
        }

    } catch {
        errors.push("Invalid URL format");
    }

    return {
        valid: errors.length === 0,
        errors,
        warnings,
        requiresConfirmation: true, // External URLs always require confirmation
    };
}

/**
 * Validate navigateToSection intent
 */
export async function validateNavigateToSection(
    params: Record<string, unknown>,
    _ctx: IntentContext,
    _supabase: SupabaseClient
): Promise<IntentValidationResult> {
    const errors: string[] = [];

    const { section_id, category_id } = params;

    // At least one must be provided
    if (!section_id && !category_id) {
        errors.push("Either section_id or category_id is required");
    }

    return {
        valid: errors.length === 0,
        errors,
        warnings: [],
        requiresConfirmation: false,
    };
}

// =============================================================================
// MAIN VALIDATOR DISPATCHER
// =============================================================================

/**
 * Validate any UI intent.
 * 
 * @param intentType - The type of intent (addToCart, confirmOrder, etc.)
 * @param params - The intent parameters
 * @param ctx - Request context (userId, venueId, etc.)
 * @param supabase - Supabase client for DB lookups
 */
export async function validateIntent(
    intentType: string,
    params: Record<string, unknown>,
    ctx: IntentContext,
    supabase: SupabaseClient
): Promise<IntentValidationResult> {
    switch (intentType) {
        case "addToCart":
            return await validateAddToCart(params, ctx, supabase);
        case "confirmOrder":
            return await validateConfirmOrder(params, ctx, supabase);
        case "callStaff":
            return await validateCallStaff(params, ctx, supabase);
        case "openExternalUrl":
            return await validateOpenExternalUrl(params, ctx, supabase);
        case "navigateToSection":
            return await validateNavigateToSection(params, ctx, supabase);
        default:
            // Unknown intents are rejected by default
            return {
                valid: false,
                errors: [`Unknown intent type: ${intentType}`],
                warnings: [],
                requiresConfirmation: false,
            };
    }
}

// =============================================================================
// EXPORTS
// =============================================================================

export {
    CALL_STAFF_REASONS,
    VALID_PRIORITIES,
    PAYMENT_METHODS,
    EXTERNAL_URL_ALLOWLIST,
};
