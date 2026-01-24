import { useState, useEffect } from 'react'
import { supabase } from '../shared/services/supabase'
import type { Order } from '@dinein/db'

const ORDERS_STORAGE_KEY = 'dinein-order-ids'

/**
 * Hook to fetch order history for the current user/session.
 * Since customers can order without authentication, we track order IDs in localStorage.
 */
export function useOrderHistory() {
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)

    useEffect(() => {
        const fetchOrders = async () => {
            setLoading(true)
            setError(null)

            try {
                // Get stored order IDs from localStorage
                const storedIds = localStorage.getItem(ORDERS_STORAGE_KEY)
                if (!storedIds) {
                    setOrders([])
                    return
                }

                const orderIds: string[] = JSON.parse(storedIds)
                if (orderIds.length === 0) {
                    setOrders([])
                    return
                }

                // Fetch orders by IDs (limit to last 20)
                const idsToFetch = orderIds.slice(-20)
                const { data, error: fetchError } = await supabase
                    .from('orders')
                    .select('*')
                    .in('id', idsToFetch)
                    .order('created_at', { ascending: false })

                if (fetchError) throw fetchError
                setOrders(data || [])
            } catch (err) {
                console.error('Error fetching order history:', err)
                setError(err instanceof Error ? err : new Error('Failed to fetch orders'))
                setOrders([])
            } finally {
                setLoading(false)
            }
        }

        fetchOrders()
    }, [])

    return { orders, loading, error }
}

/**
 * Utility to save an order ID to local history after placing an order.
 */
export function saveOrderToHistory(orderId: string) {
    try {
        const storedIds = localStorage.getItem(ORDERS_STORAGE_KEY)
        const orderIds: string[] = storedIds ? JSON.parse(storedIds) : []

        // Avoid duplicates
        if (!orderIds.includes(orderId)) {
            orderIds.push(orderId)
        }

        // Keep only last 50 orders
        const trimmedIds = orderIds.slice(-50)
        localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(trimmedIds))
    } catch (err) {
        console.error('Error saving order to history:', err)
    }
}
