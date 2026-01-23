'use client';

import { Badge } from "@/components/ui/badge"

import Image from 'next/image'
import { FluidGradient } from "@/components/ui/fluid-gradient"

import { VenueInfoWidget } from './VenueInfoWidget'

interface VenueDetailsProps {
    venue: {
        id: string
        name: string
        slug: string
        description?: string | null
        image_url?: string | null
        cover_image_url?: string | null
        cuisine_types?: string[] | null
        price_range?: string | null
        city: string
        address: string
        rating?: number | null
        features?: string[] | null
        opening_hours?: unknown
    }
}

export function VenueDetails({ venue }: VenueDetailsProps) {
    return (
        <div className="space-y-6">
            <div className="relative h-[400px] w-full overflow-hidden rounded-2xl group shadow-lg">
                {venue.cover_image_url || venue.image_url ? (
                    <Image
                        src={venue.cover_image_url || venue.image_url!}
                        alt={venue.name}
                        fill
                        className="object-cover"
                        priority
                    />
                ) : (
                    // @ts-ignore
                    <FluidGradient seed={venue.name} variant="vibrant" className="w-full h-full" />
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-8">
                    <div className="text-white w-full">
                        <div className="flex justify-between items-start">
                            <h1 className="text-4xl md:text-5xl font-bold mb-3 drop-shadow-md">{venue.name}</h1>
                        </div>
                        <p className="text-lg md:text-xl text-white/90 drop-shadow-sm max-w-2xl">{venue.address}</p>

                        {/* Static Categories from DB */}
                        <div className="mt-6 flex flex-wrap gap-2">
                            {/* Primary Category Badge */}
                            {venue.cuisine_types && venue.cuisine_types.length > 0 && (
                                <Badge className="bg-primary hover:bg-primary/90 text-primary-foreground border-primary/20 backdrop-blur-md shadow-sm h-7 px-3 text-sm">
                                    {venue.cuisine_types[0]}
                                </Badge>
                            )}
                            {/* Other cuisine types */}
                            {venue.cuisine_types?.slice(1).map(type => (
                                <Badge key={type} variant="secondary" className="bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-md shadow-sm h-7 px-3 text-sm">
                                    {type}
                                </Badge>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-6">
                    <section>
                        <h2 className="text-2xl font-semibold mb-4">About</h2>
                        <p className="text-muted-foreground whitespace-pre-line">
                            {venue.description || "No description available."}
                        </p>
                    </section>

                    {venue.features && venue.features.length > 0 && (
                        <section>
                            <h2 className="text-2xl font-semibold mb-4">Features</h2>
                            <div className="flex flex-wrap gap-2">
                                {venue.features.map(feature => (
                                    <Badge key={feature} variant="secondary">
                                        {feature.replace(/_/g, ' ')}
                                    </Badge>
                                ))}
                            </div>
                        </section>
                    )}
                </div>

                <div className="space-y-6">
                    <VenueInfoWidget venue={venue} />
                </div>
            </div>
        </div>
    )
}
