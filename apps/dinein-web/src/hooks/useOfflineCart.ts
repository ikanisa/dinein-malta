import { useState, useEffect } from 'react';

export interface CartItem {
    id: number;
    name: string;
    emoji: string;
    price: number;
    quantity: number;
    notes?: string;
}

const STORAGE_KEY = 'dinein_offline_cart';

export function useOfflineCart() {
    const [items, setItems] = useState<CartItem[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load from local storage on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                setItems(JSON.parse(stored));
            }
        } catch (e) {
            console.error('Failed to load cart from storage', e);
        } finally {
            setIsLoaded(true);
        }
    }, []);

    // Save to local storage whenever items change
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
        }
    }, [items, isLoaded]);

    const addToCart = (item: CartItem) => {
        setItems(prev => {
            const existing = prev.find(i => i.id === item.id);
            if (existing) {
                return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i);
            }
            return [...prev, item];
        });
    };

    const updateQuantity = (id: number, delta: number) => {
        setItems(prev => prev.map(item => {
            if (item.id === id) {
                const newQty = Math.max(0, item.quantity + delta);
                return { ...item, quantity: newQty };
            }
            return item;
        }).filter(item => item.quantity > 0));
    };

    const removeItem = (id: number) => {
        setItems(prev => prev.filter(item => item.id !== id));
    };

    const clearCart = () => {
        setItems([]);
        localStorage.removeItem(STORAGE_KEY);
    };

    // Store pending orders for sync
    const saveOrderForSync = (order: any) => {
        const pending = JSON.parse(localStorage.getItem('dinein_pending_orders') || '[]');
        pending.push(order);
        localStorage.setItem('dinein_pending_orders', JSON.stringify(pending));

        // Trigger Background Sync if SW is ready
        if ('serviceWorker' in navigator && 'SyncManager' in window) {
            navigator.serviceWorker.ready.then(reg => {
                // Background Sync API
                (reg as any).sync.register('dinein-offline-orders').catch(console.error);
            });
        }
    };

    return {
        items,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        saveOrderForSync,
        isLoaded
    };
}
