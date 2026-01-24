import { motion } from 'framer-motion';
import { ArrowLeft, Star, Clock, MapPin, Heart, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';


interface VenueDetailsProps {
    venue: any; // Using basic type for now, should match Venue interface
    onBack: () => void;
}

export function VenueDetails({ venue, onBack }: VenueDetailsProps) {
    if (!venue) return null;

    return (
        <motion.div
            className="fixed inset-0 z-50 bg-slate-50 dark:bg-slate-900 overflow-y-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
        >
            {/* Hero Image Section with Shared Element Transition */}
            <div className="relative h-[40vh] w-full">
                <motion.img
                    layoutId={`venue-image-${venue.id}`}
                    src={venue.photos_json?.[0] || venue.image}
                    alt={venue.name}
                    className="w-full h-full object-cover"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />

                {/* Navbar */}
                <div className="absolute top-0 left-0 right-0 p-4 pt-safe-top flex justify-between items-center z-20">
                    <button
                        onClick={onBack}
                        className="p-2.5 bg-black/20 backdrop-blur-md rounded-full text-white hover:bg-black/30 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="flex gap-3">
                        <button className="p-2.5 bg-black/20 backdrop-blur-md rounded-full text-white hover:bg-black/30 transition-colors">
                            <Share2 className="w-5 h-5" />
                        </button>
                        <button className="p-2.5 bg-black/20 backdrop-blur-md rounded-full text-white hover:bg-black/30 transition-colors">
                            <Heart className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Venue Info Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white pb-12">
                    <motion.h1
                        layoutId={`venue-title-${venue.id}`}
                        className="text-3xl font-bold mb-2 text-shadow-sm"
                    >
                        {venue.name}
                    </motion.h1>
                    <div className="flex items-center gap-4 text-sm font-medium opacity-90">
                        <span className="flex items-center gap-1 bg-white/20 backdrop-blur-md px-2 py-1 rounded-lg">
                            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                            {venue.rating || "New"}
                        </span>
                        <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            15-30 min
                        </span>
                        <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {venue.distance_meters ? `${(venue.distance_meters / 1000).toFixed(1)} km` : "Nearby"}
                        </span>
                    </div>
                </div>
            </div>

            {/* Content Body - Liquid/Glass styled container */}
            <div className="relative -mt-6 rounded-t-3xl bg-slate-50 dark:bg-slate-900 border-t border-white/20 px-6 py-8 min-h-screen">
                <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mb-8" />

                {/* Menu Preview / Content Placeholder */}
                <div className="space-y-8">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Popular Items</h2>
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex gap-4 p-4 rounded-2xl bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700/50">
                                    <div className="h-20 w-20 bg-slate-100 dark:bg-slate-700 rounded-xl" />
                                    <div className="flex-1 py-1">
                                        <div className="h-5 w-3/4 bg-slate-100 dark:bg-slate-700 rounded-lg mb-2" />
                                        <div className="h-4 w-1/2 bg-slate-50 dark:bg-slate-700/50 rounded-lg" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="h-24" /> {/* Bottom padding */}
            </div>

            {/* Bottom Action Bar */}
            <div className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-t border-slate-200/50 p-4 pb-safe-bottom z-30">
                <Button className="w-full h-14 text-lg rounded-2xl shadow-xl shadow-brand-primary/20">
                    View Menu
                </Button>
            </div>
        </motion.div>
    );
}
