import { useState, useMemo, useCallback } from 'react'
import { useVenueContext } from '../context/VenueContext'
import { useCartStore } from '../store/useCartStore'
import { useMenu } from '../hooks/useMenu'
import { MenuHeader } from '../components/MenuHeader'
import { MenuItemCard } from '../components/MenuItemCard'
import { QuickAddBar } from '../components/QuickAddBar'
import { TableNumberSheet } from '../components/TableNumberSheet'
import { StickyCartPill } from '../components/StickyCartPill'
import { Skeleton, ErrorState } from '@dinein/ui'
import { MenuCategory } from '@dinein/db'
import { MICROCOPY } from '@dinein/core'

export default function VenueMenu() {
    const { venue } = useVenueContext()
    const { items: menuItems, categories: rawCategories, loading, error, refresh } = useMenu(venue?.id)

    // Cart store selectors
    const venueId = venue?.id || ''
    // Used for potential future features like cart preview
    const totalPrice = useCartStore(state => venueId ? state.getVenueTotal(venueId) : 0)
    const totalItems = useCartStore(state => venueId ? state.getItemCount(venueId) : 0)
    const addItem = useCartStore(state => state.addItem)
    const updateQuantity = useCartStore(state => state.updateQuantity)
    const getItemQuantity = useCartStore(state => state.getItemQuantity)
    const setTable = useCartStore(state => state.setTable)
    // getTable available for table number retrieval if needed

    // Table number stored for order association (future use)

    // Ensure categories have venue_id for type compatibility
    const categories: MenuCategory[] = useMemo(() => {
        return rawCategories.map(c => ({
            ...c,
            venue_id: venueId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        }))
    }, [rawCategories, venueId])

    // Initialize active category from first category (derived, not via effect)
    const [activeCategory, setActiveCategory] = useState<string | undefined>()
    const [showTableSheet, setShowTableSheet] = useState(false)

    // Derive effective active category - default to first if not set
    const effectiveActiveCategory = activeCategory ?? categories[0]?.id

    const filteredItems = useMemo(() => {
        if (!effectiveActiveCategory) return menuItems
        return menuItems.filter(item => item.category_id === effectiveActiveCategory)
    }, [menuItems, effectiveActiveCategory])

    // Popular items for quick add (e.g., top 5 items)
    const popularItems = useMemo(() => menuItems.slice(0, 5), [menuItems])

    const getQty = useCallback((itemId: string) => {
        return getItemQuantity(itemId)
    }, [getItemQuantity])

    if (!venue) return null

    const currency = venue.country === 'RW' ? 'RWF' : 'EUR'

    return (
        <div className="min-h-screen bg-background pb-32" data-testid="venue-menu:page">
            <header className="px-4 py-4">
                <h1 className="text-2xl font-bold">{venue.name}</h1>
                <p className="text-sm text-muted-foreground">
                    {venue.country === 'RW' ? 'Rwanda' : 'Malta'}
                </p>
            </header>

            <main>
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
                                activeCategory={effectiveActiveCategory}
                                onSelectCategory={setActiveCategory}
                            />
                        )}
                    </div>
                </div>

                {/* Quick Add Bar for Popular Items */}
                {popularItems.length > 0 && !loading && (
                    <QuickAddBar
                        title="Popular"
                        items={popularItems}
                        onAdd={(item) => addItem(item, venueId)}
                        currency={currency}
                    />
                )}

                <div
                    className="px-4 space-y-4 py-2"
                    role="tabpanel"
                    id="menu-items-panel"
                    aria-label="Menu Items"
                >
                    {error ? (
                        <ErrorState
                            message={MICROCOPY.errors.venue.menuLoadFailed}
                            retryAction={{
                                label: MICROCOPY.actions.retry,
                                onClick: refresh
                            }}
                        />
                    ) : loading ? (
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
                                onAdd={() => addItem(item, venueId)}
                                onIncrement={() => updateQuantity(item.id, 1)}
                                onDecrement={() => updateQuantity(item.id, -1)}
                            />
                        ))
                    ) : (
                        <div className="py-10 text-center text-muted-foreground" role="status">
                            {categories.length === 0 ? 'No menu items yet' : 'No items in this category'}
                        </div>
                    )}
                </div>
            </main>

            <TableNumberSheet
                isOpen={showTableSheet}
                onClose={() => setShowTableSheet(false)}
                onConfirm={(tableNo) => {
                    if (venue) setTable(venue.id, tableNo)
                    setShowTableSheet(false)
                }}
            />

            <StickyCartPill
                itemCount={totalItems}
                total={totalPrice}
                currency={currency}
            />
        </div>
    )
}
