import { useState, useEffect } from 'react'
import { VenueCard, useCountry, EmptyState, ListScreenTemplate } from '@dinein/ui'
import { getVenuesForCountry, Venue } from '@dinein/db'
import { MICROCOPY } from '@dinein/core'
import { MapPin } from 'lucide-react'
import { supabase } from '../shared/services/supabase'
import { BottomNav } from '../components/BottomNav'

export default function Home() {
    const { countryCode, country } = useCountry()
    const [venues, setVenues] = useState<Venue[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchVenues = async () => {
            setLoading(true)
            try {
                const result = await getVenuesForCountry(supabase, countryCode)
                setVenues(result.venues)
            } catch (error) {
                console.error('Error fetching venues:', error)
                setVenues([])
            } finally {
                setLoading(false)
            }
        }

        fetchVenues()
    }, [countryCode])

    // Custom header content with country badge
    const headerContent = (
        <div className="flex items-center justify-between px-4 py-3">
            <div>
                <h1 className="text-2xl font-bold">Discover</h1>
                <p className="text-sm text-muted-foreground">
                    {country ? `Exploring ${country.name}` : 'Select a country'}
                </p>
            </div>
            {country && (
                <div className="flex items-center gap-1 rounded-full bg-muted/50 px-3 py-1 text-xs font-medium">
                    <span className="text-base">{country.flag}</span>
                    <span>{country.currency}</span>
                </div>
            )}
        </div>
    )

    return (
        <>
            <ListScreenTemplate
                title=""
                hideSearch={true}
                loading={loading}
                isEmpty={venues.length === 0}
                emptyState={
                    <EmptyState
                        variant="no-results"
                        icon={<MapPin className="h-8 w-8" />}
                        title={MICROCOPY.states.empty.venues.title}
                        description={`${MICROCOPY.states.empty.venues.description}`}
                    />
                }
            >
                {/* Custom header replaces built-in title */}
                <div className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b border-border -mt-14">
                    {headerContent}
                </div>

                {/* Venue list */}
                <div className="grid gap-5 p-4">
                    {venues.map((venue, idx) => (
                        <VenueCard
                            key={venue.id}
                            id={venue.id}
                            name={venue.name}
                            slug={venue.slug}
                            image={venue.ai_image_url ?? undefined}
                            country={venue.country as 'RW' | 'MT'}
                            rating={venue.rating}
                            priceLevel={venue.price_level}
                            description={venue.description}
                            city={venue.city}
                            featured={idx < 2 && (venue.rating ?? 0) >= 4.5}
                        />
                    ))}
                </div>
            </ListScreenTemplate>

            {/* Bottom Navigation - EXACTLY 2 tabs per STARTER RULES */}
            <BottomNav />
        </>
    )
}
