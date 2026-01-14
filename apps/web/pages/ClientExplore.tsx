import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GlassCard } from '../components/GlassCard';
import { VenueListSkeleton } from '../components/Loading';
import { Badge } from '../components/ui/Badge';
import { SectionHeader } from '../components/ui/SectionHeader';
import { getAllVenues, toggleFavoriteVenue, getMyProfile } from '../services/databaseService';
import { Venue } from '../types';
import { ErrorState } from '../components/common/ErrorState';

const ClientExplore = () => {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [aiMode, setAiMode] = useState(false);
  const [aiResponse, setAiResponse] = useState<{ text: string, chunks: any[] | undefined } | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [fetchedVenues, profile] = await Promise.all([
          getAllVenues(),
          getMyProfile()
        ]);
        setVenues(fetchedVenues);
        setFavorites(profile.favorites);
      } catch (err) {
        console.error('Failed to load explore data:', err);
        setError(err instanceof Error ? err : new Error('Failed to load venues'));
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleToggleFav = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const newFavs = await toggleFavoriteVenue(id);
    setFavorites(newFavs);
  };

  const getUserLocation = async (): Promise<{ lat: number, lng: number } | undefined> => {
    const { locationService } = await import('../services/locationService');
    const location = locationService.getLocation();
    return location ? { lat: location.lat, lng: location.lng } : undefined;
  };

  const handleAiSearch = async () => {
    if (!searchTerm) return;
    setAiLoading(true);
    setAiMode(true);

    const loc = await getUserLocation();
    // AI recommendation feature removed for simplicity
    const result = { text: `Search results for "${searchTerm}"`, chunks: [] };
    setAiResponse(result);
    setAiLoading(false);
  };

  const filteredVenues = venues.filter(v =>
    v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 pb-24 space-y-6 animate-fade-in pt-safe-top">
      <SectionHeader
        title="Explore"
        subtitle="Discover the finest liquid spots."
        level={1}
      />

      {/* Search Bar / AI Concierge */}
      <div className="relative">
        <span className="absolute left-3 top-3 text-muted">✨</span>
        <input
          type="text"
          placeholder="Try: 'Romantic dinner in Sliema'..."
          className="w-full bg-surface border border-border rounded-xl py-3 pl-10 pr-12 text-foreground focus:outline-none focus:border-secondary-500 transition-colors"
          value={searchTerm}
          onChange={e => { setSearchTerm(e.target.value); if (e.target.value === '') setAiMode(false); }}
          onKeyDown={(e) => e.key === 'Enter' && handleAiSearch()}
        />
        <button
          onClick={handleAiSearch}
          className="absolute right-2 top-2 bg-primary-500/90 p-1.5 rounded-lg text-xs font-bold text-white"
        >
          GO
        </button>
      </div>

      {/* AI Results Section */}
      {aiMode && (
        <div className="animate-fade-in">
          <h3 className="font-bold text-secondary-600 mb-2">Virtual Concierge</h3>
          {aiLoading ? (
            <div className="p-8 text-center text-muted animate-pulse">Finding the best options...</div>
          ) : (
            <GlassCard className="bg-secondary-500/10 border-secondary-500/30">
              <div className="text-sm whitespace-pre-line mb-4 text-foreground">{aiResponse?.text}</div>

              {/* Grounding Sources (Google Maps) */}
              {aiResponse?.chunks && aiResponse.chunks.length > 0 && (
                <div className="border-t border-border pt-3 mt-2">
                  <div className="text-xs text-muted mb-2 uppercase font-bold tracking-wider">Sources (Google Maps)</div>
                  <div className="flex flex-wrap gap-2">
                    {aiResponse.chunks.map((chunk, idx) => {
                      const webUri = chunk.web?.uri;
                      const title = chunk.web?.title || "Map Link";
                      if (!webUri) return null;
                      return (
                        <a
                          key={idx}
                          href={webUri}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1 bg-surface-highlight rounded-full text-xs hover:bg-white/10 flex items-center gap-1 text-foreground"
                        >
                          📍 {title}
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}
            </GlassCard>
          )}
          <div className="border-b border-border my-6"></div>
        </div>
      )}

      {/* Categories (Static for now) */}
      {!aiMode && (
        <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
          {['All', 'Bars', 'Restaurants', 'Clubs', 'Beach'].map(cat => (
            <button
              key={cat}
              className="px-4 py-2 bg-surface rounded-full text-xs font-bold whitespace-nowrap hover:bg-surface-highlight text-muted hover:text-foreground transition-colors"
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      <div className="grid gap-4">
        {error && (
          <ErrorState
            error={error}
            onRetry={() => window.location.reload()}
            className="py-10"
          />
        )}

        {loading && !error && !aiMode && [1, 2, 3, 4, 5, 6].map(i => <VenueListSkeleton key={i} />)}

        {!loading && !error && !aiMode && filteredVenues.map(venue => (
          <GlassCard key={venue.id} onClick={() => navigate(`/menu/${venue.id}`)} className="group bg-surface border-border">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-bold text-lg text-foreground">{venue.name}</h3>
              <button onClick={(e) => handleToggleFav(e, venue.id)} className="text-xl">
                {favorites.includes(venue.id) ? '❤️' : '🤍'}
              </button>
            </div>
            <p className="text-xs text-muted mb-2">{venue.address}</p>
            <div className="flex items-center gap-2 text-xs">
              <Badge tone="secondary">⭐ 4.8</Badge>
              <span className="text-muted">•</span>
              <span className="text-muted">Bar & Grill</span>
            </div>
          </GlassCard>
        ))}
        {!loading && !aiMode && filteredVenues.length === 0 && (
          <div className="text-center text-muted py-10">No venues found.</div>
        )}
      </div>
    </div>
  );
};

export default ClientExplore;
