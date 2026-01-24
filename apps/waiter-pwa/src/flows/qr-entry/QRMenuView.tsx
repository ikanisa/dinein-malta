import { useState, useEffect } from 'react';
import { ChevronLeft, Plus } from 'lucide-react';
import { supabase } from '@/shared/services/supabase';
import { ProductModal } from '@/components/widgets/ProductModal';

interface MenuItem {
    id: number;
    name: string;
    price: number;
    description: string;
    category?: string;
    available?: boolean;
    image?: string;
    options?: unknown[]; // For modal compatibility
}

interface CartItem {
    id: number;
    name: string;
    price: number;
    quantity: number;
    // ... other cart fields
}

// Categories as simple tabs
const CATEGORIES = ['All', 'Starters', 'Mains', 'Drinks', 'Desserts'];

// Demo menu
const DEMO_MENU: MenuItem[] = [
    { id: 1, name: 'Traditional Rabbit Stew', price: 18.50, description: 'Slow cooked in wine & garlic', category: 'Mains', available: true, image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=300&q=80' },
    { id: 2, name: 'Ftira Għawdxija', price: 12.00, description: 'Gozo pizza, sundried tomato, tuna', category: 'Mains', available: true, image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=300&q=80' },
    { id: 3, name: 'Timpana', price: 14.00, description: 'Baked pasta in golden pastry', category: 'Mains', available: true },
    { id: 4, name: 'Aljotta', price: 9.50, description: 'Maltese fish soup with garlic', category: 'Starters', available: true },
    { id: 5, name: 'Bigilla', price: 6.00, description: 'Broad bean dip, parsley', category: 'Starters', available: true },
    { id: 6, name: 'Cisk Lager', price: 3.50, description: 'Local Maltese lager 0.5L', category: 'Drinks', available: true },
    { id: 7, name: 'Kinnie', price: 2.50, description: 'Bitter orange soft drink', category: 'Drinks', available: true },
    { id: 8, name: 'Imqaret', price: 4.50, description: 'Date-filled pastries', category: 'Desserts', available: true },
];

interface QRMenuViewProps {
    venueSlug: string;
    tableCode: string;
    cart: CartItem[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onAddToCart: (item: any, qty: number, options?: unknown) => void;
}

export function QRMenuView({ venueSlug, tableCode, cart, onAddToCart }: QRMenuViewProps) {
    const [venue, setVenue] = useState<{ name: string } | null>(null);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [loading, setLoading] = useState(true);
    const [selectedProduct, setSelectedProduct] = useState<MenuItem | null>(null);

    useEffect(() => {
        if (!venueSlug) return;
        async function loadVenue() {
            const { data } = await supabase
                .from('vendors')
                .select('id, name')
                .eq('slug', venueSlug)
                .single();
            if (data) setVenue(data);
            setLoading(false);
        }
        loadVenue();
    }, [venueSlug]);

    const getItemQty = (id: number) => cart.find(i => i.id === id)?.quantity || 0;

    const filteredMenu = selectedCategory === 'All'
        ? DEMO_MENU
        : DEMO_MENU.filter(m => m.category === selectedCategory);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 pb-32 animate-fade-in text-slate-900 font-sans">
            {/* Immersive Sticky Header */}
            <div className="sticky top-0 z-40 bg-white/85 backdrop-blur-xl border-b border-indigo-50/50 transition-all duration-300">
                <div className="px-4 py-3 flex items-center justify-between">
                    <button onClick={() => window.history.back()} className="p-2 -ml-2 hover:bg-slate-100 rounded-full transition-colors active:scale-95">
                        <ChevronLeft className="w-5 h-5 text-slate-700" />
                    </button>
                    <div className="text-center">
                        <h1 className="font-bold text-slate-900 text-sm leading-tight">{venue?.name || 'Menu'}</h1>
                        <p className="text-[10px] text-slate-500 font-medium tracking-wide uppercase">Table {tableCode}</p>
                    </div>
                    <div className="w-8" />
                </div>

                {/* Categories */}
                <div className="flex gap-2 px-4 pb-3 overflow-x-auto no-scrollbar scroll-smooth">
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-bold transition-all active:scale-95 border ${selectedCategory === cat
                                ? 'bg-slate-900 text-white border-transparent shadow-md'
                                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Menu List */}
            <main className="px-4 pt-4 space-y-4">
                {filteredMenu.map((item, idx) => {
                    const qty = getItemQty(item.id);

                    return (
                        <button
                            key={item.id}
                            onClick={() => setSelectedProduct(item)}
                            className="w-full bg-white rounded-2xl p-4 flex gap-4 text-left shadow-sm border border-transparent hover:border-indigo-100 transition-all active:scale-[0.99] group"
                            style={{ animationDelay: `${idx * 30}ms` }}
                        >
                            {/* Optional Image */}
                            {item.image && (
                                <div className="w-20 h-20 rounded-xl bg-slate-100 shrink-0 overflow-hidden">
                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                </div>
                            )}

                            <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                                <div>
                                    <h3 className="font-bold text-slate-900 leading-tight mb-1">{item.name}</h3>
                                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{item.description}</p>
                                </div>

                                <div className="flex items-end justify-between mt-3">
                                    <span className="font-bold text-indigo-600">€{item.price.toFixed(2)}</span>

                                    {qty > 0 ? (
                                        <div className="flex items-center gap-1.5 bg-indigo-50 px-2 py-1 rounded-lg border border-indigo-100" onClick={(e) => {
                                            e.stopPropagation(); // prevent modal opening if clicking counter directly? 
                                            // Actually, usually users want to open modal to edit options. 
                                            // But for +/- quick actions:
                                        }}>
                                            <div className="text-xs font-bold text-indigo-700 px-1">{qty}x</div>
                                        </div>
                                    ) : (
                                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                                            <Plus size={16} />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </button>
                    );
                })}
            </main>

            {/* Product Modal */}
            <ProductModal
                isOpen={!!selectedProduct}
                onClose={() => setSelectedProduct(null)}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                product={selectedProduct as any} // Cast for demo compatibility
                onAddToCart={(item, quantity, options) => {
                    onAddToCart(item, quantity, options);
                }}
            />
        </div>
    );
}
export default QRMenuView;
