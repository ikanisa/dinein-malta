import { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { supabase } from '@/shared/services/supabase';
import { Button } from '@/components/ui/Button';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { VenueCard } from '@/components/widgets/VenueCard';
import { SectionHeader } from '@/components/widgets/SectionHeader';

interface Venue {
    id: string;
    name: string;
    address?: string;
    cuisine?: string;
    photos_json?: string[];
    distance_meters?: number;
    rating?: number;
}

const CUISINES = [
    { id: 'all', name: 'All', emoji: '' },
    { id: 'maltese', name: 'Maltese', emoji: '🇲🇹' },
    { id: 'italian', name: 'Italian', emoji: '🍝' },
    { id: 'seafood', name: 'Seafood', emoji: '🦐' },
    { id: 'mediterranean', name: 'Mediterranean', emoji: '🫒' },
    { id: 'asian', name: 'Asian', emoji: '🍜' },
    { id: 'pizza', name: 'Pizza', emoji: '🍕' },
    { id: 'fine-dining', name: 'Fine Dining', emoji: '🥂' },
];

export function VenueDiscovery() {
    const [venues, setVenues] = useState<Venue[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCuisine, setSelectedCuisine] = useState('all');
    const [favorites, setFavorites] = useState<string[]>([]);
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        if ('geolocation' in navigator) {
            setLoading(true);
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    await fetchVenues(latitude, longitude);
                },
                () => {
                    setError("Could not get location");
                    fetchVenues(35.9375, 14.3754);
                }
            );
        } else {
            fetchVenues(35.9375, 14.3754);
        }
    }, []);

    async function fetchVenues(lat: number, lng: number) {
        try {
            let countryFilter = localStorage.getItem('dinein_country_code');
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('country_code')
                    .eq('auth_user_id', session.user.id)
                    .single();
                if (profile?.country_code) {
                    countryFilter = profile.country_code;
                }
            }

            const { data, error } = await supabase.rpc('search_nearby_venues', {
                lat,
                long: lng,
                radius_meters: 5000,
                filter_country_code: countryFilter || undefined
            });

            if (error) throw error;
            setVenues(data || []);
        } catch {
            setError("Failed to load venues");
        } finally {
            setLoading(false);
        }
    }

    const toggleFavorite = (id: string) => {
        setFavorites(prev =>
            prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
        );
    };

    const filteredVenues = venues.filter(v => {
        const matchesSearch = v.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCuisine = selectedCuisine === 'all' || v.cuisine?.toLowerCase().includes(selectedCuisine);
        return matchesSearch && matchesCuisine;
    });

    return (
        <div className="pb-28 animate-fade-in font-sans text-slate-900">
            {/* Sticky Search & Filters (Below App Header) */}
            <div className="sticky top-[56px] z-30 bg-white/85 backdrop-blur-xl pt-2 pb-2 border-b border-indigo-100/50 shadow-sm -mx-4 px-4 mb-4">
                <div className="flex items-center gap-3 mb-3">
                    {/* Search Bar */}
                    <div className="flex-1 flex items-center gap-3 bg-white hover:bg-white/80 transition-all rounded-2xl px-4 py-3 shadow-sm ring-1 ring-slate-200/50 focus-within:ring-2 focus-within:ring-indigo-500/20 group">
                        <Search className="w-4.5 h-4.5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search venues..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="flex-1 bg-transparent text-slate-900 placeholder:text-slate-400 outline-none text-sm font-medium leading-relaxed"
                            enterKeyHint="search"
                        />
                        {searchQuery && (
                            <button onClick={() => setSearchQuery('')} className="p-1 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors">
                                <X className="w-3 h-3 text-slate-600" />
                            </button>
                        )}
                    </div>

                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`p-3 rounded-2xl border transition-all active:scale-95 ${showFilters ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/20' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                    >
                        <SlidersHorizontal className="w-5 h-5" />
                    </button>
                </div>

                {/* Cuisine Filter Scroll */}
                <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-1 snap-x">
                    {CUISINES.map(cuisine => (
                        <button
                            key={cuisine.id}
                            onClick={() => setSelectedCuisine(cuisine.id)}
                            className={`snap-start shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold border transition-all active:scale-95 ${selectedCuisine === cuisine.id
                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-500/25'
                                : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-200 hover:bg-indigo-50 shadow-sm'
                                }`}
                        >
                            <span>{cuisine.emoji}</span>
                            <span>{cuisine.name}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="mx-6 mt-4 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 text-sm">
                    {error}
                </div>
            )}

            {/* Results Header */}
            <SectionHeader
                title="Nearby Restaurants"
                count={filteredVenues.length}
                className="mt-6 mx-4"
            />

            {/* Loading */}
            {loading ? (
                <div className="p-6 space-y-4">
                    {[1, 2, 3].map(i => <CardSkeleton key={i} />)}
                </div>
            ) : filteredVenues.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
                    <div className="w-16 h-16 rounded-full bg-indigo-50 flex items-center justify-center mb-4">
                        <Search className="w-8 h-8 text-indigo-300" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-1">No restaurants found</h3>
                    <p className="text-sm text-slate-500 mb-4">Try adjusting your search or filters</p>
                    <Button variant="secondary" onClick={() => { setSearchQuery(''); setSelectedCuisine('all'); }}>
                        Clear Filters
                    </Button>
                </div>
            ) : (
                <div className="p-4 space-y-3">
                    {filteredVenues.map((venue, index) => (
                        <VenueCard
                            key={venue.id}
                            id={venue.id}
                            name={venue.name}
                            variant="list"
                            rating={venue.rating}
                            tags={venue.cuisine ? [venue.cuisine] : []}
                            image={venue.photos_json?.[0]}
                            distance={venue.distance_meters
                                ? venue.distance_meters < 1000
                                    ? `${Math.round(venue.distance_meters)}m`
                                    : `${(venue.distance_meters / 1000).toFixed(1)}km`
                                : '1.2km'
                            }
                            onClick={() => { }}
                            isFavorite={favorites.includes(venue.id)}
                            onToggleFavorite={(e) => {
                                e.stopPropagation();
                                toggleFavorite(venue.id);
                            }}
                            className="animate-fade-in-up"
                            style={{ animationDelay: `${index * 50}ms` }}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
