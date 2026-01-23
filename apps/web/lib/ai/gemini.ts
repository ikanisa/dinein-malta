import { createClient } from '@supabase/supabase-js'
import { cacheService } from './cache'
import {
    VenueCategorizationResponse,
    MenuItemCategorizationResponse
} from '@/lib/types/ai.types'

// Initialize Supabase client for Edge Function invocation
// Using anon key is sufficient as the Edge Function handles public access or internal auth checks
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export type VenueCategorization = VenueCategorizationResponse
export type MenuItemCategorization = MenuItemCategorizationResponse

export class GeminiService {
    /**
     * Invoke Supabase Edge Function
     */
    private async invoke<T>(action: string, payload: unknown): Promise<T> {
        const { data, error } = await supabase.functions.invoke('gemini-features', {
            body: { action, payload },
        })

        if (error) {
            throw new Error(`Gemini API Error: ${error.message}`)
        }

        if (!data.success) {
            throw new Error(`Gemini Operation Failed: ${data.message || 'Unknown error'}`)
        }

        return data.data as T
    }

    /**
     * Categorize venue using Google Maps grounding (via Edge Function)
     */
    async categorizeVenue(venue: {
        id: string
        name: string
        address: string
        description?: string
        latitude?: number
        longitude?: number
    }): Promise<VenueCategorization> {
        const cacheKey = `venue:category:${venue.id}`

        // Check cache using robust cache service
        const cached = await cacheService.get<VenueCategorization>(cacheKey)
        if (cached) {
            return cached
        }

        try {
            const result = await this.invoke<VenueCategorization>('categorize-venue', {
                name: venue.name,
                address: venue.address,
                description: venue.description,
                lat: venue.latitude,
                lng: venue.longitude,
            })

            // Cache for 24 hours
            await cacheService.set(cacheKey, result, 86400)

            return result
        } catch (error) {
            console.error('Gemini categorization error:', error)
            throw new Error('Failed to categorize venue')
        }
    }

    /**
     * Categorize menu item (via Edge Function)
     */
    async categorizeMenuItem(item: {
        id: string
        name: string
        description?: string
        ingredients?: string[]
        venue_context?: {
            name: string
            cuisine_types: string[]
        }
    }): Promise<MenuItemCategorization> {
        const cacheKey = `item:category:${item.id}`

        const cached = await cacheService.get<MenuItemCategorization>(cacheKey)
        if (cached) return cached

        try {
            // Edge Function expects an array of items
            const result = await this.invoke<Record<string, MenuItemCategorization>>('categorize-menu', {
                items: [{
                    id: item.id,
                    name: item.name,
                    description: item.description,
                    // ingredients not yet supported in basic schema but description can carry it
                }],
                venueName: item.venue_context?.name,
            })

            // The result is keyed by ID
            const categorization = result[item.id] || Object.values(result)[0]

            if (!categorization) {
                throw new Error('No categorization returned')
            }

            // Cache for 7 days
            await cacheService.set(cacheKey, categorization, 604800)

            return categorization
        } catch (error) {
            console.error('Menu item categorization error:', error)
            throw new Error('Failed to categorize menu item')
        }
    }

    /**
     * Generate venue image (via Edge Function)
     */
    async generateVenueImage(venue: {
        name: string
        primary_category: string
        ambiance_tags: string[]
        special_features: string[]
    }): Promise<string> {
        // Construct a rich prompt for the edge function
        const prompt = `Create a professional, photorealistic image of ${venue.name}, a ${venue.primary_category}.
Atmosphere: ${venue.ambiance_tags.join(', ')}
Features: ${venue.special_features.join(', ')}`

        try {
            // Use 'generate-image' action which creates base64
            // OR 'generate-asset' if we wanted to save to DB, but existing signature returns string (base64)
            // The Edge Function 'generate-image' returns data URI directly if checking Step 456 line 450

            const result = await this.invoke<string>('generate-image', {
                prompt,
                modelPreference: 'quality'
            })

            return result
        } catch (error) {
            console.error('Image generation error:', error)
            throw new Error('Failed to generate venue image')
        }
    }

    /**
     * Generate menu item image (via Edge Function)
     */
    async generateMenuItemImage(item: {
        name: string
        description: string
        cuisine_style: string
        ingredients?: string[]
    }): Promise<string> {
        const prompt = `Professional food photography of ${item.name}. ${item.description}. Cuisine: ${item.cuisine_style}.`

        try {
            const result = await this.invoke<string>('generate-image', {
                prompt,
                modelPreference: 'fast' // Use fast model for menu items
            })

            return result
        } catch (error) {
            console.error('Menu image generation error:', error)
            throw new Error('Failed to generate menu item image')
        }
    }
}

export const geminiService = new GeminiService()
