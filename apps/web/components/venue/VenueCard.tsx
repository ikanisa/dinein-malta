import Link from 'next/link'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import Image from 'next/image'
import { FluidGradient } from "@/components/ui/fluid-gradient"

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
                    <div className="aspect-video w-full relative">
                        {venue.image_url ? (
                            <Image
                                src={venue.image_url}
                                alt={venue.name}
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            />
                        ) : (
                            <div className="w-full h-full relative">
                                {/* @ts-ignore */}
                                <FluidGradient seed={venue.name} className="w-full h-full" />
                                <div className="absolute inset-0 flex items-center justify-center p-4">
                                    <h3 className="text-2xl font-bold text-black/20 mix-blend-overlay text-center line-clamp-2 select-none">
                                        {venue.name.charAt(0)}
                                    </h3>
                                </div>
                            </div>
                        )}
                    </div>
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
