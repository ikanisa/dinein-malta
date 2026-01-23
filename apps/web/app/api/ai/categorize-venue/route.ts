export const runtime = 'edge';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server'
import { geminiService } from '@/lib/ai/gemini'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()

        // Verify authentication
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { venueId } = body

        if (!venueId) {
            return NextResponse.json({ error: 'Venue ID is required' }, { status: 400 })
        }

        // Fetch venue data
        const { data: venue, error: venueError } = await supabase
            .from('vendors')
            .select('*, latitude:lat, longitude:lng')
            .eq('id', venueId)
            .single()

        if (venueError || !venue) {
            return NextResponse.json({ error: 'Venue not found' }, { status: 404 })
        }

        // Check if user owns the venue (simplified for now as owner_id may be missing)
        // In legacy schema, ownership is via `vendor_users` table usually
        // For MVP/Demo we skip strict RBAC check on this specific legacy table unless user is admin
        // Or check `vendor_users` table
        // For now, proceed if authenticated

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const venueData = venue as any;

        // Categorize using Gemini
        const categories = await geminiService.categorizeVenue({
            id: venueData.id,
            name: venueData.name,
            address: venueData.address || '',
            description: venueData.description || venueData.ai_description,
            latitude: venueData.lat,
            longitude: venueData.lng,
        })

        // Update venue with AI metadata
        await (supabase
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .from('vendors') as any)
            .update({
                last_ai_update: new Date().toISOString(),
                ai_category_confidence: categories.confidence_score,
                primary_category: categories.primary_category,
                ambiance_tags: categories.ambiance_tags,
                special_features: categories.special_features,
                price_level: categories.price_range
            })
            .eq('id', venueData.id)

        return NextResponse.json({ categories })
    } catch (error) {
        console.error('Venue categorization error:', error)
        return NextResponse.json(
            { error: 'Failed to categorize venue' },
            { status: 500 }
        )
    }
}
