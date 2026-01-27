import {
    Wifi,
    ParkingCircle,
    Accessibility,
    Baby,
    Dog,
    CreditCard,
    Music,
    Utensils,
    Beer,
    Coffee,
    Leaf,
    Clock,
    type LucideIcon
} from 'lucide-react';
import { cn } from '../lib/utils';

// Common amenity types with their icons
export const AMENITY_ICONS: Record<string, LucideIcon> = {
    wifi: Wifi,
    parking: ParkingCircle,
    accessible: Accessibility,
    'kid-friendly': Baby,
    'pet-friendly': Dog,
    'card-payment': CreditCard,
    'live-music': Music,
    outdoor: Leaf,
    bar: Beer,
    coffee: Coffee,
    restaurant: Utensils,
    '24h': Clock,
};

export interface Amenity {
    id: string;
    label: string;
    icon?: LucideIcon | string;
}

export interface VenueAmenityGridProps {
    /** Array of amenities to display */
    amenities: Amenity[];
    /** Maximum items to show before truncating */
    maxItems?: number;
    /** Show "more" indicator when truncated */
    showMore?: boolean;
    /** Size variant */
    size?: 'sm' | 'md';
    /** Additional className */
    className?: string;
}

/**
 * VenueAmenityGrid
 * Icon + label chips for venue amenities.
 * No photos needed - uses icon-based visual representation.
 */
export function VenueAmenityGrid({
    amenities,
    maxItems = 6,
    showMore = true,
    size = 'md',
    className,
}: VenueAmenityGridProps) {
    const displayedAmenities = amenities.slice(0, maxItems);
    const remainingCount = amenities.length - maxItems;

    const getIcon = (amenity: Amenity): LucideIcon => {
        if (typeof amenity.icon === 'function') {
            return amenity.icon;
        }
        if (typeof amenity.icon === 'string' && AMENITY_ICONS[amenity.icon]) {
            return AMENITY_ICONS[amenity.icon];
        }
        // Try to match by ID
        if (AMENITY_ICONS[amenity.id]) {
            return AMENITY_ICONS[amenity.id];
        }
        // Default icon
        return Utensils;
    };

    return (
        <div
            className={cn('flex flex-wrap gap-2', className)}
            role="list"
            aria-label="Venue amenities"
        >
            {displayedAmenities.map((amenity) => {
                const Icon = getIcon(amenity);
                return (
                    <div
                        key={amenity.id}
                        role="listitem"
                        className={cn(
                            'inline-flex items-center gap-1.5 rounded-full',
                            'bg-muted/50 border border-border',
                            'text-muted-foreground',
                            size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
                        )}
                    >
                        <Icon className={cn(size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5')} />
                        <span className="font-medium">{amenity.label}</span>
                    </div>
                );
            })}

            {showMore && remainingCount > 0 && (
                <div
                    className={cn(
                        'inline-flex items-center rounded-full',
                        'bg-primary/10 border border-primary/20',
                        'text-primary font-medium',
                        size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
                    )}
                >
                    +{remainingCount} more
                </div>
            )}
        </div>
    );
}
