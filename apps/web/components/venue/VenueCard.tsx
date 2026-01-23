import Link from 'next/link'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import Image from 'next/image'

export interface VenueCardProps {
    venue: {
        id: string
        name: string
        slug: string
        description?: string | null
        image_url?: string | null
        cuisine_types?: string[] | null
        price_range?: string | null
        city: string
        rating?: number | null
    }
}

export function VenueCard({ venue }: VenueCardProps) {
    return (
        <Link href={`/venues/${venue.slug}`}>
            <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <div className="w-full">
                    <AspectRatio ratio={16 / 9}>
                        {/* Use a valid src even if empty to avoid next/image error, or handle null */}
                        <Image
                            src={venue.image_url || '/images/placeholder-venue.jpg'}
                            alt={venue.name}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                    </AspectRatio>
                </div>
                <CardHeader className="p-4 space-y-2">
                    <div className="flex justify-between items-start">
                        <div className="space-y-1">
                            <CardTitle className="line-clamp-1">{venue.name}</CardTitle>
                            <CardDescription className="line-clamp-1">{venue.city}</CardDescription>
                        </div>
                        {venue.rating && (
                            <Badge variant="secondary" className="shrink-0">
                                ★ {venue.rating.toFixed(1)}
                            </Badge>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                        {venue.description}
                    </p>
                </CardContent>
                <CardFooter className="p-4 pt-0 flex gap-2 flex-wrap">
                    {venue.price_range && (
                        <Badge variant="outline" className="text-muted-foreground border-border/50">{venue.price_range}</Badge>
                    )}
                    {(venue.cuisine_types || []).slice(0, 3).map((cuisine) => (
                        <Badge key={cuisine} variant="secondary" className="bg-secondary/50 backdrop-blur-sm">
                            {cuisine}
                        </Badge>
                    ))}
                </CardFooter>
            </Card>
        </Link>
    )
}
