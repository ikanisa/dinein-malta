import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GlassCard } from '../components/GlassCard';
import { VenueListSkeleton, Spinner } from '../components/Loading';
import { Badge } from '../components/ui/Badge';
import { SectionHeader } from '../components/ui/SectionHeader';
import { ErrorState } from '../components/common/ErrorState';
import { findNearbyPlaces, adaptUiToLocation, searchPlacesByName, VenueResult, UIContext } from '../services/geminiService';
import { locationService, LocationStatus, Location } from '../services/locationService';
import { getAllVenues, toggleFavoriteVenue, getMyProfile } from '../services/databaseService';
import { Venue } from '../types';
import { OptimizedImage } from '../components/OptimizedImage';

interface DiscoveredVenue extends VenueResult {
  isRegistered?: boolean;
  registeredVenueId?: string;
}

const ClientExplore = () => {
  const [venues, setVenues] = useState<DiscoveredVenue[]>([]);
  const [registeredVenues, setRegisteredVenues] = useState<Venue[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const [locationStatus, setLocationStatus] = useState<LocationStatus>('prompt');
  const [userLocation, setUserLocation] = useState<Location | null>(null);
  const [uiContext, setUiContext] = useState<UIContext | null>(null);

  const navigate = useNavigate();

  // Categories for filtering
  const categories = ['All', 'Bars', 'Restaurants', 'Cafes', 'Clubs', 'Beach Bars'];

  // Initialize location and fetch venues
  useEffect(() => {
    const unsubscribe = locationService.subscribe((location, status) => {
      setLocationStatus(status);
      if (location) {
        setUserLocation(location);
      }
    });

    initializeDiscovery();
    return unsubscribe;
  }, []);

  const initializeDiscovery = async () => {
    setLoading(true);
    setError(null);

    try {
      // Get profile for favorites
      const profile = await getMyProfile().catch(() => ({ favorites: [] }));
      setFavorites(profile.favorites || []);

      // Get registered venues from Supabase (for matching)
      const dbVenues = await getAllVenues().catch(() => []);
      setRegisteredVenues(dbVenues);

      // Check for manually selected country (from Profile settings)
      const selectedCountry = localStorage.getItem('dinein_selected_country');

      if (selectedCountry) {
        // Filter venues by manually selected country
        const countryNames: Record<string, string> = {
          'RW': 'Rwanda',
          'MT': 'Malta',
          'DE': 'Germany',
          'FR': 'France',
          'ES': 'Spain',
          'IT': 'Italy',
          'GB': 'United Kingdom',
          'US': 'United States'
        };

        // Filter registered venues by country
        const filteredVenues = dbVenues.filter(v =>
          v.country === selectedCountry ||
          v.address?.includes(countryNames[selectedCountry] || '')
        );

        // Map to DiscoveredVenue format
        const mappedVenues: DiscoveredVenue[] = filteredVenues.map(v => ({
          name: v.name,
          address: v.address || '',
          category: v.description || 'Bar',
          isRegistered: true,
          registeredVenueId: v.id,
          photo_url: v.imageUrl,
          rating: 4.5, // Default rating
        }));

        setVenues(mappedVenues);
        setUiContext({
          appName: 'DineIn',
          greeting: 'Welcome',
          currencySymbol: selectedCountry === 'RW' ? 'RWF' : '€',
          cityName: '',
          visualVibe: countryNames[selectedCountry] || '',
          country: countryNames[selectedCountry] || ''
        });
        setLoading(false);
        return;
      }

      // Request location permission (auto-detect mode)
      const { location, status } = await locationService.requestPermission();
      setLocationStatus(status);

      if (location) {
        setUserLocation(location);
        await fetchVenuesForLocation(location, dbVenues);
      } else {
        // No location - show empty state with CTA
        setVenues([]);
      }
    } catch (err) {
      console.error('Failed to initialize explore:', err);
      setError(err instanceof Error ? err : new Error('Failed to load venues'));
    } finally {
      setLoading(false);
    }
  };

  const fetchVenuesForLocation = async (location: Location, dbVenues: Venue[]) => {
    try {
      // Fetch nearby venues using Gemini
      const [discovered, context] = await Promise.all([
        findNearbyPlaces(location.lat, location.lng),
        adaptUiToLocation(location.lat, location.lng)
      ]);

      setUiContext(context);

      // Match with registered venues
      const enrichedVenues = discovered.map((venue: VenueResult) => {
        const match = dbVenues.find(v =>
          v.name.toLowerCase().includes(venue.name.toLowerCase()) ||
          venue.name.toLowerCase().includes(v.name.toLowerCase()) ||
          (v.googlePlaceId && v.googlePlaceId === venue.google_place_id)
        );
        return {
          ...venue,
          isRegistered: !!match,
          registeredVenueId: match?.id
        };
      });

      setVenues(enrichedVenues);
    } catch (err) {
      console.error('Failed to fetch venues:', err);
      // Fallback to registered venues if Gemini fails
      setVenues([]);
      setError(err instanceof Error ? err : new Error('Failed to discover venues'));
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      // Reset to location-based results
      if (userLocation) {
        setSearching(true);
        await fetchVenuesForLocation(userLocation, registeredVenues);
        setSearching(false);
      }
      return;
    }

    setSearching(true);
    try {
      const results = await searchPlacesByName(
        searchTerm,
        userLocation?.lat,
        userLocation?.lng
      );

      const enrichedResults = results.map((venue: VenueResult) => {
        const match = registeredVenues.find(v =>
          v.name.toLowerCase().includes(venue.name.toLowerCase()) ||
          venue.name.toLowerCase().includes(v.name.toLowerCase())
        );
        return {
          ...venue,
          isRegistered: !!match,
          registeredVenueId: match?.id
        };
      });

      setVenues(enrichedResults);
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setSearching(false);
    }
  };

  const requestLocationPermission = async () => {
    setLoading(true);
    const { location, status } = await locationService.requestPermission();

    if (location) {
      await fetchVenuesForLocation(location, registeredVenues);
    }

    setLocationStatus(status);
    setLoading(false);
  };

  const handleToggleFav = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const newFavs = await toggleFavoriteVenue(id);
    setFavorites(newFavs);
  };

  const handleVenueClick = (venue: DiscoveredVenue) => {
    if (venue.registeredVenueId) {
      navigate(`/menu/${venue.registeredVenueId}`);
    } else {
      // For non-registered venues, could show a preview or Maps link
      if (venue.website) {
        window.open(venue.website, '_blank');
      }
    }
  };

  // Filter venues by category
  const filteredVenues = venues.filter(v => {
    const matchesSearch = !searchTerm ||
      v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.address?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === 'All' ||
      v.category?.toLowerCase().includes(selectedCategory.toLowerCase()) ||
      v.category_tags?.some(tag => tag.toLowerCase().includes(selectedCategory.toLowerCase()));

    return matchesSearch && matchesCategory;
  });

  const formatDistance = (meters?: number) => {
    if (!meters) return '';
    if (meters < 1000) return `${meters}m`;
    return `${(meters / 1000).toFixed(1)}km`;
  };

  return (
    <div className="min-h-screen pb-24 animate-fade-in pt-safe-top bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 px-6 pt-12 pb-4 bg-glass border-b border-glassBorder backdrop-blur-xl">
        <SectionHeader
          title={uiContext?.cityName ? `Explore ${uiContext.cityName}` : 'Explore'}
          subtitle={uiContext?.country || 'Discover the finest spots near you'}
          level={1}
        />

        {/* Search Bar */}
        <div className="relative mt-4">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted">🔍</span>
          <input
            type="text"
            placeholder={`Search bars, restaurants in ${uiContext?.cityName || 'your area'}...`}
            className="w-full bg-surface border border-border rounded-2xl py-3.5 pl-12 pr-16 text-foreground placeholder:text-muted focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
          />
          <button
            onClick={handleSearch}
            disabled={searching}
            className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-primary-500 hover:bg-primary-600 rounded-xl text-sm font-bold text-white transition-colors disabled:opacity-50"
          >
            {searching ? <Spinner className="w-4 h-4" /> : 'Go'}
          </button>
        </div>

        {/* Category Pills */}
        <div className="flex gap-2 overflow-x-auto pb-2 mt-4 no-scrollbar">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${selectedCategory === cat
                ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30'
                : 'bg-surface hover:bg-surface-highlight text-muted hover:text-foreground border border-border'
                }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pt-6 space-y-4">
        {/* Location Status Banner */}
        {!loading && locationStatus !== 'granted' && (
          <GlassCard className="bg-secondary-500/10 border-secondary-500/30 flex items-center justify-between p-4">
            <div className="flex-1">
              <h3 className="font-bold text-secondary-600 text-sm">Enable Location</h3>
              <p className="text-xs text-secondary-600/80">
                {locationStatus === 'denied'
                  ? 'Location access was denied. Please enable in settings.'
                  : 'Allow location access to discover venues near you.'}
              </p>
            </div>
            {locationStatus !== 'denied' && (
              <button
                onClick={requestLocationPermission}
                className="ml-4 px-4 py-2 bg-primary-500 text-white text-xs font-bold rounded-full shadow-lg active:scale-95 transition-transform"
              >
                Enable
              </button>
            )}
          </GlassCard>
        )}

        {/* Country Badge */}
        {uiContext?.country && (
          <div className="flex items-center gap-2 text-sm text-muted">
            <span className="text-lg">📍</span>
            <span>
              {localStorage.getItem('dinein_selected_country')
                ? <>Browsing <strong className="text-foreground">{uiContext.country}</strong> <span className="text-xs">(manual)</span></>
                : <>Showing venues in <strong className="text-foreground">{uiContext.country}</strong></>
              }
            </span>
            {uiContext.currencySymbol && (
              <Badge tone="secondary">{uiContext.currencySymbol}</Badge>
            )}
          </div>
        )}

        {/* Error State */}
        {error && (
          <ErrorState
            error={error}
            onRetry={initializeDiscovery}
            className="py-10"
          />
        )}

        {/* Loading State */}
        {loading && !error && (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => <VenueListSkeleton key={i} />)}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredVenues.length === 0 && locationStatus === 'granted' && (
          <div className="py-16 text-center">
            <span className="text-6xl mb-4 block">🔍</span>
            <h3 className="font-bold text-lg text-foreground mb-2">No venues found</h3>
            <p className="text-muted text-sm">
              {searchTerm ? `No results for "${searchTerm}"` : 'Try a different search or category'}
            </p>
          </div>
        )}

        {/* Venue Grid */}
        {!loading && !error && filteredVenues.map((venue, idx) => (
          <GlassCard
            key={venue.google_place_id || idx}
            onClick={() => handleVenueClick(venue)}
            className={`group bg-surface border-border overflow-hidden ${venue.isRegistered ? 'cursor-pointer' : 'cursor-default'}`}
          >
            {/* Image */}
            {venue.photo_url && (
              <div className="aspect-video w-full bg-surface-highlight relative overflow-hidden -mx-4 -mt-4 mb-4">
                <OptimizedImage
                  src={venue.photo_url}
                  alt={venue.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                {/* Badges overlay */}
                <div className="absolute top-3 right-3 flex gap-2">
                  {venue.isRegistered && (
                    <Badge tone="primary" className="shadow-lg">✓ Order Online</Badge>
                  )}
                </div>

                <div className="absolute bottom-3 left-3 right-3">
                  <h3 className="font-bold text-xl text-white leading-tight">{venue.name}</h3>
                </div>
              </div>
            )}

            {/* No image fallback */}
            {!venue.photo_url && (
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-lg text-foreground">{venue.name}</h3>
                {venue.isRegistered && (
                  <Badge tone="primary">✓ Order Online</Badge>
                )}
              </div>
            )}

            <p className="text-xs text-muted mb-3 line-clamp-1">{venue.address}</p>

            <div className="flex items-center gap-2 flex-wrap">
              {venue.rating && (
                <Badge tone="secondary">
                  ⭐ {venue.rating.toFixed(1)}
                </Badge>
              )}
              {venue.distance_meters && (
                <Badge tone="neutral">
                  📍 {formatDistance(venue.distance_meters)}
                </Badge>
              )}
              {venue.category && (
                <span className="text-xs text-muted">{venue.category}</span>
              )}
              {venue.price_level && (
                <span className="text-xs text-muted">
                  {'€'.repeat(venue.price_level)}
                </span>
              )}
            </div>

            {/* Quick Tags */}
            {venue.quick_tags && venue.quick_tags.length > 0 && (
              <div className="flex gap-1 mt-3 flex-wrap">
                {venue.quick_tags.slice(0, 3).map((tag, i) => (
                  <span key={i} className="px-2 py-0.5 bg-surface-highlight rounded-full text-xs text-muted">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Why Recommended */}
            {venue.why_recommended && (
              <p className="text-xs text-primary-500 mt-3 italic">
                "{venue.why_recommended}"
              </p>
            )}

            {/* Favorite button (only for registered) */}
            {venue.registeredVenueId && (
              <button
                onClick={(e) => handleToggleFav(e, venue.registeredVenueId!)}
                className="absolute top-4 right-4 text-2xl"
              >
                {favorites.includes(venue.registeredVenueId) ? '❤️' : '🤍'}
              </button>
            )}
          </GlassCard>
        ))}
      </div>
    </div>
  );
};

export default ClientExplore;
