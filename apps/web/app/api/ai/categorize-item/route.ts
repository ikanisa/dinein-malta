export const runtime = 'edge';
export const dynamic = 'force-dynamic';

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

        const body = await request.json()
        const { itemId } = body

        if (!itemId) {
            return NextResponse.json({ error: 'Item ID is required' }, { status: 400 })
        }

        // Fetch menu item and venue
        const { data: item, error: itemError } = await supabase
            .from('menu_items')
            .select(`
        *,
        venues (
          id,
          name,
          owner_id,
          cuisine_types
        )
      `)
            .eq('id', itemId)
            .single()

        if (itemError || !item) {
            return NextResponse.json({ error: 'Item not found' }, { status: 404 })
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const typedItem = item as any


        const venue = typedItem.venues
        if (venue.owner_id !== user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        // Categorize menu item
        const categories = await geminiService.categorizeMenuItem({
            id: typedItem.id,
            name: typedItem.name,
            description: typedItem.description,
            ingredients: typedItem.ingredients,
            venue_context: {
                name: venue.name,
                cuisine_types: venue.cuisine_types,
            },
        })

        // Update item with AI metadata
        await (supabase
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .from('menu_items') as any)
            .update({
                last_ai_update: new Date().toISOString(),
            })
            .eq('id', typedItem.id)

        return NextResponse.json({ categories })
    } catch (error) {
        console.error('Item categorization error:', error)
        return NextResponse.json(
            { error: 'Failed to categorize item' },
            { status: 500 }
        )
    }
}
