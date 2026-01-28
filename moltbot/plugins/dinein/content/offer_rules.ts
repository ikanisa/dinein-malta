/**
 * Offer Rules
 * 
 * Discount rule model, constraints, and simulation.
 */

import { DiscountType } from "./taxonomy.ts";

export interface OfferRule {
    offerId: string;
    type: DiscountType;
    value: number; // percent or fixed amount
    window: {
        startsAt: string; // ISO8601
        endsAt: string;
    };
    eligibility: {
        guestSegments?: string[];
        daysOfWeek?: number[]; // 0-6
        timeWindow?: { start: string; end: string }; // HH:mm
        minSpend?: number;
        includedCategories?: string[];
        excludedItems?: string[];
    };
    caps: {
        maxDiscountAmount?: number;
        maxUsesPerGuest?: number;
        maxTotalUses?: number;
    };
    allowStackingWithOthers: boolean;
}

export interface CartItem {
    itemId: string;
    categoryId: string;
    price: number;
    quantity: number;
}

export interface SimulationResult {
    valid: boolean;
    discountAmount: number;
    finalTotal: number;
    errors: string[];
    warnings: string[];
}

/**
 * Simulate applying an offer to a cart.
 */
export function simulateOffer(
    offer: OfferRule,
    cart: CartItem[],
    context: {
        currentTime: Date;
        timezone: string;
        guestSegment?: string;
    }
): SimulationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    let discountAmount = 0;

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Check time window
    const now = context.currentTime;
    const startsAt = new Date(offer.window.startsAt);
    const endsAt = new Date(offer.window.endsAt);

    if (now < startsAt || now > endsAt) {
        errors.push("Offer not active at current time");
        return { valid: false, discountAmount: 0, finalTotal: subtotal, errors, warnings };
    }

    // Check min spend
    if (offer.eligibility.minSpend && subtotal < offer.eligibility.minSpend) {
        errors.push(`Minimum spend of ${offer.eligibility.minSpend} not met`);
        return { valid: false, discountAmount: 0, finalTotal: subtotal, errors, warnings };
    }

    // Calculate discount based on type
    switch (offer.type) {
        case "percent_off":
            discountAmount = subtotal * (offer.value / 100);
            break;
        case "fixed_amount_off":
            discountAmount = offer.value;
            break;
        case "happy_hour_pricing":
            discountAmount = subtotal * (offer.value / 100);
            break;
        default:
            warnings.push(`Discount type ${offer.type} simulation not fully implemented`);
    }

    // Apply max discount cap
    if (offer.caps.maxDiscountAmount && discountAmount > offer.caps.maxDiscountAmount) {
        discountAmount = offer.caps.maxDiscountAmount;
        warnings.push(`Discount capped at ${offer.caps.maxDiscountAmount}`);
    }

    // Constraint: Discount cannot exceed subtotal
    if (discountAmount > subtotal) {
        errors.push("Discount cannot exceed subtotal");
        discountAmount = subtotal;
    }

    // Constraint: No negative totals
    const finalTotal = Math.max(0, subtotal - discountAmount);

    return {
        valid: errors.length === 0,
        discountAmount,
        finalTotal,
        errors,
        warnings
    };
}

/**
 * Check if two offers can be stacked.
 */
export function canStackOffers(offer1: OfferRule, offer2: OfferRule): boolean {
    return offer1.allowStackingWithOthers && offer2.allowStackingWithOthers;
}

/**
 * Validate offer rule configuration.
 */
export function validateOfferRule(offer: OfferRule): string[] {
    const errors: string[] = [];

    if (offer.value < 0) {
        errors.push("Discount value cannot be negative");
    }

    if (offer.type === "percent_off" && offer.value > 100) {
        errors.push("Percent discount cannot exceed 100%");
    }

    if (new Date(offer.window.startsAt) >= new Date(offer.window.endsAt)) {
        errors.push("Offer start time must be before end time");
    }

    return errors;
}
