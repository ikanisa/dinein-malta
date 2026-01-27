import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { MenuItem } from '@dinein/db'

/**
 * Represents an item in the cart.
 * Per STARTER RULES: Cart is venue-scoped (venueId is required).
 */
export interface CartItem {
    /** Unique menu item ID */
    itemId: string
    /** Display name */
    name: string
    /** Unit price */
    price: number
    /** Currency code (e.g., 'RWF', 'EUR') */
    currency: string
    /** Quantity in cart (always >= 1) */
    quantity: number
    /** Venue this item belongs to */
    venueId: string
    /** Optional special instructions */
    notes?: string
}

/**
 * Cart store state and actions.
 * Per STARTER RULES: Cart is per-venue; use getVenueItems/getVenueTotal for scoped access.
 */
interface CartState {
    /** All cart items keyed by itemId */
    items: Record<string, CartItem>

    /** Table assignments keyed by venueId */
    tables: Record<string, string>

    /** Set table number for a venue */
    setTable: (venueId: string, tableNo: string) => void

    /** Add a menu item to cart (creates or increments) */
    addItem: (item: MenuItem, venueId: string) => void
    /** Remove an item completely */
    removeItem: (itemId: string) => void
    /** Increment or decrement quantity (removes if qty <= 0) */
    updateQuantity: (itemId: string, delta: number) => void
    /** Clear all items for a specific venue */
    clearCart: (venueId: string) => void
    /** Clear table assignment */
    clearTable: (venueId: string) => void

    // Computed helpers (derived from state)
    getVenueItems: (venueId: string) => CartItem[]
    getVenueTotal: (venueId: string) => number
    getItemCount: (venueId: string) => number
    getItemQuantity: (itemId: string) => number
    getTable: (venueId: string) => string | undefined
}

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            items: {},
            tables: {},

            setTable: (venueId, tableNo) => set((state) => ({
                tables: { ...state.tables, [venueId]: tableNo }
            })),

            clearTable: (venueId) => set((state) => {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { [venueId]: _, ...rest } = state.tables
                return { tables: rest }
            }),

            getTable: (venueId) => get().tables[venueId],

            addItem: (item, venueId) => set((state) => {
                const existing = state.items[item.id]
                if (existing) {
                    return {
                        items: {
                            ...state.items,
                            [item.id]: { ...existing, quantity: existing.quantity + 1 }
                        }
                    }
                }
                return {
                    items: {
                        ...state.items,
                        [item.id]: {
                            itemId: item.id,
                            name: item.name,
                            price: item.price,
                            currency: item.currency,
                            venueId,
                            quantity: 1
                        }
                    }
                }
            }),

            removeItem: (itemId) => set((state) => {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { [itemId]: _, ...rest } = state.items
                return { items: rest }
            }),

            updateQuantity: (itemId, delta) => set((state) => {
                const existing = state.items[itemId]
                if (!existing) return state

                const newQty = existing.quantity + delta
                if (newQty <= 0) {
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    const { [itemId]: _, ...rest } = state.items
                    return { items: rest }
                }

                return {
                    items: {
                        ...state.items,
                        [itemId]: { ...existing, quantity: newQty }
                    }
                }
            }),

            clearCart: (venueId) => set((state) => {
                const newItems = { ...state.items }
                Object.values(state.items).forEach(item => {
                    if (item.venueId === venueId) {
                        delete newItems[item.itemId]
                    }
                })
                return { items: newItems }
            }),

            getVenueItems: (venueId) => {
                return Object.values(get().items).filter(item => item.venueId === venueId)
            },

            getVenueTotal: (venueId) => {
                return Object.values(get().items)
                    .filter(item => item.venueId === venueId)
                    .reduce((sum, item) => sum + (item.price * item.quantity), 0)
            },

            getItemCount: (venueId) => {
                return Object.values(get().items)
                    .filter(item => item.venueId === venueId)
                    .reduce((sum, item) => sum + item.quantity, 0)
            },

            getItemQuantity: (itemId) => {
                return get().items[itemId]?.quantity ?? 0
            }
        }),
        {
            name: 'dinein-cart-storage',
        }
    )
)
