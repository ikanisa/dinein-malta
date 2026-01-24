import { useState, useEffect } from 'react'
import { useVenueContext } from '../context/VenueContext'
import { MenuHeader } from '../components/MenuHeader'
import { MenuItemCard } from '../components/MenuItemCard'
import { StickyCartPill } from '../components/StickyCartPill'
import { getCategories, getMenuItems, MenuCategory, MenuItem } from '@dinein/db'
import { useCartStore } from '../store/useCartStore'
import { supabase } from '../shared/services/supabase'
import { Skeleton } from '@dinein/ui'

export default function VenueMenu() {
    const { venue } = useVenueContext()
    const [categories, setCategories] = useState<MenuCategory[]>([])
    const [items, setItems] = useState<MenuItem[]>([])
    const [activeCategory, setActiveCategory] = useState<string | undefined>()
    const [loading, setLoading] = useState(true)

    const addItem = useCartStore(state => state.addItem)
    const updateQuantity = useCartStore(state => state.updateQuantity)
    const getVenueItems = useCartStore(state => state.getVenueItems)
    const getVenueTotal = useCartStore(state => state.getVenueTotal)
    const getItemCount = useCartStore(state => state.getItemCount)

    // Fetch categories and items when venue loads
    useEffect(() => {
        if (!venue) return

        const fetchMenu = async () => {
            setLoading(true)
            try {
                const [fetchedCategories, fetchedItems] = await Promise.all([
                    getCategories(supabase, venue.id),
                    getMenuItems(supabase, venue.id)
                ])

                setCategories(fetchedCategories)
                setItems(fetchedItems)

                // Set first category as active
                if (fetchedCategories.length > 0 && !activeCategory) {
                    setActiveCategory(fetchedCategories[0].id)
                }
            } catch (error) {
                console.error('Error fetching menu:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchMenu()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [venue?.id])

    if (!venue) return null

    const itemsInCart = getVenueItems(venue.id)
    const totalItems = getItemCount(venue.id)
    const totalPrice = getVenueTotal(venue.id)

    const getQty = (itemId: string) => {
        return itemsInCart.find(i => i.itemId === itemId)?.quantity || 0
    }

    // Filter items by active category
    const filteredItems = items.filter(
        item => item.category_id === activeCategory
    )

    // Get currency from first item or default based on venue country
    const currency = items[0]?.currency ?? (venue.country === 'RW' ? 'RWF' : 'EUR')

    return (
        <div className="min-h-screen bg-background pb-32">
            <header className="px-4 py-4">
                <h1 className="text-2xl font-bold">{venue.name}</h1>
                <p className="text-sm text-muted-foreground">
                    {venue.country === 'RW' ? 'Rwanda' : 'Malta'}
                </p>
            </header>

            <div className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="px-4 pb-4">
                    {loading ? (
                        <div className="flex gap-2">
                            {[1, 2, 3].map(i => (
                                <Skeleton key={i} className="h-10 w-24 rounded-full" />
                            ))}
                        </div>
                    ) : (
                        <MenuHeader
                            categories={categories}
                            activeCategory={activeCategory}
                            onSelectCategory={setActiveCategory}
                        />
                    )}
                </div>
            </div>

            <div className="px-4 space-y-4 py-2">
                {loading ? (
                    <>
                        {[1, 2, 3].map(i => (
                            <Skeleton key={i} className="h-28 rounded-xl" />
                        ))}
                    </>
                ) : filteredItems.length > 0 ? (
                    filteredItems.map(item => (
                        <MenuItemCard
                            key={item.id}
                            item={item}
                            qty={getQty(item.id)}
                            onAdd={() => addItem(item, venue.id)}
                            onIncrement={() => updateQuantity(item.id, 1)}
                            onDecrement={() => updateQuantity(item.id, -1)}
                        />
                    ))
                ) : (
                    <div className="py-10 text-center text-muted-foreground">
                        {categories.length === 0 ? 'No menu items yet' : 'No items in this category'}
                    </div>
                )}
            </div>

            <StickyCartPill
                itemCount={totalItems}
                total={totalPrice}
                currency={currency}
            />
        </div>
    )
}
