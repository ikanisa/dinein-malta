import { useCartStore } from '../store/useCartStore'
import { MenuItem } from '@dinein/db'
import { useVenueContext } from '../context/VenueContext'

/**
 * Custom hook that wraps useCartStore with venue context
 * Provides a cleaner API for cart operations scoped to current venue
 */
export function useCart() {
    const { venue } = useVenueContext()
    const venueId = venue?.id

    const items = useCartStore(state => venueId ? state.getVenueItems(venueId) : [])
    const totalPrice = useCartStore(state => venueId ? state.getVenueTotal(venueId) : 0)
    const totalItems = useCartStore(state => venueId ? state.getItemCount(venueId) : 0)
    const currentTable = useCartStore(state => venueId ? state.getTable(venueId) : undefined)

    const addItem = useCartStore(state => state.addItem)
    const updateQuantity = useCartStore(state => state.updateQuantity)
    const removeItem = useCartStore(state => state.removeItem)
    const clearCart = useCartStore(state => state.clearCart)
    const setTable = useCartStore(state => state.setTable)
    const getItemQuantity = useCartStore(state => state.getItemQuantity)

    return {
        items: items.map(ci => ({
            item: { id: ci.itemId, name: ci.name, price: ci.price, currency: ci.currency } as MenuItem,
            quantity: ci.quantity,
            notes: ci.notes
        })),
        totalPrice,
        totalItems,
        currentTable,
        addItem: (item: MenuItem, venueId: string) => addItem(item, venueId),
        updateQuantity: (itemId: string, delta: number) => updateQuantity(itemId, delta),
        removeItem,
        clearCart: () => venueId && clearCart(venueId),
        setTable: (venueId: string, tableNo: string) => setTable(venueId, tableNo),
        getQty: (itemId: string) => getItemQuantity(itemId)
    }
}
