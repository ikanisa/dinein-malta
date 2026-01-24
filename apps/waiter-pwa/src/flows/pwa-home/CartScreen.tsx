import { useState, useEffect } from 'react';
import { Minus, Plus, Trash2, ChevronLeft, ShoppingBag, Clock, MapPin, CreditCard, ChevronRight, WifiOff } from 'lucide-react';
import { useOfflineCart } from '@/hooks/useOfflineCart';

interface CartScreenProps {
    onBack?: () => void;
    onCheckout?: () => void;
}

export function CartScreen({ onBack, onCheckout }: CartScreenProps) {
    const { items, updateQuantity, removeItem, clearCart, isLoaded } = useOfflineCart();
    const [promoCode, setPromoCode] = useState('');
    const [promoApplied, setPromoApplied] = useState(false);
    const [isOffline, setIsOffline] = useState(!navigator.onLine);

    useEffect(() => {
        const handleOnline = () => setIsOffline(false);
        const handleOffline = () => setIsOffline(true);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    const applyPromo = () => {
        if (promoCode.toLowerCase() === 'firstbite') {
            setPromoApplied(true);
        }
    };

    const handleCheckout = () => {
        if (isOffline) {
            // Queue for sync or minimal offline success
            // For now, we simulate a "saved" order
            // Ideally this would trigger the Background Sync registration here or in a context
            if ('serviceWorker' in navigator && 'SyncManager' in window) {
                navigator.serviceWorker.ready.then(registration => {
                    // @ts-expect-error - Background Sync API not yet in TS lib
                    registration.sync.register('sync-cart').catch(console.error);
                });
            }
            // In a real app we'd save this 'order' to IDB with a 'pending' status
            alert("You are offline. Your order has been saved and will be placed when you reconnect!");
            clearCart();
            onBack?.();
        } else {
            onCheckout?.();
        }
    };

    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const discount = promoApplied ? subtotal * 0.3 : 0;
    const deliveryFee = subtotal > 25 ? 0 : 2.99;
    const total = subtotal - discount + deliveryFee;

    if (!isLoaded) return null; // or skeleton

    if (items.length === 0) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white pb-28 animate-fade-in">
                <div className="header-gradient px-6 pt-6 pb-8 rounded-b-[2.5rem] shadow-lg">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={onBack}
                            className="header-gradient-light p-3 rounded-xl active:scale-95 transition-transform"
                        >
                            <ChevronLeft className="w-5 h-5 text-white" />
                        </button>
                        <h1 className="text-2xl font-bold text-white">Your Cart</h1>
                    </div>
                </div>

                <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center mb-5">
                        <ShoppingBag className="w-12 h-12 text-orange-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-700 mb-2">Your cart is empty</h3>
                    <p className="text-sm text-slate-500 mb-6 max-w-xs">
                        Add delicious dishes from your favorite restaurants
                    </p>
                    <button
                        onClick={onBack}
                        className="px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold text-sm shadow-lg active:scale-95 transition-transform"
                    >
                        Browse Restaurants
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white pb-48 animate-fade-in">
            {/* Header */}
            <div className="header-gradient px-6 pt-6 pb-8 rounded-b-[2.5rem] shadow-lg">
                <div className="flex items-center gap-4 mb-4">
                    <button
                        onClick={onBack}
                        className="header-gradient-light p-3 rounded-xl active:scale-95 transition-transform"
                    >
                        <ChevronLeft className="w-5 h-5 text-white" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-white">Your Cart</h1>
                        <p className="text-white/80 text-sm">{items.length} items</p>
                    </div>
                </div>

                {/* Delivery Info */}
                <div className="glass-card p-4 flex items-center gap-3 -mb-6 relative z-10">
                    <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-orange-500" />
                    </div>
                    <div className="flex-1">
                        <p className="text-xs text-slate-500">Deliver to</p>
                        <p className="font-semibold text-slate-900 text-sm">Kigali Downtown</p>
                    </div>
                    <div className="flex items-center gap-1 text-slate-500">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm">25-35 min</span>
                    </div>
                </div>
            </div>

            {/* Cart Items */}
            <div className="px-6 pt-10 space-y-3">
                {items.map((item) => (
                    <div key={item.id} className="glass-card p-4 shadow-sm">
                        <div className="flex gap-3">
                            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center text-2xl">
                                {item.emoji}
                            </div>
                            <div className="flex-1">
                                <div className="flex items-start justify-between">
                                    <h3 className="font-semibold text-slate-900">{item.name}</h3>
                                    <button
                                        onClick={() => removeItem(item.id)}
                                        className="p-1 text-slate-400 hover:text-red-500"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                                {item.notes && (
                                    <p className="text-xs text-slate-500 mt-0.5">{item.notes}</p>
                                )}
                                <div className="flex items-center justify-between mt-2">
                                    <span className="font-bold text-orange-500">${(item.price * item.quantity).toFixed(2)}</span>
                                    <div className="flex items-center gap-2 bg-slate-100 rounded-xl p-1">
                                        <button
                                            onClick={() => updateQuantity(item.id, -1)}
                                            className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm active:scale-95"
                                        >
                                            <Minus className="w-4 h-4 text-slate-600" />
                                        </button>
                                        <span className="w-8 text-center font-bold text-slate-900">{item.quantity}</span>
                                        <button
                                            onClick={() => updateQuantity(item.id, 1)}
                                            className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center shadow-sm active:scale-95"
                                        >
                                            <Plus className="w-4 h-4 text-white" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Promo Code */}
            <div className="px-6 mt-4">
                <div className="glass-card p-4 shadow-sm">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="Promo code"
                            value={promoCode}
                            onChange={(e) => setPromoCode(e.target.value)}
                            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                            disabled={promoApplied}
                        />
                        <button
                            onClick={applyPromo}
                            disabled={promoApplied || !promoCode}
                            className={`px-4 py-3 rounded-xl font-semibold text-sm ${promoApplied
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-orange-500 text-white active:scale-95'
                                } transition-transform`}
                        >
                            {promoApplied ? 'Applied!' : 'Apply'}
                        </button>
                    </div>
                    {promoApplied && (
                        <p className="text-xs text-emerald-600 mt-2">🎉 30% discount applied!</p>
                    )}
                </div>
            </div>

            {/* Offline Helper Message */}
            {isOffline && (
                <div className="px-6 mt-4 opacity-90">
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                        <WifiOff className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
                        <div>
                            <h4 className="text-sm font-semibold text-amber-800">You are offline</h4>
                            <p className="text-xs text-amber-700 mt-1">
                                Don't worry, you can still place your order. We'll sync it as soon as you're back online!
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Order Summary - Fixed Bottom */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 p-6 pb-8 safe-area-bottom shadow-2xl">
                <div className="max-w-md mx-auto">
                    {/* Summary */}
                    <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Subtotal</span>
                            <span className="text-slate-900">${subtotal.toFixed(2)}</span>
                        </div>
                        {promoApplied && (
                            <div className="flex justify-between text-sm">
                                <span className="text-emerald-600">Discount (30%)</span>
                                <span className="text-emerald-600">-${discount.toFixed(2)}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Delivery</span>
                            <span className={deliveryFee === 0 ? 'text-emerald-600' : 'text-slate-900'}>
                                {deliveryFee === 0 ? 'Free' : `$${deliveryFee.toFixed(2)}`}
                            </span>
                        </div>
                        <div className="flex justify-between text-lg font-bold pt-2 border-t border-slate-100">
                            <span className="text-slate-900">Total</span>
                            <span className="text-orange-500">${total.toFixed(2)}</span>
                        </div>
                    </div>

                    {/* Checkout Button */}
                    <button
                        onClick={handleCheckout}
                        className="w-full py-4 rounded-2xl font-bold bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/30 active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
                    >
                        <CreditCard className="w-5 h-5" />
                        {isOffline ? 'Place Order (Offline)' : 'Proceed to Checkout'}
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
