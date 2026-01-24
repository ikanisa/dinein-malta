import { useState } from 'react';
import { ChevronLeft, Check, CreditCard, Banknote, Smartphone, Loader2, ChevronRight } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface CartItem {
    id: number;
    name: string;
    price: number;
    quantity: number;
}

interface CheckoutScreenProps {
    items: CartItem[];
    venueName: string;
    tableCode?: string;
    onBack: () => void;
    onPlaceOrder: (orderDetails: { paymentMethod: string; notes: string }) => Promise<void>;
}

const PAYMENT_OPTIONS = [
    { id: 'card', label: 'Card', icon: CreditCard, description: 'Pay with credit/debit card' },
    { id: 'cash', label: 'Cash', icon: Banknote, description: 'Pay at table' },
    { id: 'mobile', label: 'Mobile', icon: Smartphone, description: 'Mobile money' },
];

export function CheckoutScreen({
    items,
    venueName,
    tableCode,
    onBack,
    onPlaceOrder,
}: CheckoutScreenProps) {
    const [paymentMethod, setPaymentMethod] = useState('card');
    const [notes, setNotes] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const tax = subtotal * 0.18;
    const total = subtotal + tax;

    const handleSubmit = async () => {
        if (submitting) return;
        setSubmitting(true);
        try {
            await onPlaceOrder({ paymentMethod, notes });
        } catch (e) {
            console.error(e);
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col animate-fade-in relative overflow-hidden">
            {/* Decorative background blobs */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            <div className="absolute top-40 left-0 w-64 h-64 bg-fuchsia-500/5 rounded-full blur-3xl pointer-events-none" />

            {/* Header */}
            <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50 px-4 py-3 flex items-center gap-3">
                <button
                    onClick={onBack}
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 transition-all text-slate-900 dark:text-white"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="flex-1">
                    <h1 className="font-bold text-slate-900 dark:text-white">Checkout</h1>
                    <p className="text-xs text-muted-foreground">
                        {venueName} {tableCode ? `• Table ${tableCode}` : ''}
                    </p>
                </div>
                {/* Step indicator */}
                <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-brand-primary" />
                    <div className="w-2.5 h-2.5 rounded-full bg-brand-primary" />
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-200 dark:bg-slate-700" />
                </div>
            </header>

            {/* Content */}
            <main className="flex-1 px-4 py-6 space-y-6 pb-32">
                {/* Order Summary - Compact */}
                <section>
                    <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-3 px-1">Your Order</h2>
                    <GlassCard className="p-0 overflow-hidden" depth="1">
                        <div className="divide-y divide-slate-100 dark:divide-slate-800">
                            {items.map(item => (
                                <div key={item.id} className="flex justify-between py-3 px-4">
                                    <span className="text-slate-700 dark:text-slate-200">
                                        <span className="font-bold text-slate-900 dark:text-white">{item.quantity}×</span> {item.name}
                                    </span>
                                    <span className="font-bold text-slate-900 dark:text-white">€{(item.price * item.quantity).toFixed(2)}</span>
                                </div>
                            ))}
                        </div>
                        <div className="bg-slate-50/50 dark:bg-slate-800/50 px-4 py-3 border-t border-slate-100 dark:border-slate-800/50 space-y-1">
                            <div className="flex justify-between text-sm text-muted-foreground">
                                <span>Subtotal</span>
                                <span>€{subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm text-muted-foreground">
                                <span>VAT (18%)</span>
                                <span>€{tax.toFixed(2)}</span>
                            </div>
                        </div>
                    </GlassCard>
                </section>

                {/* Payment Method - Radio style */}
                <section>
                    <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-3 px-1">Payment</h2>
                    <div className="space-y-3">
                        {PAYMENT_OPTIONS.map(opt => {
                            const Icon = opt.icon;
                            const isActive = paymentMethod === opt.id;
                            return (
                                <motion.button
                                    key={opt.id}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setPaymentMethod(opt.id)}
                                    className={cn(
                                        "w-full flex items-center gap-4 p-4 rounded-2xl transition-all border",
                                        isActive
                                            ? "bg-brand-primary/5 border-brand-primary shadow-sm ring-1 ring-brand-primary/20"
                                            : "bg-white dark:bg-slate-800 border-transparent hover:bg-slate-50 dark:hover:bg-slate-750 shadow-sm"
                                    )}
                                >
                                    <div className={cn(
                                        "w-12 h-12 rounded-xl flex items-center justify-center transition-colors",
                                        isActive ? "bg-brand-primary text-white" : "bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500"
                                    )}>
                                        <Icon className="w-6 h-6" />
                                    </div>
                                    <div className="flex-1 text-left">
                                        <p className={cn("font-bold transition-colors", isActive ? "text-brand-primary" : "text-slate-900 dark:text-white")}>
                                            {opt.label}
                                        </p>
                                        <p className="text-xs text-muted-foreground">{opt.description}</p>
                                    </div>
                                    <div className={cn(
                                        "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                                        isActive ? "border-brand-primary bg-brand-primary" : "border-slate-300 dark:border-slate-600"
                                    )}>
                                        {isActive && <Check className="w-3.5 h-3.5 text-white" />}
                                    </div>
                                </motion.button>
                            );
                        })}
                    </div>
                </section>

                {/* Special Requests */}
                <section>
                    <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-3 px-1">Notes (optional)</h2>
                    <GlassCard className="p-0 overflow-hidden" depth="1">
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Allergies, door codes, special requests..."
                            rows={3}
                            className="w-full bg-transparent border-none p-4 text-slate-900 dark:text-white placeholder:text-muted-foreground focus:ring-0 resize-none text-base"
                        />
                    </GlassCard>
                </section>
            </main>

            {/* Floating CTA */}
            <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-t border-slate-200/50 dark:border-slate-800/50 p-4 pb-safe-bottom">
                <Button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="w-full h-14 text-lg shadow-xl shadow-brand-primary/25 rounded-2xl"
                >
                    {submitting ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin mr-2" />
                            Processing...
                        </>
                    ) : (
                        <>
                            Pay €{total.toFixed(2)}
                            <ChevronRight className="w-5 h-5 ml-2 opacity-50" />
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}
