export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient()
        const searchParams = request.nextUrl.searchParams

        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '20')
        const city = searchParams.get('city')
        const cuisine = searchParams.get('cuisine')
        const priceRange = searchParams.get('price_range')

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let query: any = supabase
            .from('vendors')
            .select('*, latitude:lat, longitude:lng, image_url:ai_image_url, price_range:price_level', { count: 'exact' })
            .eq('is_active', true) // is_active instead of is_published

        // Apply filters
        if (city) {
            query = query.ilike('city', `%${city}%`)
        }

        if (cuisine) {
            query = query.contains('cuisine_types', [cuisine])
        }

        if (priceRange) {
            query = query.eq('price_level', priceRange)
        }

        // Pagination
        const from = (page - 1) * limit
        const to = from + limit - 1

        const { data: venues, error, count } = await query
            .range(from, to)
            .order('created_at', { ascending: false })

        if (error) throw error

        return NextResponse.json({
            venues,
            pagination: {
                page,
                limit,
                total: count || 0,
                totalPages: Math.ceil((count || 0) / limit),
            },
        })
    } catch (error) {
        console.error('Venues fetch error:', error)
        return NextResponse.json(
            { error: 'Failed to fetch venues' },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()
        const {
            data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()

        // Create slug from name
        const slug = body.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '')
        // Append random string to ensure uniqueness if needed, but for now simple slug
        // In production we would check for uniqueness collision

        const { data: venue, error } = await (supabase
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .from('vendors') as any)
            .insert({
                name: body.name,
                address: body.address,
                city: body.city,
                slug,
                // owner_id: user.id, // Legacy vendors might not use owner_id same way, checking schema... Use vendor_users?
                // For now, insert purely what we know fits
                lat: body.latitude,
                lng: body.longitude,
                price_level: body.price_range,
                ai_image_url: body.image_url,
                hours_json: body.opening_hours
            })
            .select()
            .single()

        if (error) throw error

        return NextResponse.json({ venue }, { status: 201 })
    } catch (error) {
        console.error('Venue creation error:', error)
        return NextResponse.json(
            { error: 'Failed to create venue' },
            { status: 500 }
        )
    }
}
