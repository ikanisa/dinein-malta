/**
 * Input validation schemas using Zod
 * Ensures all user inputs are validated before submission
 */

import { z } from 'zod';

/**
 * Order validation schema
 */
export const orderSchema = z.object({
  vendor_id: z.string().min(1, 'Vendor ID is required'), // Can be UUID or slug
  table_id: z.string().uuid().optional(),
  table_code: z.string().min(1, 'Table code is required').max(50, 'Table code too long'),
  items: z.array(
    z.object({
      menu_item_id: z.string().min(1, 'Menu item ID is required'), // Can be UUID or other format
      quantity: z.number().int('Quantity must be a whole number').positive('Quantity must be positive').max(99, 'Quantity too high'),
      special_requests: z.string().max(500, 'Special requests too long').optional(),
      selectedOptions: z.array(z.string()).optional(),
    })
  ).min(1, 'Order must contain at least one item').max(50, 'Too many items in order'),
  total: z.number().positive('Total must be positive').max(10000, 'Total too high'),
  customer_note: z.string().max(500, 'Note too long').optional(),
});

export type OrderInput = z.infer<typeof orderSchema>;

/**
 * Special requests validation
 */
export const specialRequestsSchema = z.string()
  .max(500, 'Special requests cannot exceed 500 characters')
  .refine(
    (val) => {
      // Remove HTML tags and check length
      const text = val.replace(/<[^>]*>/g, '');
      return text.length <= 500;
    },
    { message: 'Special requests contain invalid characters' }
  )
  .optional();

/**
 * Table code validation
 */
export const tableCodeSchema = z.string()
  .min(1, 'Table code is required')
  .max(50, 'Table code too long')
  .regex(/^[A-Za-z0-9\-_]+$/, 'Table code can only contain letters, numbers, hyphens, and underscores');

/**
 * Validate order input
 */
export function validateOrder(input: unknown): { success: true; data: OrderInput } | { success: false; error: z.ZodError } {
  const result = orderSchema.safeParse(input);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: result.error };
}

/**
 * Sanitize special requests input
 */
export function sanitizeSpecialRequests(input: string): string {
  // Remove script tags and other potentially dangerous content
  return input
    .trim()
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]+>/g, '') // Remove all HTML tags
    .substring(0, 500); // Enforce max length
}

/**
 * Validate and sanitize table code
 */
export function validateTableCode(input: string): { valid: boolean; sanitized?: string; error?: string } {
  const result = tableCodeSchema.safeParse(input.trim());
  if (result.success) {
    return { valid: true, sanitized: result.data };
  }
  return { valid: false, error: result.error.issues[0]?.message || 'Invalid table code' };
}
