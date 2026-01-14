import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GlassCard } from '../components/GlassCard';
import { CardSkeleton, Spinner } from '../components/Loading';
import { PullToRefresh } from '../components/PullToRefresh';
import { OptimizedImage } from '../components/OptimizedImage';
import { createReservation, getAllVenues } from '../services/databaseService';
import { findNearbyPlaces, discoverGlobalVenues, generateVenueThumbnail, adaptUiToLocation } from '../services/geminiService';
import { locationService, LocationStatus } from '../services/locationService';
import { Venue, UIContext } from '../types';

const NearbyVenueCard = ({ place, index, registeredVenue, currency }: { place: any, index: number, registeredVenue?: Venue, currency: string }) => {
    const [imageUrl, setImageUrl] = useState<string | null>(registeredVenue?.imageUrl || null);
    const [loadingImage, setLoadingImage] = useState(!registeredVenue?.imageUrl);
    const navigate = useNavigate();

    useEffect(() => {
        let mounted = true;
        const fetchImage = async () => {
            if (registeredVenue?.imageUrl) return;

            // Lazy load visuals - only if in view (simulated by index stagger for now)
            const staggerDelay = index < 2 ? 0 : (index * 200) + (Math.random() * 300);
            if (staggerDelay > 0) await new Promise(r => setTimeout(r, staggerDelay));
            if (!mounted) return;

            const img = await generateVenueThumbnail(place.name, place.visualVibe);
            if (mounted) {
                if (img) setImageUrl(img);
                setLoadingImage(false);
            }
        };
        fetchImage();
        return () => { mounted = false; };
    }, [place.name, place.visualVibe, index, registeredVenue]);

    const whatsappLink = (registeredVenue?.whatsappNumber || place.phoneNumber)
        ? `https://wa.me/${(registeredVenue?.whatsappNumber || place.phoneNumber).replace(/[^0-9]/g, '')}`
        : null;

    const isVerified = !!registeredVenue;
    const activeCurrency = registeredVenue?.currency || currency;

    return (
        <div className="w-full mb-6 group relative animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div
                className={`glass-panel overflow-hidden rounded-3xl border-0 shadow-lg bg-surface transition-transform ${isVerified ? 'cursor-pointer active:scale-[0.98]' : ''}`}
                onClick={() => isVerified && navigate(`/menu/${registeredVenue.id}`)}
            >
                <div className="aspect-[4/3] w-full bg-gray-900 relative">
                    {loadingImage ? (
                        <div className="w-full h-full animate-pulse bg-surface-highlight flex items-center justify-center">
                            <span className="text-xs text-muted font-medium">Loading Visual...</span>
                        </div>
                    ) : (
                        <OptimizedImage
                            src={imageUrl || `https://via.placeholder.com/600x400?text=${encodeURIComponent(place.name)}`}
                            alt={place.name}
                            aspectRatio="4/3"
                            className="w-full h-full"
                            priority={index < 3} // Load first 3 images immediately
                        />
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-90" />

                    <div className="absolute top-4 right-4 flex gap-2">
                        {isVerified && (
                            <div className="bg-primary-500 px-3 py-1 rounded-full text-xs font-bold text-white border border-white/10 flex items-center gap-1 shadow-glow">
                                ✓ Verified
                            </div>
                        )}
                        <div className="bg-black/40 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-white border border-white/10 flex items-center gap-1">
                            <span className="text-yellow-400">★</span>
                            {place.rating || 'New'}
                            {place.userRatingCount && <span className="text-gray-400 ml-1">({place.userRatingCount})</span>}
                        </div>
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 p-5">
                        <h3 className="font-bold text-white text-2xl leading-none mb-2">{place.name}</h3>
                        <div className="flex items-center gap-2 text-sm text-gray-300 font-medium">
                            <span>{place.category}</span>
                            <span className="w-1 h-1 bg-gray-500 rounded-full" />
                            <span>{place.priceLevel?.replace('$', activeCurrency).replace('€', activeCurrency) || activeCurrency}</span>
                            <span className="w-1 h-1 bg-gray-500 rounded-full" />
                            <span>{place.distance}</span>
                        </div>
                    </div>
                </div>

                <div className="p-3 bg-surface-highlight backdrop-blur-md flex gap-2" onClick={e => e.stopPropagation()}>
                    {isVerified && (
                        <button
                            onClick={() => navigate(`/menu/${registeredVenue.id}`)}
                            className="flex-[2] py-3 bg-foreground text-background rounded-xl text-sm font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-lg"
                            aria-label={`View menu for ${place.name}`}
                        >
                            🍽️ View Menu
                        </button>
                    )}

                    {whatsappLink ? (
                        <a
                            href={whatsappLink}
                            target="_blank"
                            rel="noreferrer"
                            className={`flex-1 py-3 bg-[#25D366]/20 border border-[#25D366]/30 rounded-xl text-sm font-bold text-[#25D366] flex items-center justify-center gap-2 active:scale-95 transition-transform ${!isVerified ? 'flex-[1]' : ''}`}
                            aria-label={`Contact ${place.name} via WhatsApp`}
                        >
                            <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6" aria-hidden="true">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                            </svg>
                        </a>
                    ) : null}

                    <button
                        onClick={async () => {
                            const { shareVenue } = await import('../services/shareAPI');
                            const url = `${window.location.origin}/#/menu/${registeredVenue?.id || ''}`;
                            await shareVenue(registeredVenue?.id || place.googlePlaceId || '', place.name, url);
                        }}
                        className={`flex-1 py-3 bg-surface-highlight border border-border rounded-xl text-sm font-bold text-foreground flex items-center justify-center gap-2 active:scale-95 transition-transform ${!isVerified && !whatsappLink ? 'flex-[1]' : ''}`}
                        aria-label={`Share ${place.name}`}
                    >
                        <span className="text-xl" aria-hidden="true">🔗</span>
                    </button>

                    <a
                        href={place.googleMapsUrl}
                        target="_blank"
                        rel="noreferrer"
                        className={`flex-1 py-3 bg-surface-highlight border border-border rounded-xl text-sm font-bold text-foreground flex items-center justify-center gap-2 active:scale-95 transition-transform ${!isVerified && !whatsappLink ? 'flex-[1]' : ''}`}
                        aria-label={`View ${place.name} on Google Maps`}
                    >
                        <span className="text-xl" aria-hidden="true">📍</span>
                    </a>
                </div>
            </div>
        </div>
    );
};


const ClientHome = () => {
    const navigate = useNavigate();
    const [categorizedVenues, setCategorizedVenues] = useState<Record<string, any[]>>({});
    const [allFetchedVenues, setAllFetchedVenues] = useState<any[]>([]);
    const [registeredVenues, setRegisteredVenues] = useState<Venue[]>([]);

    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [locationStatus, setLocationStatus] = useState<LocationStatus>('prompt');
    const [userPos, setUserPos] = useState<{ lat: number, lng: number } | null>(null);

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
            if (location) {
                setUserPos({ lat: location.lat, lng: location.lng });
            }
        });

        // Request permission on mount (only prompts if not already granted/denied)
        locationService.requestPermission().then(({ location, status }) => {
            if (location) {
                setUserPos({ lat: location.lat, lng: location.lng });
            }
            setLocationStatus(status);
            initDiscovery(location || undefined);
        });

        return unsubscribe;
    }, []);

    // Update grouped list whenever flat list changes
    useEffect(() => {
        const grouped: Record<string, any[]> = {};
        allFetchedVenues.forEach(place => {
            const cat = place.category || 'Trending';
            if (!grouped[cat]) grouped[cat] = [];
            grouped[cat].push(place);
        });
        setCategorizedVenues(grouped);
    }, [allFetchedVenues]);

    const initDiscovery = async (initialLocation?: { lat: number, lng: number }) => {
        setLoading(true);

        // 1. Fetch Registered Venues from Supabase (DB)
        const dbVenues = await getAllVenues();
        setRegisteredVenues(dbVenues);

        // 2. Cleanup old images (background task, don't wait)
        import('../services/imageCache').then(({ cleanupOldImages }) => {
            cleanupOldImages().catch(err => console.warn('Image cleanup failed:', err));
        });

        // 3. Use location if available, otherwise use cache or global discovery
        const location = initialLocation || locationService.getLocation();

        if (location) {
            // Fetch with location
            try {
                const [discovered, context] = await Promise.all([
                    findNearbyPlaces(location.lat, location.lng),
                    adaptUiToLocation(location.lat, location.lng)
                ]);
                setAllFetchedVenues(discovered);
                setUiContext(context);
                localStorage.setItem(CACHE_KEY_VENUES, JSON.stringify(discovered));
                localStorage.setItem(CACHE_KEY_CTX, JSON.stringify(context));
            } catch (error) {
                console.error('Error fetching venues:', error);
                // Fallback to cache or global discovery
                const cachedList = localStorage.getItem(CACHE_KEY_VENUES);
                if (cachedList) {
                    try {
                        setAllFetchedVenues(JSON.parse(cachedList));
                        const cachedCtx = localStorage.getItem(CACHE_KEY_CTX);
                        if (cachedCtx) setUiContext(JSON.parse(cachedCtx));
                    } catch (e) {
                        // Fallback to global discovery
                        const fallback = await discoverGlobalVenues();
                        setAllFetchedVenues(fallback);
                    }
                } else {
                    const fallback = await discoverGlobalVenues();
                    setAllFetchedVenues(fallback);
                }
            }
        } else {
            // No location - use cache or global discovery
            const cachedList = localStorage.getItem(CACHE_KEY_VENUES);
            const cachedCtx = localStorage.getItem(CACHE_KEY_CTX);

            if (cachedList) {
                try {
                    setAllFetchedVenues(JSON.parse(cachedList));
                    if (cachedCtx) setUiContext(JSON.parse(cachedCtx));
                } catch (e) {
                    localStorage.removeItem(CACHE_KEY_VENUES);
                    const fallback = await discoverGlobalVenues();
                    setAllFetchedVenues(fallback);
                }
            } else {
                // No cache - use global discovery
                const fallback = await discoverGlobalVenues();
                setAllFetchedVenues(fallback);
            }
        }

        setLoading(false);
    };

    const handleManualRefresh = async () => {
        // Force refresh data ignoring cache
        const location = locationService.getLocation();
        if (location) {
            const [discovered, context] = await Promise.all([
                findNearbyPlaces(location.lat, location.lng),
                adaptUiToLocation(location.lat, location.lng)
            ]);
            setAllFetchedVenues(discovered);
            setUiContext(context);
            localStorage.setItem(CACHE_KEY_VENUES, JSON.stringify(discovered));
            localStorage.setItem(CACHE_KEY_CTX, JSON.stringify(context));
        } else {
            await initDiscovery();
        }
    };

    const requestLocationPermission = async () => {
        setLoading(true);
        const { location, status } = await locationService.requestPermission();

        if (location) {
            // Location granted - fetch venues
            await initDiscovery(location);
        } else {
            // Permission denied or error
            setLoading(false);
        }
    };

    const handleLoadMore = async () => {
        const location = locationService.getLocation();
        if (!location || allFetchedVenues.length >= MAX_VENUES || loadingMore) return;

        setLoadingMore(true);
        const currentNames = allFetchedVenues.map(v => v.name);

        const newBatch = await findNearbyPlaces(location.lat, location.lng, currentNames);

        if (newBatch.length > 0) {
            const updatedList = [...allFetchedVenues, ...newBatch];
            setAllFetchedVenues(updatedList);
            localStorage.setItem(CACHE_KEY_VENUES, JSON.stringify(updatedList));
        }

        setLoadingMore(false);
    };

    const getRegisteredMatch = (place: any) => {
        return registeredVenues.find(v =>
            v.name.toLowerCase().includes(place.name.toLowerCase()) ||
            place.name.toLowerCase().includes(v.name.toLowerCase())
        );
    };

    const hasMore = allFetchedVenues.length < MAX_VENUES && locationStatus === 'granted';

    return (
        <div className="min-h-screen pt-safe-top transition-colors duration-1000 relative">


            {/* Sticky Native Header */}
            <div className="sticky top-0 z-40 px-6 pt-12 pb-4 bg-glass border-b border-glassBorder backdrop-blur-xl transition-all">
                <div className="flex justify-between items-end">
                    <div>
                        <p className="text-xs font-bold text-muted uppercase tracking-widest mb-1 animate-fade-in">
                            {locationStatus === 'granted' ? uiContext.greeting : 'Discover'}
                        </p>
                        <h1 className="text-3xl font-bold text-foreground tracking-tight animate-fade-in">
                            {uiContext.appName}
                        </h1>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-secondary-500 to-primary-500 p-0.5">
                        <div className="w-full h-full rounded-full bg-surface flex items-center justify-center font-bold text-xs text-foreground">
                            ME
                        </div>
                    </div>
                </div>
            </div>

            <PullToRefresh onRefresh={handleManualRefresh}>
                <div className="px-4 pt-6 pb-32 space-y-8 min-h-[80vh]">

                    {/* Persistent Location Request Card - If user hasn't granted permission */}
                    {!loading && locationStatus !== 'granted' && locationStatus !== 'denied' && (
                        <GlassCard className="bg-secondary-500/10 border-secondary-500/30 flex items-center justify-between p-4">
                            <div>
                                <h3 className="font-bold text-secondary-600 text-sm">Find spots near you</h3>
                                <p className="text-xs text-secondary-600/80">Enable location for the best experience.</p>
                            </div>
                            <button
                                onClick={requestLocationPermission}
                                className="px-4 py-2 bg-primary-500 text-white text-xs font-bold rounded-full shadow-lg active:scale-95 transition-transform"
                            >
                                Enable
                            </button>
                        </GlassCard>
                    )}

                    {/* Loading State */}
                    {loading && (
                        <div className="space-y-8 animate-fade-in stagger-children">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="space-y-4 animate-slide-up-fade">
                                    <div className="flex items-center gap-3 px-2">
                                        <div className="h-6 w-32 shimmer-enhanced rounded-md" />
                                        <div className="h-px shimmer-enhanced flex-1"></div>
                                    </div>
                                    <CardSkeleton />
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Empty State */}
                    {!loading && Object.keys(categorizedVenues).length === 0 && (
                        <React.Suspense fallback={<div className="py-20 text-center text-muted">Loading...</div>}>
                            {(() => {
                                const EmptyState = React.lazy(() => import('../components/ui/EmptyState'));
                                return (
                                    <EmptyState
                                        icon="📡"
                                        title="No signal"
                                        description="We couldn't find venues near you. Please enable location or try again."
                                        action={{
                                            label: 'Enable Location',
                                            onClick: requestLocationPermission,
                                            variant: 'primary'
                                        }}
                                        size="lg"
                                    />
                                );
                            })()}
                        </React.Suspense>
                    )}

                    {/* Categories */}
                    {!loading && Object.keys(categorizedVenues).map((category) => (
                        <section key={category}>
                            <div className="flex items-center gap-3 mb-4 px-2">
                                <h2 className="text-xl font-bold text-foreground">{category}</h2>
                                <div className="h-px bg-border flex-1"></div>
                            </div>

                            <div className="flex flex-col gap-2">
                                {categorizedVenues[category].map((place, idx) => (
                                    <NearbyVenueCard
                                        key={`${category}-${idx}`}
                                        place={place}
                                        index={idx}
                                        registeredVenue={getRegisteredMatch(place)}
                                        currency={uiContext.currencySymbol}
                                    />
                                ))}
                            </div>
                        </section>
                    ))}

                    {/* Load More Button */}
                    {!loading && hasMore && (
                        <div className="py-4 flex justify-center">
                            <button
                                onClick={handleLoadMore}
                                disabled={loadingMore}
                                className="px-8 py-3 bg-surface-highlight border border-border hover:bg-white/10 rounded-full text-sm font-bold flex items-center gap-2 transition-all active:scale-95 text-foreground"
                            >
                                {loadingMore ? <Spinner className="w-4 h-4" /> : 'Load More Venues'}
                            </button>
                        </div>
                    )}
                    {!loading && !hasMore && allFetchedVenues.length >= MAX_VENUES && (
                        <p className="text-center text-xs text-muted py-4">Maximum venues loaded.</p>
                    )}

                    {/* Quick Action - Scan QR at bar to order */}
                    <GlassCard className="bg-gradient-to-r from-secondary-500/30 to-primary-500/30 border-secondary-500/30 p-6 flex flex-col items-center text-center mt-8">
                        <h3 className="font-bold text-xl mb-2 text-white">Ready to order?</h3>
                        <p className="text-sm text-gray-200 mb-6">Scan the QR code at the bar to view their menu and start ordering.</p>
                        <button
                            onClick={() => navigate('/scan')}
                            className="w-full py-4 bg-white text-black font-bold rounded-2xl shadow-xl active:scale-95 transition-transform flex items-center justify-center gap-2"
                        >
                            <span className="text-xl">📸</span> Scan QR Code
                        </button>
                    </GlassCard>
                </div>
            </PullToRefresh>
        </div>
    );
};

export default ClientHome;
