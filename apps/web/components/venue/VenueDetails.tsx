'use client';

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Image from 'next/image'
import Link from 'next/link'
import { DynamicVenueCategories } from './DynamicVenueCategories';
import { useAICategorization } from "@/hooks/useAICategorization"
import { useEffect } from "react"

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
    const { fetchVenueCategories } = useAICategorization(venue.id, venue.name, venue.address || '');

    useEffect(() => {
        fetchVenueCategories();
    }, [venue.id, fetchVenueCategories]);

    return (
        <div className="space-y-6">
            <div className="relative h-[400px] w-full overflow-hidden rounded-2xl group shadow-lg">
                <Image
                    src={venue.cover_image_url || venue.image_url || '/images/placeholder-venue.jpg'}
                    alt={venue.name}
                    fill
                    className="object-cover"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-8">
                    <div className="text-white w-full">
                        <div className="flex justify-between items-start">
                            <h1 className="text-3xl font-bold mb-2">{venue.name}</h1>
                            {/* Rich Dynamic Categories */}
                            <div className="mt-4">
                                <DynamicVenueCategories
                                    venueId={venue.id}
                                    venueName={venue.name}
                                    venueAddress={venue.address || ''}
                                    className="max-w-3xl"
                                />
                            </div>
                        </div>
                        <p className="text-lg opacity-90">{venue.address}</p>
                    </div>
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-6">
                    <section>
                        <h2 className="text-2xl font-semibold mb-4">About</h2>
                        <p className="text-muted-foreground whitespace-pre-line">
                            {venue.description}
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">Features</h2>
                        <div className="flex flex-wrap gap-2">
                            {venue.features?.map(feature => (
                                <Badge key={feature} variant="secondary">
                                    {feature.replace(/_/g, ' ')}
                                </Badge>
                            ))}
                        </div>
                    </section>
                </div>

                <div className="space-y-6">
                    <div className="p-6 border rounded-lg space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="font-semibold">Price Range</span>
                            <span className="text-muted-foreground">{venue.price_range}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="font-semibold">Rating</span>
                            <span className="text-muted-foreground">★ {venue.rating?.toFixed(1) || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between items-start">
                            <span className="font-semibold">Address</span>
                            <span className="text-muted-foreground text-right">{venue.address}</span>
                        </div>
                        <Link href={`/venues/${venue.slug}/menu`} className="w-full block">
                            <Button className="w-full">
                                View Menu
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
