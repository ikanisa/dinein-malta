import { useState, useEffect } from 'react';
import { Minus, Plus, Trash2, ChevronLeft, ShoppingBag, Clock, MapPin, CreditCard, ChevronRight, WifiOff } from 'lucide-react';
import { useOfflineCart } from '@/hooks/useOfflineCart';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/Input';

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
            if ('serviceWorker' in navigator && 'SyncManager' in window) {
                navigator.serviceWorker.ready.then(registration => {
                    registration.sync.register('sync-cart').catch(console.error);
                });
            }
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

    if (!isLoaded) return null;

    if (items.length === 0) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-28 animate-fade-in flex flex-col items-center justify-center p-6 text-center">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-32 h-32 rounded-full bg-indigo-50 dark:bg-slate-800 flex items-center justify-center mb-6 shadow-inner"
                >
                    <ShoppingBag className="w-12 h-12 text-indigo-400 dark:text-indigo-400" />
                </motion.div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Your cart is empty</h3>
                <p className="text-muted-foreground mb-8 max-w-xs">
                    Satisfy your hunger! Add delicious items from our featured venues.
                </p>
                <Button onClick={onBack} size="lg" className="w-full max-w-xs shadow-lg shadow-brand-primary/20">
                    Browse Restaurants
                </Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-48 animate-fade-in">
            {/* Header Area */}
            <div className="relative pt-12 pb-24 px-6 overflow-hidden bg-brand-primary text-white rounded-b-[3rem] shadow-xl shadow-brand-primary/20">
                {/* Decorative background blobs */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />

                <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-6">
                        <button
                            onClick={onBack}
                            className="bg-white/20 hover:bg-white/30 p-2.5 rounded-full backdrop-blur-md transition-colors"
                        >
                            <ChevronLeft className="w-6 h-6 text-white" />
                        </button>
                        <div>
                            <h1 className="text-3xl font-bold">Cart</h1>
                            <p className="text-white/80 font-medium">{items.length} items</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Container - Overlapping Header */}
            <div className="px-5 -mt-16 relative z-20 space-y-4">
                {/* Delivery Info Card */}
                <GlassCard className="flex items-center gap-4 p-4 !bg-white/90 dark:!bg-slate-800/90 backdrop-blur-xl border-white/50">
                    <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center shrink-0">
                        <MapPin className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Deliver to</p>
                        <p className="font-bold text-slate-900 dark:text-white truncate">Valletta, Malta</p>
                    </div>
                    <div className="flex flex-col items-end text-right">
                        <div className="flex items-center gap-1 text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700/50 px-2 py-1 rounded-lg">
                            <Clock className="w-3.5 h-3.5" />
                            <span className="text-xs font-bold">25-30 min</span>
                        </div>
                    </div>
                </GlassCard>

                {/* Cart Items List */}
                <div className="space-y-4 pt-4">
                    <AnimatePresence mode="popLayout">
                        {items.map((item) => (
                            <motion.div
                                key={item.id}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
                            >
                                <GlassCard className="p-4 flex gap-4 overflow-hidden" depth="1">
                                    <div className="w-20 h-20 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-3xl shrink-0 shadow-inner">
                                        {item.emoji || '🍽️'}
                                    </div>
                                    <div className="flex-1 min-w-0 flex flex-col">
                                        <div className="flex justify-between items-start mb-1">
                                            <h3 className="font-bold text-slate-900 dark:text-white truncate pr-2">{item.name}</h3>
                                            <button
                                                onClick={() => removeItem(item.id)}
                                                className="text-slate-400 hover:text-red-500 transition-colors p-1 -mr-2 -mt-2"
                                            >
                                                <Trash2 className="w-4.5 h-4.5" />
                                            </button>
                                        </div>

                                        {item.notes && (
                                            <p className="text-xs text-slate-500 italic truncate mb-auto">{item.notes}</p>
                                        )}

                                        <div className="flex items-center justify-between mt-3">
                                            <span className="font-bold text-brand-primary">€{(item.price * item.quantity).toFixed(2)}</span>

                                            <div className="flex items-center gap-3 bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
                                                <button
                                                    onClick={() => updateQuantity(item.id, -1)}
                                                    className="w-7 h-7 rounded-lg bg-white dark:bg-slate-700 shadow-sm flex items-center justify-center text-slate-600 dark:text-slate-200 active:scale-90 transition-transform"
                                                >
                                                    <Minus className="w-3.5 h-3.5" />
                                                </button>
                                                <span className="font-bold text-sm w-4 text-center">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item.id, 1)}
                                                    className="w-7 h-7 rounded-lg bg-brand-primary shadow-sm flex items-center justify-center text-white active:scale-90 transition-transform"
                                                >
                                                    <Plus className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </GlassCard>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {/* Promo Code */}
                <GlassCard className="p-2 flex gap-2 items-center" depth="1">
                    <Input
                        placeholder="Promo code"
                        value={promoCode}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPromoCode(e.target.value)}
                        disabled={promoApplied}
                        className="border-none bg-transparent shadow-none"
                    />
                    <Button
                        size="sm"
                        disabled={promoApplied || !promoCode}
                        onClick={applyPromo}
                        variant={promoApplied ? 'default' : 'secondary'}
                        className={promoApplied ? 'bg-emerald-500 hover:bg-emerald-600' : ''}
                    >
                        {promoApplied ? 'Applied' : 'Apply'}
                    </Button>
                </GlassCard>
            </div>

            {/* Offline Message */}
            {isOffline && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mx-6 mt-6 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-2xl p-4 flex gap-3"
                >
                    <WifiOff className="w-5 h-5 text-amber-600 dark:text-amber-500 shrink-0" />
                    <div>
                        <h4 className="text-sm font-bold text-amber-800 dark:text-amber-400">You are offline</h4>
                        <p className="text-xs text-amber-700 dark:text-amber-500/80 mt-1">
                            Your order will be synced automatically once you're back online.
                        </p>
                    </div>
                </motion.div>
            )}

            {/* Summary & Checkout - Fixed Bottom */}
            <div className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-t border-slate-200/50 dark:border-slate-800/50 p-6 pb-8 safe-area-bottom z-40">
                <div className="max-w-md mx-auto space-y-4">
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between text-muted-foreground">
                            <span>Subtotal</span>
                            <span>€{subtotal.toFixed(2)}</span>
                        </div>
                        {promoApplied && (
                            <div className="flex justify-between text-emerald-600 font-medium">
                                <span>Discount (30%)</span>
                                <span>-€{discount.toFixed(2)}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-muted-foreground">
                            <span>Delivery</span>
                            <span className={cn(deliveryFee === 0 && "text-emerald-600 font-medium")}>
                                {deliveryFee === 0 ? 'Free' : `€${deliveryFee.toFixed(2)}`}
                            </span>
                        </div>
                        <div className="flex justify-between text-xl font-bold text-slate-900 dark:text-white pt-2 border-t border-slate-200/50 dark:border-slate-800/50">
                            <span>Total</span>
                            <span>€{total.toFixed(2)}</span>
                        </div>
                    </div>

                    <Button
                        onClick={handleCheckout}
                        className="w-full text-lg h-14 shadow-xl shadow-brand-primary/25"
                    >
                        <CreditCard className="w-5 h-5 mr-2" />
                        {isOffline ? 'Place Order (Offline)' : 'Proceed to Checkout'}
                        <ChevronRight className="w-5 h-5 ml-2 opacity-50" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
