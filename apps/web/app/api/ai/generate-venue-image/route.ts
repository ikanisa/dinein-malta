export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server'
import { geminiService } from '@/lib/ai/gemini'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()
        const {
            data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { venueId } = await request.json()
        if (!venueId) {
            return NextResponse.json({ error: 'Venue ID is required' }, { status: 400 })
        }

        // Fetch venue
        const { data: venue, error: venueError } = await supabase
            .from('vendors')
            .select('*, latitude:lat, longitude:lng')
            .eq('id', venueId)
            .single()

        if (venueError || !venue) {
            return NextResponse.json({ error: 'Venue not found' }, { status: 404 })
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const venueData = venue as any;

        // Ensure we have categories for better prompting
        let categories;
        try {
            categories = await geminiService.categorizeVenue({
                id: venueData.id,
                name: venueData.name,
                address: venueData.address || '',
                description: venueData.description || venueData.ai_description,
                latitude: venueData.lat,
                longitude: venueData.lng
            })
        } catch {
            // Fallback
            categories = {
                primary_category: venueData.primary_category || 'Restaurant',
                ambiance_tags: venueData.ambiance_tags || [],
                special_features: venueData.special_features || []
            }
        }

        // Generate image
        const imageBase64 = await geminiService.generateVenueImage({
            name: venueData.name,
            primary_category: categories.primary_category,
            ambiance_tags: categories.ambiance_tags,
            special_features: categories.special_features,
        })

        // Decode base64 and upload to Supabase Storage
        const imageBuffer = Buffer.from(imageBase64, 'base64')
        const fileName = `${venueData.id}-${Date.now()}.jpg`

        const { error: uploadError } = await supabase.storage
            .from('venue-images')
            .upload(fileName, imageBuffer, {
                contentType: 'image/jpeg',
                upsert: true,
            })

        if (uploadError) {
            console.error('Storage upload error:', uploadError)
            throw new Error('Failed to upload generated image')
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from('venue-images')
            .getPublicUrl(fileName)

        // Update venue with new image URL
        await (supabase
            .from('vendors') as any) // eslint-disable-line @typescript-eslint/no-explicit-any
            .update({
                ai_image_url: publicUrl, // Update ai_image_url
                last_ai_update: new Date().toISOString()
            })
            .eq('id', venueData.id)

        return NextResponse.json({ success: true, imageUrl: publicUrl })
    } catch (error) {
        console.error('Venue image generation error:', error)
        return NextResponse.json(
            { error: 'Failed to generate venue image' },
            { status: 500 }
        )
    }
}
