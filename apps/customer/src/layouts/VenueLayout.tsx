import { Outlet, useParams } from 'react-router-dom'
import { VenueProvider } from '../context/VenueContext'
import { useVenue } from '../hooks/useVenue'

import { useEffect } from 'react'
import { useCountry } from '@dinein/ui'

export function VenueLayout() {
    const { slug } = useParams<{ slug: string }>()
    const { venue, loading, error } = useVenue(slug)
    const { setCountry } = useCountry()

    useEffect(() => {
        if (venue?.country) {
            setCountry(venue.country as 'RW' | 'MT')
        }
    }, [venue?.country, setCountry])

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center p-4">
                {/* Placeholder for skeleton/loading state */}
                <div className="animate-pulse text-muted-foreground">Loading venue...</div>
            </div>
        )
    }

    if (error || !venue) {
        return (
            <div className="flex h-screen items-center justify-center p-4">
                <div className="text-center">
                    <h1 className="text-xl font-bold">Venue Not Found</h1>
                    <p className="text-muted-foreground">The venue you are looking for does not exist.</p>
                </div>
            </div>
        )
    }

    return (
        <VenueProvider value={{ venue, loading, error }}>
            <main className="min-h-screen bg-background pb-20">
                <Outlet />
            </main>
        </VenueProvider>
    )
}
