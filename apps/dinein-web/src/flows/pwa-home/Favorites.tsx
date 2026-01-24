import { useState, useEffect } from 'react';
import { Heart, Star, Clock, Trash2, ChevronRight, Plus } from 'lucide-react';
import { supabase } from '@/shared/services/supabase';

interface FavoriteVenue {
    id: string;
    name: string;
    cuisine?: string;
    photos_json?: string[];
    rating?: number;
}

export function Favorites() {
    const [favorites, setFavorites] = useState<FavoriteVenue[]>([]);
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
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                setFavorites(data.map((f: any) => f.venue));
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    const removeFavorite = (id: string) => {
        setFavorites(prev => prev.filter(f => f.id !== id));
    };

    return (
        <div className="min-h-screen bg-slate-50 animate-fade-in pb-24">
            {/* Header */}
            <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-slate-100 px-5 py-4">
                <h1 className="text-xl font-bold text-slate-900">Saved</h1>
                <p className="text-sm text-slate-500">Your favorite restaurants</p>
            </div>

            {loading ? (
                <div className="p-5 space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="bg-white rounded-3xl p-4 flex gap-4 animate-pulse">
                            <div className="w-20 h-20 bg-slate-200 rounded-2xl" />
                            <div className="flex-1 space-y-2 py-2">
                                <div className="h-5 bg-slate-200 rounded w-3/4" />
                                <div className="h-4 bg-slate-200 rounded w-1/2" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : favorites.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 px-5 text-center">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-red-100 to-pink-100 flex items-center justify-center mb-5">
                        <Heart className="w-12 h-12 text-red-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-700 mb-2">No favorites yet</h3>
                    <p className="text-sm text-slate-500 mb-6 max-w-xs">
                        Tap the heart icon on any restaurant to save it here
                    </p>
                    <button className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold text-sm shadow-lg shadow-emerald-500/20 active:scale-95 transition-transform flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        Explore Restaurants
                    </button>
                </div>
            ) : (
                <div className="p-5 space-y-4">
                    <p className="text-sm text-slate-500">{favorites.length} saved restaurants</p>
                    {favorites.map((venue, index) => (
                        <FavoriteCard
                            key={venue.id}
                            venue={venue}
                            onRemove={() => removeFavorite(venue.id)}
                            style={{ animationDelay: `${index * 50}ms` }}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

function FavoriteCard({ venue, onRemove, style }: {
    venue: FavoriteVenue;
    onRemove: () => void;
    style?: React.CSSProperties;
}) {
    const hasImage = venue.photos_json && venue.photos_json.length > 0;

    return (
        <div
            className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100 animate-fade-in-up"
            style={style}
        >
            <div className="flex gap-4 p-4">
                {/* Image */}
                <div className="w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0 relative">
                    {hasImage ? (
                        <img
                            src={venue.photos_json![0]}
                            alt={venue.name}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white text-2xl font-bold">
                            {venue.name.charAt(0)}
                        </div>
                    )}

                    {/* Heart */}
                    <div className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow">
                        <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                    <div>
                        <h3 className="font-bold text-slate-900 truncate mb-0.5">{venue.name}</h3>
                        <p className="text-sm text-slate-500">{venue.cuisine || 'Mediterranean'}</p>
                    </div>

                    <div className="flex items-center gap-3 text-slate-500">
                        <div className="flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            <span className="text-xs font-bold text-slate-700">{venue.rating || 4.5}</span>
                        </div>
                        <span className="text-xs">•</span>
                        <div className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            <span className="text-xs">25-35 min</span>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col justify-between items-end py-1">
                    <button
                        onClick={onRemove}
                        className="p-2 rounded-xl hover:bg-red-50 transition-colors group"
                    >
                        <Trash2 className="w-4 h-4 text-slate-300 group-hover:text-red-400" />
                    </button>
                    <button className="px-3 py-2 rounded-xl bg-emerald-500 text-white text-xs font-semibold shadow-sm active:scale-95 transition-transform flex items-center gap-1">
                        Order
                        <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
