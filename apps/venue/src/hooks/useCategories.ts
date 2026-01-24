import { useState, useCallback, useEffect } from 'react'
import { supabase } from '../shared/services/supabase'
import { MenuCategory } from '@dinein/db'
import { useOwner } from '../context/OwnerContext'
import { toast } from 'sonner'

export function useCategories() {
    const { venue } = useOwner()
    const [categories, setCategories] = useState<MenuCategory[]>([])
    const [loading, setLoading] = useState(true)

    const fetchCategories = useCallback(async () => {
        if (!venue) return
        setLoading(true)
        try {
            const { data, error } = await supabase
                .from('menu_categories')
                .select('*')
                .eq('venue_id', venue.id)
                .order('sort_order', { ascending: true })

            if (error) throw error
            setCategories(data || [])
        } catch (error) {
            console.error('Error fetching categories:', error)
            toast.error('Failed to load categories')
        } finally {
            setLoading(false)
        }
    }, [venue])

    const addCategory = async (name: string) => {
        if (!venue) return
        try {
            // Get max sort order
            const maxOrder = categories.reduce((max, c) => Math.max(max, c.sort_order), 0)

            const { error } = await supabase.from('menu_categories').insert({
                venue_id: venue.id,
                name,
                sort_order: maxOrder + 1
            })

            if (error) throw error
            toast.success('Category added')
            await fetchCategories()
        } catch (error) {
            console.error('Error adding category:', error)
            toast.error('Failed to add category')
            throw error
        }
    }

    const deleteCategory = async (id: string) => {
        try {
            const { error } = await supabase
                .from('menu_categories')
                .delete()
                .eq('id', id)

            if (error) throw error
            toast.success('Category deleted')
            await fetchCategories()
        } catch (error) {
            console.error('Error deleting category:', error)
            toast.error('Failed to delete category')
            throw error
        }
    }

    useEffect(() => {
        fetchCategories()
    }, [fetchCategories])

    return {
        categories,
        loading,
        addCategory,
        deleteCategory,
        refresh: fetchCategories
    }
}
