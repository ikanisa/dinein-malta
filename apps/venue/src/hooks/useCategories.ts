import { useState, useCallback, useEffect, useRef } from 'react'
import { supabase } from '../shared/services/supabase'
import { MenuCategory } from '@dinein/db'
import { useOwner } from '../context/OwnerContext'
import { toast } from 'sonner'

export function useCategories() {
    const { venue } = useOwner()
    const [categories, setCategories] = useState<MenuCategory[]>([])
    const [loading, setLoading] = useState(true)
    const menuIdRef = useRef<string | null>(null)

    // Get or create the venue's menu
    const getOrCreateMenu = useCallback(async (): Promise<string | null> => {
        if (!venue) return null

        // Check if we already have the menu cached
        if (menuIdRef.current) return menuIdRef.current

        try {
            // Try to get existing menu
            const { data: existingMenu, error: fetchError } = await supabase
                .from('menus')
                .select('id')
                .eq('venue_id', venue.id)
                .eq('is_active', true)
                .single()

            if (existingMenu) {
                menuIdRef.current = existingMenu.id
                return existingMenu.id
            }

            // No menu exists, create one
            if (fetchError && fetchError.code === 'PGRST116') {
                const { data: newMenu, error: createError } = await supabase
                    .from('menus')
                    .insert({ venue_id: venue.id, is_active: true })
                    .select('id')
                    .single()

                if (createError) throw createError
                menuIdRef.current = newMenu.id
                return newMenu.id
            }

            throw fetchError
        } catch (error) {
            console.error('Error getting/creating menu:', error)
            return null
        }
    }, [venue])

    const fetchCategories = useCallback(async () => {
        if (!venue) return
        setLoading(true)
        try {
            const menuId = await getOrCreateMenu()
            if (!menuId) throw new Error('Could not get menu')

            const { data, error } = await supabase
                .from('menu_categories')
                .select('*')
                .eq('menu_id', menuId)
                .order('sort_order', { ascending: true })

            if (error) throw error
            setCategories(data || [])
        } catch (error) {
            console.error('Error fetching categories:', error)
            toast.error('Failed to load categories')
        } finally {
            setLoading(false)
        }
    }, [venue, getOrCreateMenu])

    const addCategory = async (name: string) => {
        if (!venue) return
        try {
            const menuId = await getOrCreateMenu()
            if (!menuId) throw new Error('Could not get menu')

            // Get max sort order
            const maxOrder = categories.reduce((max, c) => Math.max(max, c.sort_order ?? 0), 0)

            const { error } = await supabase.from('menu_categories').insert({
                menu_id: menuId,
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

