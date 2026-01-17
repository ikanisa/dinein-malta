export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient()
        const searchParams = request.nextUrl.searchParams

        const lat = parseFloat(searchParams.get('lat') || '0')
        const lng = parseFloat(searchParams.get('lng') || '0')
        const radius = parseFloat(searchParams.get('radius') || '10') // km
        const limit = parseInt(searchParams.get('limit') || '20')

        if (!lat || !lng) {
            return NextResponse.json(
                { error: 'Latitude and longitude required' },
                { status: 400 }
            )
        }

        // Use PostGIS function defined in schema
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: venues, error } = await (supabase.rpc as any)('get_nearby_venues', {
            user_lat: lat,
            user_lng: lng,
            radius_km: radius,
            limit_count: limit,
        })

        if (error) throw error

        return NextResponse.json({ venues })
    } catch (error) {
        console.error('Nearby venues error:', error)
        return NextResponse.json(
            { error: 'Failed to fetch nearby venues' },
            { status: 500 }
        )
    }
}
