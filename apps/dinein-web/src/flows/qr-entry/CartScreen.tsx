import { ChevronLeft, ShoppingBag } from 'lucide-react';
import { QuantitySelector } from '@/shared/components/QuantitySelector';

interface CartItem {
    id: number;
    name: string;
    price: number;
    quantity: number;
    image?: string;
}

interface CartScreenProps {
    items: CartItem[];
    venueName: string;
    tableCode: string;
    onBack: () => void;
    onCheckout: () => void;
    onUpdateQuantity: (itemId: number, delta: number) => void;
    onRemoveItem: (itemId: number) => void;
}

export function CartScreen({
    items,
    venueName,
    tableCode,
    onBack,
    onCheckout,
    onUpdateQuantity,
    onRemoveItem,
}: CartScreenProps) {
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const taxRate = 0.18; // 18% VAT in Malta
    const tax = subtotal * taxRate;
    const total = subtotal + tax;
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);


    return (
        <div className="min-h-screen bg-slate-50 pb-safe">
            {/* Header */}
            <div className="sticky top-0 z-30 bg-white border-b border-slate-100 px-4 py-3 flex items-center gap-3">
                <button
                    onClick={onBack}
                    className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-100 active:scale-95 transition-transform"
                    aria-label="Go back"
                >
                    <ChevronLeft className="w-5 h-5 text-slate-600" />
                </button>
                <div className="flex-1">
                    <h1 className="font-bold text-slate-900">Cart</h1>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span>{venueName}</span>
                        <span>•</span>
                        <span>Table {tableCode}</span>
                    </div>
                </div>
                {itemCount > 0 && (
                    <div className="px-3 py-1 bg-slate-900 rounded-full text-white text-xs font-bold">
                        {itemCount} items
                    </div>
                )}
            </div>

            {/* Empty State */}
            {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 px-5 text-center">
                    <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                        <ShoppingBag className="w-8 h-8 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">Cart is empty</h3>
                    <p className="text-sm text-slate-500 mb-8 max-w-[200px]">
                        Add items from the menu to start your order
                    </p>
                    <button
                        onClick={onBack}
                        className="px-6 py-3 rounded-full bg-slate-900 text-white font-bold text-sm shadow-xl shadow-slate-900/10 active:scale-95 transition-transform"
                    >
                        Browse Menu
                    </button>
                </div>
            ) : (
                <>
                    <div className="px-4 py-4 space-y-4 pb-32">
                        {/* Cart Items List */}
                        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100">
                            {items.map((item, index) => (
                                <div
                                    key={item.id}
                                    className={`p-4 flex gap-4 ${index !== items.length - 1 ? 'border-b border-slate-50' : ''}`}
                                >
                                    {/* No Image - Text First Clean Look */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-bold text-slate-900 text-sm leading-tight pr-4">{item.name}</h3>
                                            <p className="font-bold text-slate-900 text-sm">€{item.price.toFixed(2)}</p>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3 bg-slate-50 rounded-full px-2 py-1">
                                                <QuantitySelector
                                                    value={item.quantity}
                                                    onIncrement={() => onUpdateQuantity(item.id, item.quantity + 1)}
                                                    onDecrement={() => onUpdateQuantity(item.id, item.quantity - 1)}
                                                />
                                            </div>
                                            <button
                                                onClick={() => onRemoveItem(item.id)}
                                                className="text-xs font-semibold text-slate-400 hover:text-rose-500 px-2 py-1"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Order Summary */}
                        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Subtotal</span>
                                <span className="font-medium text-slate-900">€{subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">VAT (18%)</span>
                                <span className="font-medium text-slate-900">€{tax.toFixed(2)}</span>
                            </div>
                            <div className="border-t border-slate-100 pt-3 flex justify-between items-center">
                                <span className="font-bold text-slate-900">Total</span>
                                <span className="font-bold text-slate-900 text-xl">€{total.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Fixed Bottom CTA */}
                    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-100 p-4 pb-safe animate-slide-up">
                        <button
                            onClick={onCheckout}
                            className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold shadow-xl shadow-indigo-500/30 active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
                        >
                            <span>Checkout</span>
                            <span className="w-1 h-1 rounded-full bg-white/40" />
                            <span>€{total.toFixed(2)}</span>
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
