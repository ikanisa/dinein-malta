import { createContext, useContext, ReactNode } from 'react'
import { Venue } from '@dinein/db'

interface VenueContextType {
    venue: Venue | null
    loading: boolean
    error: Error | null
}

const VenueContext = createContext<VenueContextType | undefined>(undefined)

export function VenueProvider({
    children,
    value
}: {
    children: ReactNode
    value: VenueContextType
}) {
    return (
        <VenueContext.Provider value={value}>
            {children}
        </VenueContext.Provider>
    )
}

export function useVenueContext() {
    const context = useContext(VenueContext)
    if (context === undefined) {
        throw new Error('useVenueContext must be used within a VenueProvider')
    }
    return context
}
