import { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { supabase } from '@/shared/services/supabase';
import { Button } from '@/components/ui/Button';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { VenueCard } from '@/components/widgets/VenueCard';
import { SectionHeader } from '@/components/widgets/SectionHeader';
import { StatCard } from '@/components/widgets/StatCard';
import { QuickActions } from '@/components/widgets/QuickActions';
import { PromoCard } from '@/components/widgets/PromoCard';

interface Venue {
    id: string;
    name: string;
    slug: string;
    address?: string;
    rating?: number;
    review_count?: number;
    delivery_time_min?: number;
    delivery_time_max?: number;
    delivery_fee?: number;
    tags?: string[];
}

const CATEGORIES = ['All', 'Bars', 'Restaurants', 'Cafés', 'Fast Food', 'Dessert'];

export function HomeScreen() {
    const [venues, setVenues] = useState<Venue[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');

    useEffect(() => {
        loadVenues();
    }, []);

    async function loadVenues() {
        setLoading(true);
        try {
            const countryCode = localStorage.getItem('dinein_country_code') || 'MT';
            const { data } = await supabase
                .from('vendors')
                .select('id, name, slug, address, rating, review_count')
                .eq('status', 'active')
                .eq('country', countryCode)
                .limit(50);

            // Transform data to include mock UI fields for the "Premium" look
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const enhancedData = (data || []).map((v: any) => ({
                ...v,
                delivery_time_min: 15 + Math.floor(Math.random() * 20),
                delivery_time_max: 35 + Math.floor(Math.random() * 20),
                delivery_fee: Math.random() > 0.5 ? 0 : 2.50,
                tags: ['Italian', 'Pizza', 'Comfort'].slice(0, 1 + Math.floor(Math.random() * 2))
            }));

            setVenues(enhancedData);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }

    const filteredVenues = venues.filter(v =>
        v.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        (selectedCategory === 'All' || (v.tags?.includes(selectedCategory) ?? true))
    );

    const featuredVenues = venues.filter(v => (v.rating || 0) >= 4.5).slice(0, 5);
    const nearbyVenues = filteredVenues;


    const navigateToVenue = (slug: string) => {
        window.location.href = `/m/${slug}`;
    };

    return (
        <div className="pb-8 font-sans text-slate-900">
            {/* Search Section (Moved from Header) */}
            <div className="px-4 py-2 sticky top-[56px] z-30 bg-slate-50/95 backdrop-blur-md pb-2 -mx-4 mb-2">
                <div className="px-4">
                    <div className="flex items-center gap-3 bg-white hover:bg-white/80 transition-all rounded-2xl px-4 py-3 shadow-sm ring-1 ring-slate-200/50 focus-within:ring-2 focus-within:ring-indigo-500/20 group">
                        <Search className="w-4.5 h-4.5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Find restaurants, food, drinks..."
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
                </div>
            </div>

            {/* Sticky Categories */}
            <div className="sticky top-[120px] z-30 bg-slate-50/95 backdrop-blur-md pt-0 pb-1 border-b border-indigo-100/50 shadow-sm">
                <div className="flex gap-2.5 px-4 pb-3 overflow-x-auto no-scrollbar scroll-smooth snap-x">
                    {CATEGORIES.map((cat, idx) => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            style={{ animationDelay: `${idx * 50}ms` }}
                            className={`snap-start shrink-0 px-5 py-2.5 rounded-full text-xs font-bold transition-all duration-300 active:scale-95 border animate-fade-in-up ${selectedCategory === cat
                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25 border-transparent'
                                : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-200 hover:bg-indigo-50 shadow-sm'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            <main className="px-4 py-5 space-y-6">
                {/* Dashboard Widgets */}
                {!searchQuery && (
                    <section className="space-y-4 animate-fade-in">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <StatCard />
                            <PromoCard />
                        </div>
                        <QuickActions />
                    </section>
                )}

                {/* Featured Section */}
                {!loading && featuredVenues.length > 0 && !searchQuery && (
                    <section className="animate-fade-in">
                        <SectionHeader
                            title="Featured Favorites"
                            actionLabel="See all"
                            onAction={() => { }}
                            className="mb-4"
                        />
                        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 -mx-4 px-4 snap-x">
                            {featuredVenues.map((venue) => (
                                <VenueCard
                                    key={`featured-${venue.id}`}
                                    id={venue.id}
                                    name={venue.name}
                                    variant="featured"
                                    rating={venue.rating}
                                    deliveryTimeMin={venue.delivery_time_min}
                                    deliveryTimeMax={venue.delivery_time_max}
                                    deliveryFee={venue.delivery_fee}
                                    tags={venue.tags}
                                    onClick={() => navigateToVenue(venue.slug)}
                                    className="snap-start"
                                />
                            ))}
                        </div>
                    </section>
                )}

                {/* Nearby / All Venues */}
                <section>
                    <SectionHeader
                        title={searchQuery ? `Searching "${searchQuery}"` : 'All Restaurants'}
                        count={nearbyVenues.length}
                        className="mb-4"
                    />

                    {loading ? (
                        <div className="space-y-4">
                            {[1, 2, 3].map(i => <CardSkeleton key={i} />)}
                        </div>
                    ) : nearbyVenues.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
                            <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
                                <Search className="w-8 h-8 text-indigo-300" />
                            </div>
                            <h3 className="font-bold text-slate-900 mb-1">No places found</h3>
                            <p className="text-slate-500 text-sm mb-6 max-w-[200px]">
                                We couldn't find anything matching your search.
                            </p>
                            <Button color="secondary" onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}>
                                Clear Filters
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-4 pb-8">
                            {nearbyVenues.map((venue, idx) => (
                                <VenueCard
                                    key={venue.id}
                                    id={venue.id}
                                    name={venue.name}
                                    variant="list"
                                    rating={venue.rating}
                                    reviewCount={venue.review_count}
                                    deliveryTimeMin={venue.delivery_time_min}
                                    deliveryTimeMax={venue.delivery_time_max}
                                    deliveryFee={venue.delivery_fee}
                                    tags={venue.tags}
                                    onClick={() => navigateToVenue(venue.slug)}
                                    className="animate-fade-in-up"
                                    style={{ animationDelay: `${idx * 100}ms` }}
                                />
                            ))}
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}
