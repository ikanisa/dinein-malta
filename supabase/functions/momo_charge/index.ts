import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { logStructuredEvent } from '../_shared/observability.ts'

const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

const MTN_API_URL = Deno.env.get('MTN_API_URL') || 'https://sandbox.momodeveloper.mtn.com'
const MTN_SUBSCRIPTION_KEY = Deno.env.get('MTN_SUBSCRIPTION_KEY')!
const MTN_API_USER = Deno.env.get('MTN_API_USER')!
const MTN_API_KEY = Deno.env.get('MTN_API_KEY')!

async function getAccessToken() {
    const auth = btoa(`${MTN_API_USER}:${MTN_API_KEY}`)

    const response = await fetch(`${MTN_API_URL}/collection/token/`, {
        method: 'POST',
        headers: {
            'Authorization': `Basic ${auth}`,
            'Ocp-Apim-Subscription-Key': MTN_SUBSCRIPTION_KEY,
        }
    })

    const data = await response.json()
    return data.access_token
}

serve(async (req) => {
    try {
        const { orderId, userId, phoneNumber, amount, currency } = await req.json()

        await logStructuredEvent('MOMO_CHARGE_REQUEST', {
            orderId,
            userId,
            amount,
            currency
        })

        // Validate phone number format
        const cleanPhone = phoneNumber.replace(/\D/g, '')
        if (!cleanPhone || cleanPhone.length < 10) {
            throw new Error('Invalid phone number')
        }

        // Create payment record
        const { data: payment, error: paymentError } = await supabase
            .from('payments')
            .insert({
                order_id: orderId,
                user_id: userId,
                provider: 'MTN_MOMO',
                status: 'pending',
                amount,
                currency,
                provider_ref: crypto.randomUUID(),
                metadata: { phoneNumber: cleanPhone }
            })
            .select()
            .single()

        if (paymentError) throw paymentError

        // Get MoMo access token
        const accessToken = await getAccessToken()

        // Create MoMo payment request
        const momoRequest = {
            amount: amount.toString(),
            currency,
            externalId: payment.id,
            payer: {
                partyIdType: 'MSISDN',
                partyId: cleanPhone
            },
            payerMessage: `Payment for order ${orderId.slice(-6)}`,
            payeeNote: `Order ${orderId}`
        }

        const requestId = crypto.randomUUID()
        const callbackUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/momo_webhook`

        const response = await fetch(`${MTN_API_URL}/collection/v1_0/requesttopay`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'X-Reference-Id': requestId,
                'X-Target-Environment': 'sandbox',
                'X-Callback-Url': callbackUrl,
                'Ocp-Apim-Subscription-Key': MTN_SUBSCRIPTION_KEY,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(momoRequest)
        })

        if (!response.ok) {
            throw new Error(`MoMo API error: ${response.status}`)
        }

        // Update payment with MoMo reference
        await supabase
            .from('payments')
            .update({
                provider_ref: requestId,
                status: 'processing'
            })
            .eq('id', payment.id)

        await logStructuredEvent('MOMO_CHARGE_INITIATED', {
            orderId,
            paymentId: payment.id,
            requestId
        })

        return new Response(JSON.stringify({
            success: true,
            paymentId: payment.id,
            message: 'Payment request sent to your phone'
        }), {
            headers: { 'Content-Type': 'application/json' }
        })

    } catch (error) {
        await logStructuredEvent('MOMO_CHARGE_ERROR', { error: error.message })

        return new Response(JSON.stringify({
            success: false,
            error: error.message
        }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        })
    }
})
