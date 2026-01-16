import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GlassCard } from '../components/GlassCard';
import Button from '../components/common/Button';
import Input from '../components/ui/Input';
import { useVendors } from '../hooks/useVendors';

type ParsedVenue = {
  venueId: string;
  tableCode?: string;
};

const safeDecode = (value: string) => {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};

const parseVenueInput = (rawInput: string): ParsedVenue | null => {
  const trimmed = rawInput.trim();
  if (!trimmed) return null;

  const withoutDomain = trimmed.replace(/^https?:\/\/[^/]+/i, '');
  const match = withoutDomain.match(/\/v\/([^/?#]+)(?:\/t\/([^/?#]+))?/i);
  if (match) {
    return {
      venueId: safeDecode(match[1]),
      tableCode: match[2] ? safeDecode(match[2]) : undefined,
    };
  }

  const shortMatch = withoutDomain.match(/^#?\/?v\/([^/?#]+)(?:\/t\/([^/?#]+))?/i);
  if (shortMatch) {
    return {
      venueId: safeDecode(shortMatch[1]),
      tableCode: shortMatch[2] ? safeDecode(shortMatch[2]) : undefined,
    };
  }

  return { venueId: trimmed };
};

const ClientLanding: React.FC = () => {
  const navigate = useNavigate();
  const [menuInput, setMenuInput] = useState('');
  const [tableInput, setTableInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Fetch active venues for exploration
  const { data: venues, isLoading } = useVendors({ status: 'active' });

  // Get last visited venue for quick access (but no auto-redirect)
  const lastVenueId = typeof window !== 'undefined'
    ? localStorage.getItem('last_venue_id')
    : null;

  // Find the last venue object if available
  const lastVenue = venues?.find(v => v.id === lastVenueId);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    const parsed = parseVenueInput(menuInput);
    if (!parsed?.venueId) {
      setError('Enter a menu link or venue code to continue.');
      return;
    }

    const tableCode = tableInput.trim() || parsed.tableCode;
    const target = tableCode
      ? `/v/${parsed.venueId}/t/${tableCode}`
      : `/v/${parsed.venueId}`;
    navigate(target);
  };

  return (
    <main className="min-h-screen bg-background pt-safe-top pb-24 px-4 overflow-y-auto">
      <div className="max-w-md mx-auto py-6 space-y-8">

        {/* Header Section */}
        <div
          className="text-center space-y-2 cursor-pointer active:scale-95 transition-transform select-none"
          onClick={() => window.location.reload()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && window.location.reload()}
        >
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent">
            DineIn
          </h1>
          <p className="text-sm text-muted">
            Order & pay from your phone
          </p>
        </div>

        {/* Manual Entry Card */}
        <GlassCard className="w-full">
          <div className="text-center mb-4">
            <h2 className="text-lg font-bold text-foreground">Start your order</h2>
            <p className="text-xs text-muted">
              Scan QR code or enter details below
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <Input
                id="menu-input"
                label="Menu / Venue"
                type="text"
                value={menuInput}
                onChange={(event) => setMenuInput(event.target.value)}
                placeholder="Paste link or code"
                variant="filled"
                autoComplete="off"
                inputMode="url"
              />

              <Input
                id="table-input"
                label="Table (Optional)"
                type="text"
                value={tableInput}
                onChange={(event) => setTableInput(event.target.value)}
                placeholder="e.g. 12"
                variant="filled"
                autoComplete="off"
              />
            </div>

            {error && (
              <div className="text-xs text-red-400 font-medium px-1" role="alert">
                {error}
              </div>
            )}

            <Button
              type="submit"
              variant="gradient"
              className="w-full py-3.5 font-bold"
            >
              Go to Menu
            </Button>
          </form>
        </GlassCard>

        {/* Recently Visited (if available) */}
        {lastVenue && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted px-1">Recently Visited</h3>
            <GlassCard
              className="p-0 overflow-hidden hover:bg-surface-highlight transition-colors cursor-pointer active:scale-[0.99] transition-transform"
              onClick={() => navigate(`/v/${lastVenue.id}`)}
            >
              <div className="flex items-center p-3 gap-4">
                {lastVenue.imageUrl ? (
                  <img src={lastVenue.imageUrl} alt={lastVenue.name} className="w-12 h-12 rounded-lg object-cover bg-surface-base" />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-surface-base flex items-center justify-center text-xl">
                    🍽️
                  </div>
                )}
                <div>
                  <div className="font-bold text-foreground">{lastVenue.name}</div>
                  <div className="text-xs text-muted">Tap to reopen menu</div>
                </div>
              </div>
            </GlassCard>
            <div className="h-px bg-border/50 mx-4" />
          </div>
        )}

        {/* Explore Card List */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-muted px-1">Explore Venues</h3>

          {isLoading ? (
            <div className="space-y-3 animate-pulse">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-surface-highlight rounded-2xl w-full opacity-50" />
              ))}
            </div>
          ) : venues && venues.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {venues.map((venue) => (
                <GlassCard
                  key={venue.id}
                  className="p-0 overflow-hidden hover:bg-surface-highlight transition-colors cursor-pointer active:scale-[0.99] transition-transform"
                  onClick={() => navigate(`/v/${venue.id}`)}
                >
                  {/* Optional: if we had banner images, we could use them here. For now, list style. */}
                  <div className="flex items-center p-4 gap-4">
                    {venue.imageUrl ? (
                      <img src={venue.imageUrl} alt={venue.name} className="w-16 h-16 rounded-xl object-cover bg-surface-base shadow-sm" />
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-surface-highlight to-surface-base flex items-center justify-center text-2xl shadow-inner border border-white/5">
                        🏪
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-lg text-foreground truncate">{venue.name}</h4>
                      <p className="text-xs text-muted truncate">{venue.address || 'Excellent dining'}</p>
                      {venue.openingHours && (
                        <div className="mt-1 flex items-center gap-1 text-[10px] text-green-400 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                          Open
                        </div>
                      )}
                    </div>
                    <div className="text-primary-400">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12h14" />
                        <path d="m12 5 7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-muted text-sm">
              No active venues found.
            </div>
          )}
        </div>

      </div>
    </main>
  );
};

export default ClientLanding;
