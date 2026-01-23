import { VenueCard, VenueCardProps } from "./VenueCard"

interface VenueGridProps {
    venues: VenueCardProps['venue'][]
}

export function VenueGrid({ venues }: VenueGridProps) {
    if (!venues || venues.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-muted-foreground">No venues found.</p>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {venues.map((venue) => (
                <VenueCard key={venue.slug} venue={venue} />
            ))}
        </div>
    )
}
