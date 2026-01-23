import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

export interface Venue {
    id: string
    name: string
    slug: string
    description: string
    address: string
    city: string
    latitude: number
    longitude: number
    image_url?: string
    cover_image_url?: string
    cuisine_types: string[]
    price_range: string
    hours: Record<string, { open: string; close: string; closed?: boolean }> | null
    features: string[]
    is_published: boolean
    phone?: string
    website?: string
    country?: string
    amenities?: string[]
}

export function useVenues(filters?: {
    city?: string
    cuisine?: string
    price_range?: string
    page?: number
    limit?: number
}) {
    return useQuery({
        queryKey: ['venues', filters],
        queryFn: async () => {
            const params = new URLSearchParams()
            if (filters?.city) params.set('city', filters.city)
            if (filters?.cuisine) params.set('cuisine', filters.cuisine)
            if (filters?.price_range) params.set('price_range', filters.price_range)
            if (filters?.page) params.set('page', filters.page.toString())
            if (filters?.limit) params.set('limit', filters.limit.toString())

            const response = await fetch(`/api/venues?${params}`)
            if (!response.ok) throw new Error('Failed to fetch venues')
            return response.json()
        },
    })
}

export function useVenue(slug: string) {
    const supabase = createClient()

    return useQuery({
        queryKey: ['venue', slug],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('vendors')
                .select('*, latitude:lat, longitude:lng, image_url:ai_image_url, price_range:price_level, hours:hours_json')
                .eq('slug', slug)
                .single()

            if (error) throw error
            // Cast strictly if needed to match frontend Venue interface
            return data as unknown as Venue
        },
    })
}

export function useNearbyVenues(lat: number, lng: number, radius = 10) {
    return useQuery({
        queryKey: ['venues', 'nearby', lat, lng, radius],
        queryFn: async () => {
            const params = new URLSearchParams({
                lat: lat.toString(),
                lng: lng.toString(),
                radius: radius.toString(),
            })

            const response = await fetch(`/api/venues/nearby?${params}`)
            if (!response.ok) throw new Error('Failed to fetch nearby venues')
            return response.json()
        },
        enabled: !!lat && !!lng,
    })
}

export function useCreateVenue() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (venue: Partial<Venue>) => {
            const response = await fetch('/api/venues', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(venue),
            })

            if (!response.ok) throw new Error('Failed to create venue')
            return response.json()
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['venues'] })
        },
    })
}
