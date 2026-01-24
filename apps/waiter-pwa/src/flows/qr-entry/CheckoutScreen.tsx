/**
 * CheckoutScreen - Stripe Checkout inspired
 * - Clean, focused single-task screen
 * - Floating CTA always visible
 * - Minimal form, no clutter
 * - Progress indicator
 */
import { useState } from 'react';
import { ChevronLeft, Check, CreditCard, Banknote, Smartphone, Loader2, ChevronRight } from 'lucide-react';

interface CartItem {
    id: number;
    name: string;
    price: number;
    quantity: number;
}

interface CheckoutScreenProps {
    items: CartItem[];
    venueName: string;
    tableCode: string;
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
        <div className="min-h-screen bg-white flex flex-col">
            {/* Header */}
            <header className="sticky top-0 z-30 bg-white border-b border-slate-100 px-4 py-3 flex items-center gap-3">
                <button
                    onClick={onBack}
                    className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-100 active:scale-95 transition-transform"
                >
                    <ChevronLeft className="w-5 h-5 text-slate-600" />
                </button>
                <div className="flex-1">
                    <h1 className="font-bold text-slate-900">Checkout</h1>
                    <p className="text-xs text-slate-500">{venueName} • Table {tableCode}</p>
                </div>
                {/* Step indicator */}
                <div className="flex gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-indigo-500" />
                    <div className="w-2 h-2 rounded-full bg-indigo-500" />
                    <div className="w-2 h-2 rounded-full bg-slate-200" />
                </div>
            </header>

            {/* Content */}
            <main className="flex-1 px-4 py-6 space-y-6 pb-32">
                {/* Order Summary - Compact */}
                <section>
                    <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-3">Your Order</h2>
                    <div className="space-y-2">
                        {items.map(item => (
                            <div key={item.id} className="flex justify-between py-2 border-b border-slate-50">
                                <span className="text-slate-700">
                                    <span className="font-bold text-slate-900">{item.quantity}×</span> {item.name}
                                </span>
                                <span className="font-bold text-slate-900">€{(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                        ))}
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-100 space-y-1">
                        <div className="flex justify-between text-sm text-slate-500">
                            <span>Subtotal</span>
                            <span>€{subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm text-slate-500">
                            <span>VAT (18%)</span>
                            <span>€{tax.toFixed(2)}</span>
                        </div>
                    </div>
                </section>

                {/* Payment Method - Radio style */}
                <section>
                    <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-3">Payment</h2>
                    <div className="space-y-2">
                        {PAYMENT_OPTIONS.map(opt => {
                            const Icon = opt.icon;
                            const isActive = paymentMethod === opt.id;
                            return (
                                <button
                                    key={opt.id}
                                    onClick={() => setPaymentMethod(opt.id)}
                                    className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all active:scale-[0.98] ${isActive
                                        ? 'bg-indigo-50 ring-2 ring-indigo-500'
                                        : 'bg-slate-50 hover:bg-slate-100'
                                        }`}
                                >
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isActive ? 'bg-indigo-500 text-white' : 'bg-white text-slate-400'
                                        }`}>
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1 text-left">
                                        <p className={`font-bold ${isActive ? 'text-indigo-700' : 'text-slate-700'}`}>
                                            {opt.label}
                                        </p>
                                        <p className="text-xs text-slate-500">{opt.description}</p>
                                    </div>
                                    {isActive && (
                                        <div className="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center">
                                            <Check className="w-4 h-4 text-white" />
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </section>

                {/* Special Requests - Optional */}
                <section>
                    <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-3">Notes (optional)</h2>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Allergies, special requests..."
                        rows={2}
                        className="w-full bg-slate-50 border-0 rounded-2xl px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 resize-none"
                    />
                </section>
            </main>

            {/* Floating CTA - Stripe style */}
            <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-100 p-4 pb-safe">
                <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold flex items-center justify-center gap-3 active:scale-[0.98] transition-all disabled:opacity-50 shadow-2xl shadow-indigo-500/30"
                >
                    {submitting ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Processing...
                        </>
                    ) : (
                        <>
                            Pay €{total.toFixed(2)}
                            <ChevronRight className="w-5 h-5" />
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
