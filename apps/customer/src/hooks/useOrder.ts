import { useState, useEffect } from 'react'
import { Order } from '@dinein/db'

export function useOrder(orderId: string | undefined): { order: Order | null; loading: boolean; error: Error | null } {
    const [order, setOrder] = useState<Order | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)

    useEffect(() => {
        if (!orderId) {
            setLoading(false)
            return
        }

        const fetchOrder = async () => {
            setLoading(true)
            try {
                await new Promise(resolve => setTimeout(resolve, 800))
                // Mock data for MVP verification
                setOrder({
                    id: orderId,
                    venue_id: 'v1', // This should match current venue ideally, or logic to fetch venue
                    payment_method: 'cash',
                    currency: 'RWF',
                    total_amount: 5000,
                    status: 'placed',
                    created_at: new Date().toISOString()
                })
            } catch (err) {
                setError(err instanceof Error ? err : new Error('Failed to fetch order'))
            } finally {
                setLoading(false)
            }
        }

        fetchOrder()
    }, [orderId])

    return { order, loading, error }
}
