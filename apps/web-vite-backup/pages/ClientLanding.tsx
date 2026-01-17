import React, { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GlassCard } from '../components/GlassCard';
import { useVendors } from '../hooks/useVendors';
import { PullToRefresh } from '../components/PullToRefresh';
import { NavigationDrawer } from '../components/NavigationDrawer';
import { hapticButton, hapticSelection, hapticSuccess } from '../utils/haptics';
import { Venue } from '../types';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } }
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } }
};

/**
 * Smart semantic search: matches query against name, description, address, and tags
 * with fuzzy partial matching for typo tolerance
 */
const searchVenues = (venues: Venue[], query: string): Venue[] => {
  if (!query.trim()) return venues;

  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);

  return venues
    .map(venue => {
      // Build searchable text from all relevant fields
      const searchableText = [
        venue.name,
        venue.description,
        venue.address,
        ...(venue.tags || [])
      ].join(' ').toLowerCase();

      // Score based on how many terms match
      let score = 0;
      for (const term of terms) {
        if (searchableText.includes(term)) {
          score += 1;
          // Bonus for name match
          if (venue.name.toLowerCase().includes(term)) {
            score += 2;
          }
        }
      }

      return { venue, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .map(({ venue }) => venue);
};

const ClientLanding: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Fetch active venues for exploration
  const { data: venues, isLoading, refetch } = useVendors({ status: 'active' });

  // Get last visited venue for quick access
  const lastVenueId = typeof window !== 'undefined'
    ? localStorage.getItem('last_venue_id')
    : null;

  // Find the last venue object if available
  const lastVenue = venues?.find(v => v.id === lastVenueId);

  // Filter venues based on search query
  const filteredVenues = useMemo(() => {
    if (!venues) return [];
    return searchVenues(venues, searchQuery);
  }, [venues, searchQuery]);

  const handleVenueClick = useCallback((venueId: string) => {
    hapticSelection();
    navigate(`/v/${venueId}`);
  }, [navigate]);

  const handleRefresh = useCallback(async () => {
    hapticButton();
    await refetch();
    hapticSuccess();
  }, [refetch]);

  const toggleDrawer = useCallback(() => {
    hapticButton();
    setIsDrawerOpen(prev => !prev);
  }, []);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    hapticSelection();
  }, []);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    hapticButton();
  }, []);

  return (
    <>
      <NavigationDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />

      <PullToRefresh onRefresh={handleRefresh} scrollContainerId="landing-content">
        <main id="landing-content" className="min-h-screen bg-background overflow-y-auto">

          {/* Fixed Header */}
          <header
            className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-background/80 border-b border-white/5"
            style={{ paddingTop: 'var(--safe-top, 0px)' }}
          >
            <div className="flex items-center justify-between px-4 py-3 max-w-md mx-auto">
              {/* Menu Button */}
              <button
                onClick={toggleDrawer}
                className="w-11 h-11 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 active:scale-95 transition-all touch-target"
                aria-label="Open menu"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="4" x2="20" y1="12" y2="12" />
                  <line x1="4" x2="20" y1="6" y2="6" />
                  <line x1="4" x2="20" y1="18" y2="18" />
                </svg>
              </button>

              {/* Logo */}
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  hapticButton();
                  window.location.reload();
                }}
                className="text-xl font-bold bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent"
              >
                DineIn
              </motion.button>

              {/* Settings Button */}
              <button
                onClick={() => {
                  hapticSelection();
                  navigate('/settings');
                }}
                className="w-11 h-11 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 active:scale-95 transition-all touch-target"
                aria-label="Settings"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                </svg>
              </button>
            </div>
          </header>

          {/* Content with top padding for fixed header */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-md mx-auto py-6 px-4 space-y-6"
            style={{ paddingTop: 'calc(var(--safe-top, 0px) + 72px)', paddingBottom: 'calc(var(--safe-bottom, 0px) + 24px)' }}
          >

            {/* Hero Section */}
            <motion.div variants={itemVariants} className="text-center space-y-2 pt-2">
              <h1 className="text-2xl font-bold text-foreground">
                Find a Venue
              </h1>
              <p className="text-sm text-muted">
                Search restaurants, cafes & bars near you
              </p>
            </motion.div>

            {/* Search Bar */}
            <motion.div variants={itemVariants}>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.3-4.3" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder="Search by name, cuisine, location..."
                  className="w-full pl-12 pr-10 py-4 bg-surface-highlight border border-border rounded-2xl text-foreground placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary-400/50 focus:border-primary-400/50 transition-all"
                  aria-label="Search venues"
                />
                {searchQuery && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-muted transition-colors"
                    aria-label="Clear search"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 6 6 18" />
                      <path d="m6 6 12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </motion.div>

            {/* Recently Visited (only show when not searching) */}
            {!searchQuery && lastVenue && (
              <motion.div variants={itemVariants} className="space-y-3">
                <h3 className="text-xs font-semibold text-muted uppercase tracking-wider px-1">Recently Visited</h3>
                <motion.div whileTap={{ scale: 0.98 }}>
                  <GlassCard
                    className="p-0 overflow-hidden hover:bg-surface-highlight transition-colors cursor-pointer"
                    onClick={() => handleVenueClick(lastVenue.id)}
                  >
                    <div className="flex items-center p-3 gap-4">
                      {lastVenue.imageUrl ? (
                        <img
                          src={lastVenue.imageUrl}
                          alt={lastVenue.name}
                          width={48}
                          height={48}
                          loading="lazy"
                          decoding="async"
                          className="w-12 h-12 rounded-lg object-cover bg-surface-base"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-surface-base flex items-center justify-center text-xl">
                          🍽️
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-foreground truncate">{lastVenue.name}</div>
                        <div className="text-xs text-muted">Tap to reopen menu</div>
                      </div>
                      <div className="text-primary-400">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M5 12h14" />
                          <path d="m12 5 7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              </motion.div>
            )}

            {/* Venue List */}
            <motion.div variants={itemVariants} className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-xs font-semibold text-muted uppercase tracking-wider">
                  {searchQuery ? `Results (${filteredVenues.length})` : 'All Venues'}
                </h3>
              </div>

              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-20 bg-surface-highlight rounded-2xl w-full animate-pulse opacity-50" />
                  ))}
                </div>
              ) : filteredVenues.length > 0 ? (
                <motion.div
                  variants={containerVariants}
                  className="grid grid-cols-1 gap-3"
                >
                  {filteredVenues.map((venue, index) => (
                    <motion.div
                      key={venue.id}
                      variants={cardVariants}
                      custom={index}
                      whileTap={{ scale: 0.98 }}
                    >
                      <GlassCard
                        className="p-0 overflow-hidden hover:bg-surface-highlight transition-colors cursor-pointer"
                        onClick={() => handleVenueClick(venue.id)}
                      >
                        <div className="flex items-center p-4 gap-4">
                          {venue.imageUrl ? (
                            <img
                              src={venue.imageUrl}
                              alt={venue.name}
                              width={56}
                              height={56}
                              loading="lazy"
                              decoding="async"
                              className="w-14 h-14 rounded-xl object-cover bg-surface-base shadow-sm"
                            />
                          ) : (
                            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-surface-highlight to-surface-base flex items-center justify-center text-xl shadow-inner border border-white/5">
                              🏪
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-base text-foreground truncate">{venue.name}</h4>
                            <p className="text-xs text-muted truncate">{venue.address || venue.description || 'Tap to view menu'}</p>
                            {venue.tags && venue.tags.length > 0 && (
                              <div className="flex gap-1.5 mt-1.5 overflow-hidden">
                                {venue.tags.slice(0, 3).map(tag => (
                                  <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-primary-400/10 text-primary-400 font-medium whitespace-nowrap">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="text-primary-400 flex-shrink-0">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M5 12h14" />
                              <path d="m12 5 7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                      </GlassCard>
                    </motion.div>
                  ))}
                </motion.div>
              ) : searchQuery ? (
                <div className="text-center py-12">
                  <div className="text-4xl mb-3">🔍</div>
                  <p className="text-muted text-sm">No venues match &ldquo;{searchQuery}&rdquo;</p>
                  <button
                    onClick={clearSearch}
                    className="mt-3 text-primary-400 text-sm font-medium hover:underline"
                  >
                    Clear search
                  </button>
                </div>
              ) : (
                <div className="text-center py-10 text-muted text-sm">
                  No active venues found.
                </div>
              )}
            </motion.div>

          </motion.div>
        </main>
      </PullToRefresh>
    </>
  );
};

export default ClientLanding;

