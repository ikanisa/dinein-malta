import React from 'react';
import { motion } from 'framer-motion';
import { Star, Heart, Clock, MapPin } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { cn } from '@/lib/utils';

export interface VenueCardProps extends React.HTMLAttributes<HTMLDivElement> {
    id: string;
    image?: string;
    name: string;
    rating?: number;
    reviewCount?: number;
    deliveryTimeMin?: number;
    deliveryTimeMax?: number;
    deliveryFee?: number;
    tags?: string[];
    distance?: string;
    isFavorite?: boolean;
    onToggleFavorite?: (e: React.MouseEvent) => void;
    layoutId?: string;
    variant?: 'featured' | 'list';
}

const getVenueGradient = (name: string) => {
    const gradients = [
        'from-pink-500 to-rose-500',
        'from-purple-500 to-indigo-500',
        'from-blue-500 to-cyan-500',
        'from-emerald-500 to-teal-500',
        'from-amber-500 to-orange-500'
    ];
    const index = name.length % gradients.length;
    return gradients[index];
};

export function VenueCard({
    className,
    variant = 'list',
    id,
    image,
    name,
    rating,
    reviewCount,
    deliveryTimeMin,
    deliveryTimeMax,
    deliveryFee,
    tags,
    distance,
    isFavorite,
    onToggleFavorite,
    layoutId,
    onClick,
    ...props
}: VenueCardProps) {

    // FEATURED VARIANT
    if (variant === 'featured') {
        return (
            <GlassCard
                interactive
                onClick={onClick}
                className={cn("p-0 overflow-hidden group w-[280px] shrink-0 snap-center relative", className)}
                depth="1"
                {...props}
            >
                {/* Image Area */}
                <div className="relative aspect-[4/3]">
                    {image ? (
                        <motion.img
                            layoutId={layoutId || `venue-image-${id}`}
                            src={image}
                            alt={name}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                    ) : (
                        <div className={cn("absolute inset-0 bg-gradient-to-br opacity-90 transition-opacity", getVenueGradient(name))} />
                    )}

                    {!image && (
                        <div className="absolute inset-0 flex items-center justify-center text-white/30 text-8xl font-black mix-blend-overlay select-none">
                            {name[0]}
                        </div>
                    )}

                    {/* Top Badges */}
                    <div className="absolute top-3 left-3 flex gap-2">
                        <div className="bg-white/90 backdrop-blur-md px-2 py-1 rounded-lg text-[10px] font-bold shadow-sm flex items-center gap-1 text-slate-900">
                            <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                            {rating?.toFixed(1) || 'NEW'}
                            {reviewCount && <span className="text-slate-400 font-normal">({reviewCount})</span>}
                        </div>
                    </div>

                    {/* Favorite Button */}
                    {onToggleFavorite && (
                        <button
                            onClick={onToggleFavorite}
                            className="absolute top-3 right-3 p-2 rounded-full bg-black/20 backdrop-blur-md hover:bg-black/30 transition-colors active:scale-90"
                        >
                            <Heart className={cn("w-4 h-4", isFavorite ? "text-rose-500 fill-rose-500" : "text-white")} />
                        </button>
                    )}

                    {/* Bottom Badges */}
                    <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg text-[10px] font-bold text-white shadow-sm flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {deliveryTimeMin}-{deliveryTimeMax} min
                    </div>
                </div>

                {/* Content */}
                <div className="px-4 pt-3 pb-4">
                    <h3 className="font-bold text-lg text-slate-900 truncate tracking-tight">{name}</h3>
                    <p className="text-xs text-slate-500 truncate flex items-center gap-1.5 mt-1">
                        {deliveryFee === 0 ? (
                            <span className="text-emerald-600 font-bold">Free delivery</span>
                        ) : (
                            <span>€{deliveryFee} delivery</span>
                        )}
                        <span className="w-0.5 h-0.5 rounded-full bg-slate-300" />
                        <span>{tags?.slice(0, 2).join(', ') || 'Various'}</span>
                    </p>
                </div>
            </GlassCard>
        );
    }

    // LIST VARIANT (Compact, Horizontal)
    return (
        <GlassCard
            interactive
            onClick={onClick}
            className={cn("p-3 flex gap-4 overflow-hidden relative group", className)}
            depth="1"
            {...props}
        >
            {/* Thumbnail */}
            <div className="w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0 relative shadow-inner bg-slate-100">
                {image ? (
                    <img src={image} alt={name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                ) : (
                    <div className={cn("w-full h-full bg-gradient-to-br flex items-center justify-center text-white/40 text-4xl font-black", getVenueGradient(name))} >
                        {name[0]}
                    </div>
                )}

                {/* Rating Tiny Badge */}
                <div className="absolute bottom-1.5 left-1.5 bg-white/95 backdrop-blur-sm px-1.5 py-0.5 rounded-md flex items-center gap-0.5 shadow-sm">
                    <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                    <span className="text-[10px] font-bold text-slate-700">{rating?.toFixed(1) || 'NEW'}</span>
                    {reviewCount && <span className="text-[10px] text-slate-400">({reviewCount})</span>}
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 flex flex-col justify-center py-0.5">
                <div className="flex justify-between items-start">
                    <h3 className="font-bold text-base text-slate-900 truncate pr-6 group-hover:text-indigo-600 transition-colors">
                        {name}
                    </h3>

                    {onToggleFavorite && (
                        <button
                            onClick={onToggleFavorite}
                            className="absolute top-3 right-3 p-1.5 -mr-1.5 active:scale-90 transition-transform text-slate-300 hover:text-rose-500"
                        >
                            <Heart className={cn("w-4 h-4", isFavorite ? "text-rose-500 fill-rose-500" : "text-current")} />
                        </button>
                    )}
                </div>

                <div className="text-xs text-slate-500 mt-1 mb-2">
                    {tags?.join(', ') || 'Restaurant'}
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-500 mt-auto">
                    <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{deliveryTimeMin}-{deliveryTimeMax} min</span>
                    </div>
                    {distance && (
                        <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            <span>{distance}</span>
                        </div>
                    )}
                    <span className={cn("font-medium ml-auto", deliveryFee === 0 ? "text-emerald-600" : "text-slate-600")}>
                        {deliveryFee === 0 ? 'Free' : `€${deliveryFee}`}
                    </span>
                </div>
            </div>
        </GlassCard>
    );
}
