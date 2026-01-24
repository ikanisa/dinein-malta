import React, { createContext, useContext, useState, useEffect } from 'react'

export interface CartItem {
    id: string
    menuItemId: string
    name: string
    description?: string
    price: number
    quantity: number
    options?: Record<string, string>
}

interface CartContextType {
    items: CartItem[]
    addItem: (item: Omit<CartItem, 'id'>) => void
    removeItem: (id: string) => void
    updateQuantity: (id: string, quantity: number) => void
    clearCart: () => void
    total: number
    itemCount: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

const CART_STORAGE_KEY = 'waiter-pwa-cart'

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<CartItem[]>(() => {
        const stored = localStorage.getItem(CART_STORAGE_KEY)
        return stored ? JSON.parse(stored) : []
    })

    useEffect(() => {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
    }, [items])

    const addItem = (newItem: Omit<CartItem, 'id'>) => {
        setItems((prev) => {
            const existing = prev.find(
                (i) => i.menuItemId === newItem.menuItemId &&
                    JSON.stringify(i.options) === JSON.stringify(newItem.options)
            )
            if (existing) {
                return prev.map((i) =>
                    i.id === existing.id
                        ? { ...i, quantity: i.quantity + newItem.quantity }
                        : i
                )
            }
            return [...prev, { ...newItem, id: crypto.randomUUID() }]
        })
    }

    const removeItem = (id: string) => {
        setItems((prev) => prev.filter((i) => i.id !== id))
    }

    const updateQuantity = (id: string, quantity: number) => {
        if (quantity <= 0) {
            removeItem(id)
            return
        }
        setItems((prev) =>
            prev.map((i) => (i.id === id ? { ...i, quantity } : i))
        )
    }

    const clearCart = () => {
        setItems([])
    }

    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)

    return (
        <CartContext.Provider
            value={{
                items,
                addItem,
                removeItem,
                updateQuantity,
                clearCart,
                total,
                itemCount,
            }}
        >
            {children}
        </CartContext.Provider>
    )
}

export const useCart = () => {
    const context = useContext(CartContext)
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider')
    }
    return context
}
