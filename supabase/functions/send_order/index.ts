import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { logStructuredEvent } from '../_shared/observability.ts'

const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

serve(async (req) => {
    try {
        const { userId, items, total, metadata } = await req.json()

        await logStructuredEvent('SEND_ORDER_REQUEST', {
            userId,
            itemCount: items.length,
            total,
            metadata
        })

        // Validate items
        if (!items || items.length === 0) {
            throw new Error('No items in order')
        }

        // Create order
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .insert({
                user_id: userId,
                restaurant_id: metadata?.venue,
                table_number: metadata?.table,
                status: 'pending',
                total_amount: total,
                currency: 'USD',
                metadata
            })
            .select()
            .single()

        if (orderError) throw orderError

        // Create order items
        const orderItems = items.map(item => ({
            order_id: order.id,
            menu_item_id: item.menuItemId,
            quantity: item.quantity,
            price: item.price,
            name: item.name,
            options: item.options || {}
        }))

        const { error: itemsError } = await supabase
            .from('order_items')
            .insert(orderItems)

        if (itemsError) {
            // Rollback order if items fail
            await supabase.from('orders').delete().eq('id', order.id)
            throw itemsError
        }

        // Clear draft order
        await supabase
            .from('draft_orders')
            .delete()
            .eq('user_id', userId)

        await logStructuredEvent('ORDER_CREATED', {
            orderId: order.id,
            userId,
            total,
            itemCount: items.length
        })

        return new Response(JSON.stringify({
            success: true,
            orderId: order.id,
            orderNumber: order.id.slice(-6).toUpperCase()
        }), {
            headers: { 'Content-Type': 'application/json' }
        })

    } catch (error) {
        await logStructuredEvent('SEND_ORDER_ERROR', { error: error.message })

        return new Response(JSON.stringify({
            success: false,
            error: error.message
        }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        })
    }
})
