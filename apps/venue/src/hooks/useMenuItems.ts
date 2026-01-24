import { useState, useCallback, useEffect } from 'react'
import { supabase } from '../shared/services/supabase'
import { MenuItem } from '@dinein/db'
import { useOwner } from '../context/OwnerContext'
import { toast } from 'sonner'

export function useMenuItems(activeCategoryId?: string) {
    const { venue } = useOwner()
    const [items, setItems] = useState<MenuItem[]>([])
    const [loading, setLoading] = useState(true)

    const fetchItems = useCallback(async () => {
        if (!venue) return
        setLoading(true)
        try {
            let query = supabase
                .from('menu_items')
                .select('*')
                .eq('venue_id', venue.id)
                .order('sort_order', { ascending: true })

            if (activeCategoryId) {
                query = query.eq('category_id', activeCategoryId)
            }

            const { data, error } = await query

            if (error) throw error
            setItems(data || [])
        } catch (error) {
            console.error('Error fetching items:', error)
            toast.error('Failed to load items')
        } finally {
            setLoading(false)
        }
    }, [venue, activeCategoryId])

    const addItem = async (item: Omit<MenuItem, 'id' | 'created_at' | 'venue_id' | 'sort_order'>) => {
        if (!venue) return
        try {
            // Get max sort order for this category
            const categoryItems = items.filter(i => i.category_id === item.category_id)
            const maxOrder = categoryItems.reduce((max, i) => Math.max(max, i.sort_order), 0)

            const { error } = await supabase.from('menu_items').insert({
                ...item,
                venue_id: venue.id,
                sort_order: maxOrder + 1
            })

            if (error) throw error
            toast.success('Item added')
            await fetchItems()
        } catch (error) {
            console.error('Error adding item:', error)
            toast.error('Failed to add item')
            throw error
        }
    }

    const updateItem = async (id: string, updates: Partial<MenuItem>) => {
        try {
            const { error } = await supabase
                .from('menu_items')
                .update(updates)
                .eq('id', id)

            if (error) throw error
            toast.success('Item updated')
            await fetchItems()
        } catch (error) {
            console.error('Error updating item:', error)
            toast.error('Failed to update item')
            throw error
        }
    }

    const deleteItem = async (id: string) => {
        try {
            const { error } = await supabase
                .from('menu_items')
                .delete()
                .eq('id', id)

            if (error) throw error
            toast.success('Item deleted')
            await fetchItems()
        } catch (error) {
            console.error('Error deleting item:', error)
            toast.error('Failed to delete item')
            throw error
        }
    }

    useEffect(() => {
        fetchItems()
    }, [fetchItems])

    return {
        items,
        loading,
        addItem,
        updateItem,
        deleteItem,
        refresh: fetchItems
    }
}
