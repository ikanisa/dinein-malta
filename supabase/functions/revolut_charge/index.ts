import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { logStructuredEvent } from '../_shared/observability.ts'

const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

const REVOLUT_API_URL = Deno.env.get('REVOLUT_API_URL') || 'https://sandbox-merchant.revolut.com/api/1.0'
const REVOLUT_API_KEY = Deno.env.get('REVOLUT_API_KEY')!

serve(async (req) => {
    try {
        const { orderId, userId, amount, currency } = await req.json()

        await logStructuredEvent('REVOLUT_CHARGE_REQUEST', {
            orderId,
            userId,
            amount,
            currency
        })

        // Create payment record
        const { data: payment, error: paymentError } = await supabase
            .from('payments')
            .insert({
                order_id: orderId,
                user_id: userId,
                provider: 'REVOLUT',
                status: 'pending',
                amount,
                currency
            })
            .select()
            .single()

        if (paymentError) throw paymentError

        // Create Revolut order
        const revolutOrder = {
            amount: Math.round(amount * 100), // Convert to cents
            currency,
            capture_mode: 'AUTOMATIC',
            merchant_order_ext_ref: orderId,
            description: `Order ${orderId.slice(-6)}`,
            metadata: {
                payment_id: payment.id,
                user_id: userId
            },
            webhook_urls: {
                success: `${Deno.env.get('SUPABASE_URL')}/functions/v1/revolut_webhook`,
                failure: `${Deno.env.get('SUPABASE_URL')}/functions/v1/revolut_webhook`
            }
        }

        const response = await fetch(`${REVOLUT_API_URL}/orders`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${REVOLUT_API_KEY}`,
                'Content-Type': 'application/json',
                'Revolut-Api-Version': '1.0'
            },
            body: JSON.stringify(revolutOrder)
        })

        if (!response.ok) {
            const error = await response.text()
            throw new Error(`Revolut API error: ${error}`)
        }

        const order = await response.json()

        // Update payment with Revolut reference
        await supabase
            .from('payments')
            .update({
                provider_ref: order.id,
                metadata: { revolut_order: order }
            })
            .eq('id', payment.id)

        await logStructuredEvent('REVOLUT_ORDER_CREATED', {
            orderId,
            paymentId: payment.id,
            revolutOrderId: order.id
        })

        return new Response(JSON.stringify({
            success: true,
            paymentId: payment.id,
            checkoutUrl: order.checkout_url,
            widgetId: order.public_id
        }), {
            headers: { 'Content-Type': 'application/json' }
        })

    } catch (error) {
        await logStructuredEvent('REVOLUT_CHARGE_ERROR', { error: error.message })

        return new Response(JSON.stringify({
            success: false,
            error: error.message
        }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        })
    }
})
