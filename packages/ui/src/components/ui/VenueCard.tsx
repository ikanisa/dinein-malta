import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, MapPin, Utensils } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface VenueCardProps {
    id: string;
    name: string;
    slug: string;
    country: 'RW' | 'MT';
    className?: string;
    featured?: boolean;
    image?: string;
    rating?: number | null;
    priceLevel?: number | null;
    description?: string | null;
    city?: string | null;
}

const priceLabels = ['$', '$$', '$$$', '$$$$'];

export function VenueCard({
    name,
    slug,
    country,
    className,
    featured,
    image,
    rating,
    priceLevel,
    description,
    city
}: VenueCardProps) {
    const hasImage = image && image.length > 0;
    const countryConfig = country === 'RW'
        ? { name: 'Rwanda', color: 'from-amber-500/80 to-orange-600/80', accent: 'bg-amber-500', payment: 'MoMo' }
        : { name: 'Malta', color: 'from-blue-500/80 to-indigo-600/80', accent: 'bg-blue-500', payment: 'Revolut' };

    return (
        <Link to={`/v/${slug}`} className={cn("block group", className)}>
            <motion.div
                whileHover={{ y: -4, scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                className={cn(
                    "relative overflow-hidden rounded-3xl",
                    "bg-gradient-to-br from-white/10 to-white/5",
                    "backdrop-blur-xl border border-white/20",
                    "shadow-xl shadow-black/10",
                    featured && "ring-2 ring-primary/50 ring-offset-2 ring-offset-background"
                )}
            >
                {/* Image Section */}
                <div className="relative h-36 overflow-hidden">
                    {hasImage ? (
                        <img
                            src={image}
                            alt={name}
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            loading="lazy"
                        />
                    ) : (
                        <div className={cn(
                            "absolute inset-0 bg-gradient-to-br",
                            countryConfig.color,
                            "flex items-center justify-center"
                        )}>
                            <Utensils className="w-12 h-12 text-white/40" />
                        </div>
                    )}

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                    {/* Featured Badge */}
                    {featured && (
                        <div className="absolute top-3 left-3">
                            <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider bg-primary text-white rounded-full shadow-lg shadow-primary/30">
                                Featured
                            </span>
                        </div>
                    )}

                    {/* Rating Badge */}
                    {rating && rating > 0 && (
                        <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 bg-black/50 backdrop-blur-md rounded-full">
                            <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                            <span className="text-xs font-semibold text-white">{rating.toFixed(1)}</span>
                        </div>
                    )}

                    {/* Bottom Info on Image */}
                    <div className="absolute bottom-3 left-4 right-4">
                        <h3 className="text-lg font-bold text-white truncate drop-shadow-lg">
                            {name}
                        </h3>
                        {city && (
                            <div className="flex items-center gap-1 mt-0.5">
                                <MapPin className="w-3 h-3 text-white/70" />
                                <span className="text-xs text-white/80 font-medium">{city}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Content Section */}
                <div className="p-4 space-y-3">
                    {/* Description */}
                    {description && (
                        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                            {description}
                        </p>
                    )}

                    {/* Tags Row */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            {/* Country Chip */}
                            <span className={cn(
                                "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
                                "bg-muted/50 text-muted-foreground"
                            )}>
                                <span className={cn("w-2 h-2 rounded-full", countryConfig.accent)} />
                                {countryConfig.name}
                            </span>

                            {/* Payment Chip */}
                            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                                {countryConfig.payment}
                            </span>

                            {/* Price Level */}
                            {priceLevel && priceLevel > 0 && (
                                <span className="text-xs font-medium text-muted-foreground">
                                    {priceLabels[Math.min(priceLevel - 1, 3)]}
                                </span>
                            )}
                        </div>

                        {/* CTA Arrow */}
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 group-hover:bg-primary transition-colors">
                            <svg
                                className="w-4 h-4 text-primary group-hover:text-white transition-colors"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                    </div>
                </div>
            </motion.div>
        </Link>
    );
}
