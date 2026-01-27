
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";

declare const Deno: any;

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );

        const { venue_id, items, payment_method, table_number, idempotency_key, session_id } = await req.json();

        // 1. Basic Validation
        if (!venue_id || !items || items.length === 0 || !payment_method) {
            throw new Error("Invalid payload: Missing required fields");
        }
        if (items.length > 20) {
            throw new Error("Too many items in order");
        }

        // 2. Rate Limiting (Session/IP)
        const clientIp = req.headers.get('x-forwarded-for') || 'unknown';
        const rateKey = `rate:order:${session_id || clientIp}:${venue_id}`;

        // Check limits (using DB text approach for simplicity if Redis not available)
        const now = new Date();
        const expireTime = new Date(now.getTime() + 5 * 60000); // 5 mins

        // Optimistic DB Upsert for Rate Limit (Points check)
        // For simplicity in this demo, we assume a helper or direct DB. 
        // Secure implementations would use atomic increment or Redis.
        // Here we query audit logs to count recent orders.
        const { count, error: limitErr } = await supabaseClient
            .from('security_audit_log')
            .select('id', { count: 'exact', head: true })
            .eq('event_type', 'create_order')
            .eq('session_hash', session_id) // Ideally hash this
            .eq('status', 'SUCCESS')
            .gte('created_at', new Date(now.getTime() - 5 * 60000).toISOString()); // Last 5 mins

        if (count && count >= 3) {
            // Log block
            await supabaseClient.from('security_audit_log').insert({
                event_type: 'create_order', session_hash: session_id, venue_id, status: 'BLOCKED', reason: 'Rate Limit', ip_address: clientIp
            });
            return new Response(JSON.stringify({ error: 'Too many requests. Please wait.' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 429
            });
        }

        // 3. Idempotency Check
        if (idempotency_key) {
            // Check if order exists with this key in metadata or separate table
            // Skipping for brevity, assuming client retries gracefully
        }

        // 4. Calculate Total (Server Authority)
        // Fetch prices for items
        const itemIds = items.map((i: any) => i.id);
        const { data: menuItems } = await supabaseClient
            .from('menu_items')
            .select('id, price, venue_id')
            .in('id', itemIds);

        let totalAmount = 0;
        const finalItems = [];

        for (const reqItem of items) {
            const dbItem = menuItems?.find((mi: any) => mi.id === reqItem.id);
            if (!dbItem) throw new Error(`Item ${reqItem.id} not found`);
            if (dbItem.venue_id !== venue_id) throw new Error("Item validation failed");

            // Qty bound
            const qty = Math.min(Math.max(reqItem.quantity || 1, 1), 10);

            totalAmount += (dbItem.price * qty);
            finalItems.push({ ...reqItem, price: dbItem.price, quantity: qty });
        }

        // 5. Create Order
        const { data: order, error: orderError } = await supabaseClient
            .from('orders')
            .insert({
                venue_id,
                table_number,
                status: 'received', // Initial status
                payment_method,
                payment_status: 'pending',
                total_amount: totalAmount,
                items: finalItems,
                metadata: { session_id, idempotency_key } // Store for tracking
            })
            .select()
            .single();

        if (orderError) throw orderError;

        // 6. Log Success
        await supabaseClient.from('security_audit_log').insert({
            event_type: 'create_order', session_hash: session_id, venue_id, status: 'SUCCESS', ip_address: clientIp
        });

        return new Response(JSON.stringify(order), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        });

    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        });
    }
});
