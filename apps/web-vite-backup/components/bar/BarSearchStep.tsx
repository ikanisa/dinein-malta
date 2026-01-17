import React, { useState, useMemo } from 'react';
import { GlassCard } from '../GlassCard';
import { Spinner } from '../Loading';
import { searchBars } from '../../services/barService';
import { Venue } from '../../types';
import { debounce } from '../../utils/debounce';

interface BarSearchStepProps {
    onSelect: (venue: Venue) => void;
    onAddNew: () => void;
}

export const BarSearchStep: React.FC<BarSearchStepProps> = ({ onSelect, onAddNew }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Venue[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    const debouncedSearch = useMemo(
        () =>
            debounce(async (searchQuery: string) => {
                if (searchQuery.length < 2) {
                    setResults([]);
                    setHasSearched(false);
                    return;
                }

                setIsSearching(true);
                try {
                    const bars = await searchBars(searchQuery);
                    setResults(bars);
                    setHasSearched(true);
                } catch (error) {
                    console.error('Search failed:', error);
                    setResults([]);
                } finally {
                    setIsSearching(false);
                }
            }, 300),
        []
    );

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setQuery(value);
        debouncedSearch(value);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="text-center">
                <div className="text-5xl mb-4">🔍</div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Find Your Bar</h2>
                <p className="text-muted text-sm">
                    Search for your bar or restaurant, or add a new one
                </p>
            </div>

            {/* Search Input */}
            <div className="relative">
                <input
                    type="text"
                    value={query}
                    onChange={handleInputChange}
                    placeholder="Search by name or address..."
                    className="w-full px-4 py-4 bg-surface-highlight border border-border rounded-xl text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    autoFocus
                />
                {isSearching && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        <Spinner className="w-4 h-4" />
                    </div>
                )}
            </div>

            {/* Results */}
            {hasSearched && (
                <div className="space-y-3">
                    {results.length > 0 ? (
                        <>
                            <p className="text-sm text-muted">
                                Found {results.length} bar{results.length !== 1 ? 's' : ''}
                            </p>
                            {results.map((venue) => (
                                <GlassCard
                                    key={venue.id}
                                    onClick={() => onSelect(venue)}
                                    className="flex items-center gap-4 cursor-pointer active:scale-95 transition-transform"
                                >
                                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-2xl">
                                        🍺
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-bold text-foreground">{venue.name}</div>
                                        {venue.address && (
                                            <div className="text-sm text-muted line-clamp-1">{venue.address}</div>
                                        )}
                                    </div>
                                    <div className="text-muted">→</div>
                                </GlassCard>
                            ))}
                        </>
                    ) : (
                        <GlassCard className="text-center py-8">
                            <div className="text-4xl mb-3">🤷</div>
                            <p className="text-muted mb-1">No bars found matching &ldquo;{query}&rdquo;</p>
                            <p className="text-sm text-muted">You can add it as a new bar below</p>
                        </GlassCard>
                    )}
                </div>
            )}

            {/* Add New Button */}
            <button
                onClick={onAddNew}
                className="w-full py-4 px-6 bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-bold rounded-xl shadow-lg hover:shadow-xl active:scale-95 transition-all duration-200"
            >
                + Add New Bar
            </button>

            {/* Skip hint */}
            <p className="text-center text-xs text-muted">
                Can&apos;t find your bar? Click &ldquo;Add New Bar&rdquo; to register it
            </p>
        </div>
    );
};

export default BarSearchStep;
