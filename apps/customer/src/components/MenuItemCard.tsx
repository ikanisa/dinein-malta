import { MenuItemCard as UIMenuItemCard } from '@dinein/ui'
import { MenuItem } from '@dinein/db'

interface MenuItemCardProps {
    item: MenuItem
    qty?: number
    onAdd: () => void
    onIncrement: () => void
    onDecrement: () => void
}

export function MenuItemCard({ item, qty = 0, onAdd, onIncrement, onDecrement }: MenuItemCardProps) {
    return (
        <UIMenuItemCard
            name={item.name}
            description={item.description || undefined}
            price={item.price}
            currency={item.currency}
            qty={qty}
            onAdd={onAdd}
            onIncrement={onIncrement}
            onDecrement={onDecrement}
        />
    )
}
