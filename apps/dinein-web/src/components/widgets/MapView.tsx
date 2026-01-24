import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { MapPin, Navigation } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

// Placeholder for Google Maps implementation
// In a real app, we would use @vis.gl/react-google-maps or @react-google-maps/api

interface Venue {
    id: string;
    name: string;
    distance_meters?: number;
    // ... other props
}

interface MapViewProps {
    className?: string;
    venues: Venue[];
    onVenueClick?: (venue: Venue) => void;
    userLocation?: { lat: number; lng: number };
}

export function MapView({ className, venues, onVenueClick }: MapViewProps) {
    const [selectedId, setSelectedId] = useState<string | null>(null);

    return (
        <div className={cn("relative w-full h-full bg-slate-100 dark:bg-slate-900 overflow-hidden", className)}>
            {/* Placeholder Map Background */}
            <div className="absolute inset-0 bg-[url('https://maps.googleapis.com/maps/api/staticmap?center=35.9375,14.3754&zoom=13&size=600x800&scale=2&style=feature:all|saturation:-100')] bg-cover bg-center opacity-50 grayscale" />

            {/* Interactive Overlay */}
            <div className="absolute inset-0 z-10 p-4">
                {/* Simulated Pins */}
                {venues.slice(0, 5).map((venue, idx) => (
                    <motion.button
                        key={venue.id}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: idx * 0.1 }}
                        className="absolute transform -translate-x-1/2 -translate-y-1/2"
                        style={{
                            top: `${30 + (idx * 15)}%`,
                            left: `${20 + (idx * 20)}%`
                        }}
                        onClick={() => {
                            setSelectedId(venue.id);
                            onVenueClick?.(venue);
                        }}
                    >
                        <div className="relative group">
                            <div className={cn(
                                "w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110",
                                selectedId === venue.id ? "bg-brand-primary text-white scale-125 z-20" : "bg-white text-slate-700 hover:bg-slate-50"
                            )}>
                                <MapPin className="w-5 h-5 fill-current" />
                            </div>
                            <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-md px-3 py-1 rounded-lg shadow-sm text-xs font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                {venue.name}
                            </div>
                        </div>
                    </motion.button>
                ))}

                {/* User Location Pin */}
                <div className="absolute top-1/2 left-1/2 w-4 h-4 bg-brand-primary rounded-full border-2 border-white shadow-lg animate-pulse" />
            </div>

            {/* Controls */}
            <div className="absolute bottom-24 right-4 z-20 flex flex-col gap-2">
                <Button size="icon" variant="glass" className="rounded-full shadow-lg bg-white/80 hover:bg-white text-slate-700">
                    <Navigation className="w-5 h-5" />
                </Button>
            </div>

            {/* Empty State / Message */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none text-center opacity-60">
                <p className="text-sm font-bold text-slate-500 bg-white/50 px-4 py-2 rounded-xl backdrop-blur-sm">
                    Interactive Map Mode (Mock)
                </p>
            </div>
        </div>
    );
}
