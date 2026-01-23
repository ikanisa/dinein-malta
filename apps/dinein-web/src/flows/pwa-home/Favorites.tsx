import { useState, useEffect } from 'react';
import { supabase } from '@/shared/services/supabase';

export function Favorites() {
    const [favorites, setFavorites] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchFavorites();
    }, []);

    async function fetchFavorites() {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.user) {
                setLoading(false);
                return;
            }

            const { data } = await supabase
                .from('user_favorites')
                .select('venue:venues(*)')
                .eq('user_id', session.user.id);

            if (data) {
                setFavorites(data.map((f: any) => f.venue));
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    if (loading) return <div className="p-6">Loading favorites...</div>;

    return (
        <div className="p-6 pb-24 animate-in fade-in">
            <h1 className="text-2xl font-bold mb-6">Your Favorites</h1>

            {favorites.length === 0 ? (
                <div className="text-center py-10 text-gray-500 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                    <p>No favorites yet</p>
                    <button className="mt-4 text-green-600 font-bold">Discover Venues</button>
                </div>
            ) : (
                <div className="space-y-4">
                    {favorites.map((venue: any) => (
                        <div key={venue.id} className="bg-white border p-4 rounded-xl flex justify-between items-center shadow-sm">
                            <div className="font-bold">{venue.name}</div>
                            <button className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">
                                Order
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
