import { Button } from "@/components/ui/button"
import Link from 'next/link'

interface VenueInfoWidgetProps {
    venue: {
        slug: string
        price_range?: string | null
        rating?: number | null
        address: string
        phone_number?: string | null
        website?: string | null
    }
}

export function VenueInfoWidget({ venue }: VenueInfoWidgetProps) {
    return (
        <div className="p-6 border rounded-lg space-y-4 bg-card text-card-foreground shadow-sm">
            <div className="flex justify-between items-center">
                <span className="font-semibold text-muted-foreground">Price Range</span>
                <span className="font-medium">{venue.price_range || 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center">
                <span className="font-semibold text-muted-foreground">Rating</span>
                <span className="font-medium flex items-center gap-1">
                    <span className="text-yellow-500">★</span> {venue.rating?.toFixed(1) || 'N/A'}
                </span>
            </div>
            <div className="space-y-1">
                <span className="font-semibold text-muted-foreground block">Address</span>
                <span className="text-right block">{venue.address}</span>
            </div>

            <div className="pt-4">
                <Link href={`/venues/${venue.slug}/menu`} className="w-full block">
                    <Button className="w-full font-semibold" size="lg">
                        View Menu
                    </Button>
                </Link>
            </div>
        </div>
    )
}
