import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../shared/services/supabase';

export interface MenuItem {
    id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    is_available: boolean;
    image_url?: string;
    emoji?: string; // Client-side helper
}

export function useVendorMenu() {
    const [items, setItems] = useState<MenuItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [vendorId, setVendorId] = useState<string | null>(null);

    // Emoji mapping helper
    const getCategoryEmoji = (category: string) => {
        const map: Record<string, string> = {
            starters: '🥗',
            mains: '🍝',
            desserts: '🍰',
            drinks: '🍹',
            alcohol: '🍺',
            pizza: '🍕',
            burgers: '🍔',
            sushi: '🍣',
        };
        return map[category.toLowerCase()] || '🍽️';
    };

    const fetchMenu = useCallback(async () => {
        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                setError('No user logged in');
                setLoading(false);
                return;
            }

            // 1. Get Vendor ID
            const { data: vendorUser, error: vendorError } = await supabase
                .from('vendor_users')
                .select('vendor_id')
                .eq('auth_user_id', user.id)
                .maybeSingle();

            if (vendorError || !vendorUser) {
                setError('No vendor profile found for this user');
                setLoading(false);
                return;
            }

            setVendorId(vendorUser.vendor_id);

            // 2. Get Menu Items
            const { data: menuData, error: menuError } = await supabase
                .from('menu_items')
                .select('*')
                .eq('vendor_id', vendorUser.vendor_id)
                .order('category', { ascending: true });

            if (menuError) throw menuError;

            // Transform for UI
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const formatted: MenuItem[] = (menuData || []).map((item: any) => ({
                id: item.id,
                name: item.name,
                description: item.description || '',
                price: item.price,
                category: item.category || 'other',
                is_available: item.is_available,
                image_url: item.image_url,
                emoji: getCategoryEmoji(item.category || 'other')
            }));

            setItems(formatted);

        } catch (err: unknown) {
            console.error('Error fetching menu:', err);
            const message = err instanceof Error ? err.message : 'Unknown error';
            setError(message);
        } finally {
            setLoading(false);
        }
    }, []); // Stable dependency

    useEffect(() => {
        fetchMenu();
    }, [fetchMenu]);

    const addItem = async (newItem: Partial<MenuItem>) => {
        if (!vendorId) return;
        try {
            const { error } = await supabase.from('menu_items').insert({
                vendor_id: vendorId,
                name: newItem.name,
                price: newItem.price,
                category: newItem.category,
                is_available: true,
                // description and image_url optional
            });
            if (error) throw error;
            await fetchMenu(); // Refresh
        } catch (err: unknown) {
            console.error('Error adding item:', err);
            throw err;
        }
    };

    const toggleAvailability = async (id: string, currentStatus: boolean) => {
        try {
            // Optimistic update
            setItems(prev => prev.map(i => i.id === id ? { ...i, is_available: !currentStatus } : i));

            const { error } = await supabase
                .from('menu_items')
                .update({ is_available: !currentStatus })
                .eq('id', id);

            if (error) {
                // Revert
                setItems(prev => prev.map(i => i.id === id ? { ...i, is_available: currentStatus } : i));
                throw error;
            }
        } catch (err) {
            console.error('Error toggling availability:', err);
        }
    };

    const deleteItem = async (id: string) => {
        try {
            const { error } = await supabase.from('menu_items').delete().eq('id', id);
            if (error) throw error;
            setItems(prev => prev.filter(i => i.id !== id));
        } catch (err: unknown) {
            console.error('Error deleting item:', err);
            throw err;
        }
    };

    return {
        items,
        loading,
        error,
        addItem,
        toggleAvailability,
        deleteItem,
        refresh: fetchMenu
    };
}
