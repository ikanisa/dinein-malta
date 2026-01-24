
import { useState } from 'react';
import { Minus, Plus, ShoppingBag } from 'lucide-react';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Button } from '@/components/ui/Button';

interface ProductOption {
    id: string;
    name: string;
    price?: number;
}

interface Product {
    id: string;
    name: string;
    description?: string;
    price: number;
    image?: string;
    options?: {
        name: string;
        choices: ProductOption[];
    }[];
}

interface ProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    product: Product | null;
    onAddToCart: (product: Product, quantity: number, options: unknown) => void;
}

export function ProductModal({ isOpen, onClose, product, onAddToCart }: ProductModalProps) {
    const [quantity, setQuantity] = useState(1);
    const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});

    if (!product) return null;

    const handleAddToCart = () => {
        onAddToCart(product, quantity, selectedOptions);
        onClose();
        setQuantity(1);
        setSelectedOptions({});
    };

    return (
        <BottomSheet isOpen={isOpen} onClose={onClose} title="Customize Item">
            <div className="space-y-6">
                {/* Product Header */}
                <div className="flex gap-4">
                    {product.image && (
                        <div className="w-24 h-24 rounded-2xl bg-slate-100 overflow-hidden shrink-0">
                            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                        </div>
                    )}
                    <div className="flex-1">
                        <h3 className="text-xl font-bold text-slate-900 leading-tight mb-1">{product.name}</h3>
                        <p className="text-slate-500 text-sm leading-relaxed mb-2 line-clamp-2">{product.description}</p>
                        <span className="text-lg font-bold text-indigo-600">€{product.price.toFixed(2)}</span>
                    </div>
                </div>

                {/* Options (Mock) */}
                {product.options?.map((opt) => (
                    <div key={opt.name} className="space-y-3">
                        <h4 className="font-bold text-slate-900 text-sm uppercase tracking-wide">{opt.name}</h4>
                        <div className="space-y-2">
                            {opt.choices.map((choice) => (
                                <label key={choice.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-indigo-200 hover:bg-indigo-50/50 transition-colors cursor-pointer group">
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="radio"
                                            name={opt.name}
                                            value={choice.id}
                                            className="w-4 h-4 text-indigo-600 border-slate-300 focus:ring-indigo-500"
                                            onChange={() => setSelectedOptions(prev => ({ ...prev, [opt.name]: choice.id }))}
                                            checked={selectedOptions[opt.name] === choice.id}
                                        />
                                        <span className="text-sm font-medium text-slate-700 group-hover:text-indigo-900">{choice.name}</span>
                                    </div>
                                    {choice.price && (
                                        <span className="text-xs font-semibold text-slate-500">+€{choice.price.toFixed(2)}</span>
                                    )}
                                </label>
                            ))}
                        </div>
                    </div>
                ))}

                {/* Quantity & Action */}
                <div className="pt-4 flex items-center gap-4">
                    <div className="flex items-center gap-3 bg-slate-100 rounded-xl p-1">
                        <button
                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                            className="w-10 h-10 flex items-center justify-center rounded-lg bg-white shadow-sm text-slate-600 active:scale-95 transition-transform"
                        >
                            <Minus size={16} />
                        </button>
                        <span className="w-8 text-center font-bold text-slate-900">{quantity}</span>
                        <button
                            onClick={() => setQuantity(quantity + 1)}
                            className="w-10 h-10 flex items-center justify-center rounded-lg bg-white shadow-sm text-indigo-600 active:scale-95 transition-transform"
                        >
                            <Plus size={16} />
                        </button>
                    </div>

                    <Button
                        className="flex-1 h-12 text-base shadow-lg shadow-indigo-500/30"
                        onClick={handleAddToCart}
                    >
                        <ShoppingBag className="w-5 h-5 mr-2" />
                        Add to Cart - €{(product.price * quantity).toFixed(2)}
                    </Button>
                </div>
            </div>
        </BottomSheet>
    );
}
