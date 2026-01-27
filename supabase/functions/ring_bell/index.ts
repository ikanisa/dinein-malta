
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

        const { venue_id, table_number, session_id } = await req.json();

        if (!venue_id || !table_number) {
            throw new Error("Missing venue_id or table_number");
        }

        const clientIp = req.headers.get('x-forwarded-for') || 'unknown';

        // 1. Rate Limit: 2 per minute
        const now = new Date();
        const { count } = await supabaseClient
            .from('security_audit_log')
            .select('id', { count: 'exact', head: true })
            .eq('event_type', 'ring_bell')
            .eq('session_hash', session_id)
            .gte('created_at', new Date(now.getTime() - 60000).toISOString());

        if (count && count >= 2) {
            await supabaseClient.from('security_audit_log').insert({
                event_type: 'ring_bell', session_hash: session_id, venue_id, status: 'BLOCKED', reason: 'Rate Limit', ip_address: clientIp
            });
            return new Response(JSON.stringify({ error: 'Waiter notified. Please wait.' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 429
            });
        }

        // 2. Insert Request
        const { error: insertError } = await supabaseClient
            .from('bell_requests')
            .insert({
                venue_id,
                table_number,
                status: 'pending',
                metadata: { session_id }
            });

        if (insertError) throw insertError;

        // 3. Log Success
        await supabaseClient.from('security_audit_log').insert({
            event_type: 'ring_bell', session_hash: session_id, venue_id, status: 'SUCCESS', ip_address: clientIp
        });

        return new Response(JSON.stringify({ success: true }), {
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
