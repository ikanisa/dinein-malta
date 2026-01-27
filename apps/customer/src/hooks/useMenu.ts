import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../shared/services/supabase'
import { MenuItem } from '@dinein/db'

interface MenuCategory {
    id: string
    name: string
    sort_order: number
}

/**
 * Hook to fetch menu items and categories for a venue
 */
export function useMenu(venueId: string | undefined) {
    const [items, setItems] = useState<MenuItem[]>([])
    const [categories, setCategories] = useState<MenuCategory[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)

    const fetchMenu = useCallback(async () => {
        if (!venueId) {
            setLoading(false)
            return
        }

        setLoading(true)
        setError(null)

        try {
            // Fetch categories
            const { data: catData, error: catError } = await supabase
                .from('menu_categories')
                .select('id, name, sort_order')
                .eq('venue_id', venueId)
                .order('sort_order', { ascending: true })

            if (catError) throw catError

            // Fetch menu items
            const { data: itemData, error: itemError } = await supabase
                .from('menu_items')
                .select('*')
                .eq('vendor_id', venueId)
                .eq('is_available', true)
                .order('name')

            if (itemError) throw itemError

            setCategories(catData || [])
            setItems(itemData || [])
        } catch (err) {
            console.error('Error fetching menu:', err)
            setError(err instanceof Error ? err : new Error('Failed to fetch menu'))
        } finally {
            setLoading(false)
        }
    }, [venueId])

    useEffect(() => {
        fetchMenu()
    }, [fetchMenu])

    return {
        items,
        categories,
        loading,
        error,
        refresh: fetchMenu
    }
}
