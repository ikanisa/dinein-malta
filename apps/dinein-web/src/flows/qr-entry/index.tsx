import { useState, useEffect, useCallback } from 'react';
import { QRMenuView } from './QRMenuView';
import { CartScreen } from './CartScreen';
import { CheckoutScreen } from '@/components/screens/CheckoutScreen';
import { OrderTrackingScreen } from '@/components/screens/OrderTrackingScreen';
import { supabase } from '@/shared/services/supabase';
import { orders } from '@/shared/services/orders';
import type { OrderStatus } from '@/shared/components/StatusBadge';

type Screen = 'menu' | 'cart' | 'checkout' | 'tracking';

interface CartItem {
    id: number;
    name: string;
    price: number;
    quantity: number;
    description?: string;
    category?: string;
}

interface Order {
    id: string;
    orderNumber: number;
    status: OrderStatus;
    items: CartItem[];
    total: number;
    createdAt: Date;
}

export default function QREntryFlow() {
    // Parse URL for venue and table
    const path = window.location.pathname;
    const match = path.match(/\/m\/([^/]+)\/([^/]+)/);

    const [venueSlug] = useState(match?.[1] || '');
    const [tableCode] = useState(match?.[2] || '');
    const [venueName, setVenueName] = useState('');

    // Flow state
    const [screen, setScreen] = useState<Screen>('menu');
    const [cart, setCart] = useState<CartItem[]>([]);
    const [currentOrder, setCurrentOrder] = useState<Order | null>(null);

    // Load venue name
    useEffect(() => {
        if (!venueSlug) return;
        async function loadVenue() {
            const { data } = await supabase
                .from('vendors')
                .select('name')
                .eq('slug', venueSlug)
                .single();
            if (data) {
                setVenueName(data.name);
            }
        }
        loadVenue();
    }, [venueSlug]);

    // Cart operations
    const addToCart = useCallback((item: CartItem, qty: number = 1) => {
        setCart(prev => {
            const existing = prev.find(i => i.id === item.id);
            if (existing) {
                return prev.map(i =>
                    i.id === item.id ? { ...i, quantity: i.quantity + qty } : i
                );
            }
            return [...prev, { ...item, quantity: qty }];
        });
    }, []);

    const updateCartQty = useCallback((itemId: number, delta: number) => {
        setCart(prev => {
            return prev.map(item => {
                if (item.id === itemId) {
                    const newQty = item.quantity + delta;
                    return newQty > 0 ? { ...item, quantity: newQty } : item;
                }
                return item;
            }).filter(item => item.quantity > 0);
        });
    }, []);

    const removeFromCart = useCallback((itemId: number) => {
        setCart(prev => prev.filter(item => item.id !== itemId));
    }, []);

    const clearCart = useCallback(() => {
        setCart([]);
    }, []);

    // Place order
    const handlePlaceOrder = useCallback(async (orderDetails: { paymentMethod: string; notes: string }) => {
        // Calculate total
        const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const tax = subtotal * 0.18;
        const total = subtotal + tax;

        try {
            const order = await orders.createOrder({
                venue_id: venueSlug, // Using slug as ID for now/mock
                table_code: tableCode,
                items: cart.map(i => ({
                    name: i.name,
                    quantity: i.quantity,
                    price: i.price,
                    // notes: i.notes // CartItem interface in this file needs updating if we want notes
                })),
                total,
                payment_method: orderDetails.paymentMethod,
                notes: orderDetails.notes
            });

            // Set current order and navigate to tracking
            // Use real order data if available, or fall back to local constructed state if `order` is partial
            setCurrentOrder({
                id: order?.id || crypto.randomUUID(),
                orderNumber: parseInt(order?.order_code || '0000'),
                status: 'pending', // Initial status
                items: [...cart],
                total,
                createdAt: new Date(),
            });

            clearCart();
            setScreen('tracking');

            // Note: Realtime updates will handle status changes in production
            // For demo/dev without realtime setup, we can keep the simulation or remove it

        } catch (error) {
            console.error('Failed to place order:', error);
            alert('Failed to place order. Please try again.');
        }
    }, [cart, clearCart, venueSlug, tableCode]);

    // Handle invalid QR code
    if (!match) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8">
                <div className="text-center max-w-sm">
                    <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-5">
                        <span className="text-4xl">❌</span>
                    </div>
                    <h1 className="text-xl font-bold text-slate-900 mb-2">Invalid QR Code</h1>
                    <p className="text-slate-500">
                        Please scan a valid table QR code to start ordering.
                    </p>
                </div>
            </div>
        );
    }

    // Render current screen
    switch (screen) {
        case 'cart':
            return (
                <CartScreen
                    items={cart}
                    venueName={venueName || 'Restaurant'}
                    tableCode={tableCode}
                    onBack={() => setScreen('menu')}
                    onCheckout={() => setScreen('checkout')}
                    onUpdateQuantity={updateCartQty}
                    onRemoveItem={removeFromCart}
                />
            );

        case 'checkout':
            return (
                <CheckoutScreen
                    items={cart}
                    venueName={venueName || 'Restaurant'}
                    tableCode={tableCode}
                    onBack={() => setScreen('cart')}
                    onPlaceOrder={handlePlaceOrder}
                />
            );

        case 'tracking':
            if (!currentOrder) {
                setScreen('menu');
                return null;
            }
            return (
                <OrderTrackingScreen
                    orderId={currentOrder.id}
                    orderNumber={currentOrder.orderNumber}
                    venueName={venueName || 'Restaurant'}
                    tableCode={tableCode}
                    items={currentOrder.items}
                    total={currentOrder.total}
                    status={currentOrder.status}
                    createdAt={currentOrder.createdAt}
                    estimatedMinutes={20}
                    onGoHome={() => {
                        setCurrentOrder(null);
                        setScreen('menu');
                    }}
                    onNewOrder={() => {
                        setCurrentOrder(null);
                        setScreen('menu');
                    }}
                />
            );

            return (
                <QRMenuViewWithCart
                    venueSlug={venueSlug}
                    tableCode={tableCode}
                    cart={cart}
                    onAddToCart={(item, qty) => addToCart(item, qty)}
                    onViewCart={() => setScreen('cart')}
                />
            );
    }
}

// Wrapper component that adds cart functionality to QRMenuView
function QRMenuViewWithCart({
    venueSlug,
    tableCode,
    cart,
    onAddToCart: _onAddToCart,
    onViewCart,
}: {
    venueSlug: string;
    tableCode: string;
    cart: CartItem[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onAddToCart: (item: any, qty: number, options?: any) => void;
    onViewCart: () => void;
}) {
    const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    return (
        <div className="relative">
            <QRMenuView
                venueSlug={venueSlug}
                tableCode={tableCode}
                cart={cart}
                onAddToCart={_onAddToCart}
            />

            {/* Override the cart button with our connected one */}
            {itemCount > 0 && (
                <div
                    className="fixed bottom-6 left-5 right-5 z-50 animate-slide-up"
                    style={{ pointerEvents: 'auto' }}
                >
                    <button
                        onClick={onViewCart}
                        className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold shadow-xl shadow-indigo-500/30 flex items-center justify-between active:scale-[0.98] transition-transform"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center font-bold text-sm">
                                {itemCount}
                            </div>
                            <span>View Cart</span>
                        </div>
                        <span className="text-lg">€{total.toFixed(2)}</span>
                    </button>
                </div>
            )}
        </div>
    );
}
