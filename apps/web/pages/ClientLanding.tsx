import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GlassCard } from '../components/GlassCard';

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

  const lastVenueId = typeof window !== 'undefined'
    ? localStorage.getItem('last_venue_id')
    : null;

  useEffect(() => {
    if (lastVenueId) {
      navigate(`/v/${lastVenueId}`, { replace: true });
    }
  }, [lastVenueId, navigate]);

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

  if (lastVenueId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted">Loading your last venue...</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background pt-safe-top pb-24 flex items-center justify-center p-6">
      <GlassCard className="w-full max-w-md">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-foreground">Start your order</h1>
          <p className="text-sm text-muted">
            Scan the QR code at your table, or paste a menu link below.
          </p>
        </div>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label htmlFor="menu-input" className="text-sm font-medium text-muted">
              Menu link or venue code
            </label>
            <input
              id="menu-input"
              type="text"
              value={menuInput}
              onChange={(event) => setMenuInput(event.target.value)}
              placeholder="https://dinein.mt/#/v/venue-id"
              className="w-full px-4 py-3 bg-surface-highlight border border-border rounded-xl text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              autoComplete="off"
              inputMode="url"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="table-input" className="text-sm font-medium text-muted">
              Table code (optional)
            </label>
            <input
              id="table-input"
              type="text"
              value={tableInput}
              onChange={(event) => setTableInput(event.target.value)}
              placeholder="Table 12"
              className="w-full px-4 py-3 bg-surface-highlight border border-border rounded-xl text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              autoComplete="off"
            />
          </div>

          {error && (
            <div className="text-sm text-red-500" role="alert">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 px-6 bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-bold rounded-xl shadow-lg hover:shadow-xl active:scale-95 transition-all duration-200"
          >
            Open menu
          </button>
        </form>
      </GlassCard>
    </main>
  );
};

export default ClientLanding;
