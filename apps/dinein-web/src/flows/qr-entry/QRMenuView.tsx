import { useState, useEffect } from 'react';
import { supabase } from '@/shared/services/supabase';

// Mock data for development
const MOCK_MENU = [
    { id: 1, name: 'Traditional Rabbit Stew', price: 18.50, description: 'Slow cooked rabbit in wine and garlic sauce' },
    { id: 2, name: 'Ftira Għawdxija', price: 12.00, description: 'Gozo styling pizza with potatoes and tuna' },
    { id: 3, name: 'Cisk Lager', price: 3.50, description: 'Local Maltese beer (0.5L)' },
];

export function QRMenuView({ venueSlug, tableCode }: { venueSlug: string; tableCode: string }) {
    const [cart, setCart] = useState<{ item: any, qty: number }[]>([]);
    const [venue, setVenue] = useState<any>(null);

    // Fetch venue and set user country preference
    useEffect(() => {
        // Skip if using mock slug during dev/test if needed, but here we assume real usage
        if (!venueSlug) return;

        async function loadVenue() {
            // 1. Fetch Venue Details
            const { data: venueData } = await supabase
                .from('vendors')
                .select('id, name, country')
                .eq('slug', venueSlug)
                .single();

            if (venueData) {
                setVenue(venueData);

                // 2. Set User Country Preference
                const countryCode = venueData.country || 'MLT';

                // Check auth
                const { data: { session } } = await supabase.auth.getSession();
                if (session?.user) {
                    await supabase
                        .from('profiles')
                        .update({ country_code: countryCode })
                        .eq('auth_user_id', session.user.id);
                } else {
                    localStorage.setItem('dinein_country_code', countryCode);
                }
            }
        }
        loadVenue(); // Only run once on mount per venue
    }, [venueSlug]);



    const addToCart = (item: any) => {
        setCart(prev => {
            const existing = prev.find(i => i.item.id === item.id);
            if (existing) {
                return prev.map(i => i.item.id === item.id ? { ...i, qty: i.qty + 1 } : i);
            }
            return [...prev, { item, qty: 1 }];
        });
    };

    const total = cart.reduce((sum, i) => sum + (i.item.price * i.qty), 0);

    return (
        <div className="min-h-screen bg-white pb-24 font-sans text-gray-900">
            {/* Header */}
            <div className="px-4 py-6 border-b border-gray-100">
                <h1 className="text-xl font-bold tracking-tight">{venue?.name || "Loading..."}</h1>
                <p className="text-sm text-gray-500">Table {tableCode}</p>
            </div>

            {/* Menu List */}
            <div className="divide-y divide-gray-50">
                {MOCK_MENU.map(item => (
                    <div key={item.id}
                        className="p-4 flex justify-between items-start active:bg-gray-50 transition-colors"
                        onClick={() => addToCart(item)}>
                        <div className="pr-4">
                            <h3 className="font-semibold text-lg">{item.name}</h3>
                            <p className="text-gray-600 text-sm mt-1 leading-relaxed">{item.description}</p>
                            <div className="mt-2 font-bold">€{item.price.toFixed(2)}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Floating Order Button */}
            {cart.length > 0 && (
                <div className="fixed bottom-6 left-4 right-4 animate-in slide-in-from-bottom duration-300">
                    <button className="w-full bg-green-600 text-white py-4 px-6 rounded-2xl shadow-xl flex justify-between items-center font-bold text-lg active:scale-95 transition-transform">
                        <span>Review Order ({cart.reduce((a, b) => a + b.qty, 0)})</span>
                        <span>€{total.toFixed(2)}</span>
                    </button>
                </div>
            )}
        </div>
    );
}
