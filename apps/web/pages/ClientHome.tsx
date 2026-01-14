import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from '../components/GlassCard';
import { CardSkeleton, Spinner } from '../components/Loading';
import { PullToRefresh } from '../components/PullToRefresh';
import { VenueDiscoverCard } from '../components/VenueDiscoverCard';
import { getAllVenues } from '../services/databaseService';
import { findNearbyPlaces, discoverGlobalVenues, adaptUiToLocation, VenueResult } from '../services/geminiService';
import { locationService, LocationStatus } from '../services/locationService';
import { Venue, UIContext } from '../types';
import { ErrorState } from '../components/common/ErrorState';

// Fallback venues when Gemini API fails
const FALLBACK_VENUES: VenueResult[] = [
    {
        name: "Local Favorites",
        category: "Restaurant",
        rating: 4.5,
        why_recommended: "Popular local spot - check back when connection improves",
        quick_tags: ["Popular", "Local"],
    }
];

const ClientHome = () => {
    const navigate = useNavigate();
    const [categorizedVenues, setCategorizedVenues] = useState<Record<string, VenueResult[]>>({});
    const [allFetchedVenues, setAllFetchedVenues] = useState<VenueResult[]>([]);
    const [registeredVenues, setRegisteredVenues] = useState<Venue[]>([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const [loadingMore, setLoadingMore] = useState(false);
    const [locationStatus, setLocationStatus] = useState<LocationStatus>('prompt');

    const [uiContext, setUiContext] = useState<UIContext>({
        appName: 'DineIn',
        greeting: 'Welcome',
        currencySymbol: '$'
    });

    const MAX_VENUES = 50;
    const CACHE_KEY_VENUES = 'dinein_cached_venues_list';
    const CACHE_KEY_CTX = 'dinein_cached_ui_context';

    // Subscribe to location service and initialize
    useEffect(() => {
        const unsubscribe = locationService.subscribe((location, status) => {
            setLocationStatus(status);
        });

        // Request permission on mount
        locationService.requestPermission().then(({ location, status }) => {
            setLocationStatus(status);
            initDiscovery(location || undefined);
        });

        return unsubscribe;
    }, []);

    // Update grouped list whenever flat list changes
    useEffect(() => {
        const grouped: Record<string, VenueResult[]> = {};
        allFetchedVenues.forEach(place => {
            const cat = place.category || 'Trending';
            if (!grouped[cat]) grouped[cat] = [];
            grouped[cat].push(place);
        });
        setCategorizedVenues(grouped);
    }, [allFetchedVenues]);

    const initDiscovery = async (initialLocation?: { lat: number, lng: number }) => {
        setLoading(true);
        setError(null);

        try {
            // 1. Fetch Registered Venues from Supabase
            const dbVenues = await getAllVenues().catch(() => []);
            setRegisteredVenues(dbVenues);

            // 2. Use location if available
            const location = initialLocation || locationService.getLocation();

            if (location) {
                try {
                    const [discovered, context] = await Promise.all([
                        findNearbyPlaces(location.lat, location.lng),
                        adaptUiToLocation(location.lat, location.lng)
                    ]);

                    if (discovered.length > 0) {
                        setAllFetchedVenues(discovered);
                        setUiContext(context);
                        localStorage.setItem(CACHE_KEY_VENUES, JSON.stringify(discovered));
                        localStorage.setItem(CACHE_KEY_CTX, JSON.stringify(context));
                    } else {
                        // No venues returned - use cache or fallback
                        loadFromCacheOrFallback(dbVenues);
                    }
                } catch (apiError) {
                    console.error('Gemini API error:', apiError);
                    loadFromCacheOrFallback(dbVenues);
                }
            } else {
                // No location - use cache or fallback
                loadFromCacheOrFallback(dbVenues);
            }
        } catch (err) {
            console.error('Discovery init failed:', err);
            setError(err instanceof Error ? err : new Error('Failed to load venues'));
        } finally {
            setLoading(false);
        }
    };

    const loadFromCacheOrFallback = (dbVenues: Venue[]) => {
        const cachedList = localStorage.getItem(CACHE_KEY_VENUES);
        const cachedCtx = localStorage.getItem(CACHE_KEY_CTX);

        if (cachedList) {
            try {
                setAllFetchedVenues(JSON.parse(cachedList));
                if (cachedCtx) setUiContext(JSON.parse(cachedCtx));
                return;
            } catch {
                localStorage.removeItem(CACHE_KEY_VENUES);
            }
        }

        // Use registered venues as fallback
        if (dbVenues.length > 0) {
            const mappedVenues: VenueResult[] = dbVenues.map(v => ({
                name: v.name,
                address: v.address,
                category: 'Restaurant',
                rating: 4.5,
                photo_url: v.imageUrl,
                google_place_id: v.googlePlaceId,
                why_recommended: "Registered partner venue",
            }));
            setAllFetchedVenues(mappedVenues);
        } else {
            // Last resort fallback
            setAllFetchedVenues(FALLBACK_VENUES);
        }
    };

    const handleManualRefresh = async () => {
        const location = locationService.getLocation();
        if (location) {
            try {
                const [discovered, context] = await Promise.all([
                    findNearbyPlaces(location.lat, location.lng),
                    adaptUiToLocation(location.lat, location.lng)
                ]);
                setAllFetchedVenues(discovered);
                setUiContext(context);
                localStorage.setItem(CACHE_KEY_VENUES, JSON.stringify(discovered));
                localStorage.setItem(CACHE_KEY_CTX, JSON.stringify(context));
            } catch {
                // Silent fail on refresh - keep current data
            }
        } else {
            await initDiscovery();
        }
    };

    const requestLocationPermission = async () => {
        setLoading(true);
        const { location } = await locationService.requestPermission();
        if (location) {
            await initDiscovery(location);
        } else {
            setLoading(false);
        }
    };

    const handleLoadMore = async () => {
        const location = locationService.getLocation();
        if (!location || allFetchedVenues.length >= MAX_VENUES || loadingMore) return;

        setLoadingMore(true);
        try {
            const currentNames = allFetchedVenues.map(v => v.name);
            const newBatch = await findNearbyPlaces(location.lat, location.lng, currentNames);
            if (newBatch.length > 0) {
                const updatedList = [...allFetchedVenues, ...newBatch];
                setAllFetchedVenues(updatedList);
                localStorage.setItem(CACHE_KEY_VENUES, JSON.stringify(updatedList));
            }
        } catch {
            // Silent fail
        } finally {
            setLoadingMore(false);
        }
    };

    const getRegisteredMatch = (place: VenueResult) => {
        return registeredVenues.find(v =>
            v.name.toLowerCase().includes(place.name.toLowerCase()) ||
            place.name.toLowerCase().includes(v.name.toLowerCase()) ||
            (v.googlePlaceId && v.googlePlaceId === place.google_place_id)
        );
    };

    const hasMore = allFetchedVenues.length < MAX_VENUES && locationStatus === 'granted';

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const sectionVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
    };

    return (
        <div className="min-h-screen pt-safe-top bg-background transition-colors duration-500">
            {/* Header with Glassmorphism */}
            <motion.div
                className="sticky top-0 z-40 px-6 pt-12 pb-4 bg-glass border-b border-glassBorder backdrop-blur-xl"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="flex justify-between items-end">
                    <div>
                        <motion.p
                            className="text-xs font-bold text-muted uppercase tracking-widest mb-1"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                        >
                            {locationStatus === 'granted' ? uiContext.greeting : 'Discover'}
                        </motion.p>
                        <motion.h1
                            className="text-3xl font-bold text-foreground tracking-tight"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            {uiContext.appName}
                        </motion.h1>
                    </div>
                    <motion.button
                        onClick={() => navigate('/profile')}
                        className="w-10 h-10 rounded-full bg-gradient-to-br from-secondary-500 to-primary-500 p-0.5 active:scale-95 transition-transform"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <div className="w-full h-full rounded-full bg-surface flex items-center justify-center font-bold text-xs text-foreground">
                            ME
                        </div>
                    </motion.button>
                </div>
            </motion.div>

            <PullToRefresh onRefresh={handleManualRefresh}>
                <div className="px-4 pt-6 pb-32 space-y-8 min-h-[80vh]">
                    {/* Location Request Banner */}
                    <AnimatePresence>
                        {!loading && locationStatus !== 'granted' && locationStatus !== 'denied' && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                            >
                                <GlassCard className="bg-gradient-to-r from-secondary-500/20 to-primary-500/20 border-secondary-500/30 flex items-center justify-between p-4 backdrop-blur-xl">
                                    <div>
                                        <h3 className="font-bold text-foreground text-sm">📍 Find spots near you</h3>
                                        <p className="text-xs text-muted">Enable location for personalized discoveries.</p>
                                    </div>
                                    <motion.button
                                        onClick={requestLocationPermission}
                                        className="px-4 py-2 bg-primary-500 text-white text-xs font-bold rounded-full shadow-lg shadow-primary-500/30"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        Enable
                                    </motion.button>
                                </GlassCard>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Error State */}
                    {error && (
                        <ErrorState
                            error={error}
                            onRetry={() => initDiscovery()}
                            className="py-10"
                        />
                    )}

                    {/* Loading State with Staggered Skeletons */}
                    {loading && !error && (
                        <motion.div
                            className="space-y-6"
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                        >
                            {[1, 2, 3].map(i => (
                                <motion.div
                                    key={i}
                                    className="space-y-4"
                                    variants={sectionVariants}
                                >
                                    <div className="flex items-center gap-3 px-2">
                                        <div className="h-6 w-32 bg-surface-highlight rounded-md animate-pulse" />
                                        <div className="h-px bg-border flex-1" />
                                    </div>
                                    <CardSkeleton />
                                </motion.div>
                            ))}
                        </motion.div>
                    )}

                    {/* Empty State */}
                    {!loading && !error && Object.keys(categorizedVenues).length === 0 && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="py-16 text-center"
                        >
                            <span className="text-6xl mb-4 block">📡</span>
                            <h3 className="font-bold text-xl text-foreground mb-2">No signal</h3>
                            <p className="text-muted text-sm mb-6 max-w-xs mx-auto">
                                We couldn't find venues near you. Enable location or try again.
                            </p>
                            <motion.button
                                onClick={requestLocationPermission}
                                className="px-6 py-3 bg-primary-500 text-white font-bold rounded-full shadow-lg"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                Enable Location
                            </motion.button>
                        </motion.div>
                    )}

                    {/* Venue Categories */}
                    {!loading && !error && (
                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                        >
                            {Object.keys(categorizedVenues).map((category, catIdx) => (
                                <motion.section
                                    key={category}
                                    className="mb-8"
                                    variants={sectionVariants}
                                >
                                    <div className="flex items-center gap-3 mb-4 px-2">
                                        <h2 className="text-xl font-bold text-foreground">{category}</h2>
                                        <div className="h-px bg-border flex-1" />
                                        <span className="text-xs text-muted">{categorizedVenues[category].length}</span>
                                    </div>

                                    <div className="space-y-4">
                                        {categorizedVenues[category].map((place, idx) => (
                                            <VenueDiscoverCard
                                                key={`${category}-${idx}`}
                                                venue={place}
                                                index={catIdx * 10 + idx}
                                                registeredVenue={getRegisteredMatch(place)}
                                                currency={uiContext.currencySymbol}
                                            />
                                        ))}
                                    </div>
                                </motion.section>
                            ))}
                        </motion.div>
                    )}

                    {/* Load More */}
                    {!loading && !error && hasMore && (
                        <motion.div
                            className="py-4 flex justify-center"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            <motion.button
                                onClick={handleLoadMore}
                                disabled={loadingMore}
                                className="px-8 py-3 bg-surface border border-border hover:bg-surface-highlight rounded-full text-sm font-bold flex items-center gap-2 text-foreground"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                {loadingMore ? <Spinner className="w-4 h-4" /> : 'Load More Venues'}
                            </motion.button>
                        </motion.div>
                    )}

                    {/* Quick Action - Scan QR */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                    >
                        <GlassCard className="bg-gradient-to-r from-secondary-500/30 to-primary-500/30 border-secondary-500/30 p-6 flex flex-col items-center text-center backdrop-blur-xl">
                            <span className="text-4xl mb-3">📸</span>
                            <h3 className="font-bold text-xl mb-2 text-foreground">Ready to order?</h3>
                            <p className="text-sm text-muted mb-6">Scan the QR code at the bar to view menu and order.</p>
                            <motion.button
                                onClick={() => navigate('/scan')}
                                className="w-full py-4 bg-foreground text-background font-bold rounded-2xl shadow-xl flex items-center justify-center gap-2"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                Scan QR Code
                            </motion.button>
                        </GlassCard>
                    </motion.div>
                </div>
            </PullToRefresh>
        </div>
    );
};

export default ClientHome;
