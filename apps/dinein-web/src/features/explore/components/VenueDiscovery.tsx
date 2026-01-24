import { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, Map as MapIcon, List as ListIcon } from 'lucide-react';
import { supabase } from '@/shared/services/supabase';
import { Button } from '@/components/ui/Button';

import { RestaurantListSkeleton } from '@/components/skeletons/RestaurantCardSkeleton';
import { VenueCard } from '@/components/widgets/VenueCard';
import { SectionHeader } from '@/components/widgets/SectionHeader';
import { CategoryFilter } from '@/components/widgets/CategoryFilter';
import { MapView } from '@/components/widgets/MapView';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useOutletContext } from 'react-router-dom';
import { Input } from '@/components/ui/Input';

interface Venue {
    id: string;
    name: string;
    address?: string;
    cuisine?: string;
    photos_json?: string[];
    distance_meters?: number;
    rating?: number;
}

interface VenueDiscoveryContext {
    setSelectedVenue: (venue: Venue) => void;
}

export function VenueDiscovery() {
    const context = useOutletContext<VenueDiscoveryContext>();
    const onVenueClick = context?.setSelectedVenue;
    const [venues, setVenues] = useState<Venue[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCuisine, setSelectedCuisine] = useState('all');
    const [favorites, setFavorites] = useState<string[]>([]);
    const [showFilters, setShowFilters] = useState(false);
    const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

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
            <div className="sticky top-[56px] z-30 pt-2 pb-2 -mx-4 px-4 mb-4">
                <div className="absolute inset-0 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-white/20 dark:border-white/5 shadow-sm" />

                <div className="relative space-y-3">
                    <div className="flex items-center gap-3">
                        <div className="relative w-full">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
                            <Input
                                value={searchQuery}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                                placeholder="Search venues, cuisines..."
                                className="pl-9 bg-white/60 dark:bg-slate-800/60 border-white/40 backdrop-blur-md"
                            />
                        </div>

                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setShowFilters(!showFilters)}
                            className={cn(
                                "p-3.5 rounded-2xl border transition-all duration-300 shadow-sm backdrop-blur-md",
                                showFilters
                                    ? "bg-brand-primary text-white border-brand-primary shadow-lg shadow-brand-primary/25"
                                    : "bg-white/60 dark:bg-slate-800/60 border-white/40 dark:border-slate-700/50 text-slate-600 dark:text-slate-300 hover:bg-white/80"
                            )}
                        >
                            <SlidersHorizontal className="w-5 h-5" />
                        </motion.button>
                    </div>

                    {/* Cuisine Filter Scroll */}
                    <CategoryFilter
                        selectedId={selectedCuisine}
                        onSelect={setSelectedCuisine}
                    />
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="mx-6 mt-4 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 text-sm">
                    {error}
                </div>
            )}

            {/* View Toggle FAB */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setViewMode(prev => prev === 'list' ? 'map' : 'list')}
                className="fixed bottom-24 right-5 z-40 h-14 w-14 rounded-full bg-brand-primary text-white shadow-lg shadow-brand-primary/30 flex items-center justify-center pointer-events-auto"
            >
                {viewMode === 'list' ? <MapIcon className="w-6 h-6" /> : <ListIcon className="w-6 h-6" />}
            </motion.button>

            {/* Map View */}
            {viewMode === 'map' && (
                <div className="fixed inset-0 z-0 top-[110px] bg-slate-100 dark:bg-slate-900">
                    <MapView
                        venues={filteredVenues}
                        onVenueClick={(v) => onVenueClick?.(v)}
                    />
                </div>
            )}

            {/* List View */}
            {viewMode === 'list' && (
                <>
                    {/* Results Header */}
                    <SectionHeader
                        title="Nearby Restaurants"
                        count={filteredVenues.length}
                        className="mt-6 mx-4"
                    />

                    {/* Loading */}
                    {loading ? (
                        <RestaurantListSkeleton />
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
                                    onClick={() => onVenueClick?.(venue)}
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
                </>
            )}
        </div>
    );
}
