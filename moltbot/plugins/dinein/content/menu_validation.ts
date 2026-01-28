/**
 * Menu Validation
 * 
 * Quality rules for menus, categories, items, and addons.
 */

import { CONTROLLED_ALLERGENS } from "./taxonomy.ts";

export interface MenuItem {
    id: string;
    name: string;
    description?: string;
    price: number;
    currency: string;
    categoryId: string;
    isAvailable: boolean;
    allergens: string[];
    tags: string[];
}

export interface MenuCategory {
    id: string;
    name: string;
    items: MenuItem[];
}

export interface MenuDraft {
    venueId: string;
    categories: MenuCategory[];
}

export interface ValidationError {
    code: string;
    message: string;
    path: string;
    severity: "error" | "warning";
}

const VALID_CURRENCIES = ["RWF", "EUR"];

/**
 * Validate a menu draft and return all errors/warnings.
 */
export function validateMenuDraft(draft: MenuDraft): ValidationError[] {
    const errors: ValidationError[] = [];

    // Rule: Menu must have at least 1 category
    if (draft.categories.length === 0) {
        errors.push({
            code: "MENU_EMPTY",
            message: "Menu must have at least 1 category",
            path: "categories",
            severity: "error"
        });
    }

    const allItemNames = new Map<string, string[]>(); // name -> categoryIds

    for (const category of draft.categories) {
        // Rule: Each category must have at least 1 active item
        const activeItems = category.items.filter(i => i.isAvailable);
        if (activeItems.length === 0) {
            errors.push({
                code: "CATEGORY_EMPTY",
                message: `Category "${category.name}" has no active items`,
                path: `categories.${category.id}`,
                severity: "error"
            });
        }

        for (const item of category.items) {
            // Rule: Item name length 2-60
            if (item.name.length < 2 || item.name.length > 60) {
                errors.push({
                    code: "ITEM_NAME_LENGTH",
                    message: `Item name must be 2-60 chars: "${item.name}"`,
                    path: `items.${item.id}.name`,
                    severity: "error"
                });
            }

            // Rule: Price >= 0
            if (item.price < 0) {
                errors.push({
                    code: "INVALID_PRICE",
                    message: `Price cannot be negative: ${item.price}`,
                    path: `items.${item.id}.price`,
                    severity: "error"
                });
            }

            // Rule: Valid currency
            if (!VALID_CURRENCIES.includes(item.currency)) {
                errors.push({
                    code: "INVALID_CURRENCY",
                    message: `Invalid currency: ${item.currency}`,
                    path: `items.${item.id}.currency`,
                    severity: "error"
                });
            }

            // Rule: Allergens from controlled list
            for (const allergen of item.allergens) {
                if (!CONTROLLED_ALLERGENS.includes(allergen as any)) {
                    errors.push({
                        code: "UNKNOWN_ALLERGEN",
                        message: `Unknown allergen: ${allergen}`,
                        path: `items.${item.id}.allergens`,
                        severity: "warning"
                    });
                }
            }

            // Track duplicates
            const lowerName = item.name.toLowerCase();
            if (!allItemNames.has(lowerName)) {
                allItemNames.set(lowerName, []);
            }
            allItemNames.get(lowerName)!.push(category.id);
        }
    }

    // Rule: No duplicate item names in same category
    for (const [name, categoryIds] of allItemNames) {
        const unique = new Set(categoryIds);
        if (categoryIds.length > unique.size) {
            errors.push({
                code: "DUPLICATE_ITEM_NAME",
                message: `Duplicate item name in same category: "${name}"`,
                path: "items",
                severity: "warning"
            });
        }
    }

    return errors;
}

/**
 * Check if menu draft is valid (no errors, warnings allowed).
 */
export function isMenuValid(draft: MenuDraft): boolean {
    const errors = validateMenuDraft(draft);
    return !errors.some(e => e.severity === "error");
}
