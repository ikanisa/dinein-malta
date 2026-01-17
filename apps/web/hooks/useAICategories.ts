import { useQuery, useMutation } from '@tanstack/react-query'
import {
    VenueCategorizationResponse,
    MenuItemCategorizationResponse
} from '@/lib/types/ai.types'

export function useVenueCategories(venueId: string) {
    return useQuery({
        queryKey: ['venue-categories', venueId],
        queryFn: async () => {
            // Check session storage first
            const cached = sessionStorage.getItem(`categories:venue:${venueId}`)
            if (cached) {
                return JSON.parse(cached) as VenueCategorizationResponse
            }

            // Fetch from API
            const response = await fetch('/api/ai/categorize-venue', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ venueId }),
            })

            if (!response.ok) throw new Error('Failed to categorize venue')

            const data = await response.json()

            // Cache in session storage
            sessionStorage.setItem(
                `categories:venue:${venueId}`,
                JSON.stringify(data.categories)
            )

            return data.categories as VenueCategorizationResponse
        },
        staleTime: 24 * 60 * 60 * 1000, // 24 hours
    })
}

export function useMenuItemCategories(itemId: string) {
    return useQuery({
        queryKey: ['item-categories', itemId],
        queryFn: async () => {
            const cached = sessionStorage.getItem(`categories:item:${itemId}`)
            if (cached) return JSON.parse(cached) as MenuItemCategorizationResponse

            const response = await fetch('/api/ai/categorize-item', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ itemId }),
            })

            if (!response.ok) throw new Error('Failed to categorize item')

            const data = await response.json()

            sessionStorage.setItem(
                `categories:item:${itemId}`,
                JSON.stringify(data.categories)
            )

            return data.categories as MenuItemCategorizationResponse
        },
        staleTime: 7 * 24 * 60 * 60 * 1000, // 7 days
    })
}

export function useGenerateVenueImage() {
    return useMutation({
        mutationFn: async (venueId: string) => {
            const response = await fetch('/api/ai/generate-venue-image', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ venueId }),
            })

            if (!response.ok) throw new Error('Failed to generate image')
            return response.json()
        },
    })
}
