import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

declare const Deno: any;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { action, payload } = await req.json();
    
    // 1. Initialize Client Context (User who called)
    const authHeader = req.headers.get('Authorization')!;
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    // 2. Initialize Admin Context (Service Role for privileged ops)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    let result;

    switch (action) {
      case 'create-order':
        {
          // Generate unique secure code
          const code = 'DIN-' + Math.random().toString(36).substr(2, 4).toUpperCase();
          const timestamp = Date.now();
          
          const { data, error } = await supabaseClient // RLS allows insert for auth users (anon or signed in)
            .from('orders')
            .insert({ 
              ...payload, 
              order_code: code, 
              status: 'RECEIVED', 
              payment_status: 'UNPAID', 
              timestamp: timestamp 
            })
            .select()
            .single();
            
          if (error) throw error;
          result = data;
        }
        break;

      // NOTE: Vendor creation is now admin-only via /vendor_claim edge function
      // This action has been removed - vendors must be created through admin panel

      case 'admin-update-status':
        {
          // 1. Verify Caller is Admin
          const { data: { user } } = await supabaseClient.auth.getUser();
          if (!user) throw new Error('Unauthorized');

          const { data: adminRecord } = await supabaseAdmin
            .from('admin_users')
            .select('*')
            .eq('auth_user_id', user.id)
            .eq('is_active', true)
            .single();

          // Production: Only DB-based admin access (no demo fallback)
          if (!adminRecord) {
            throw new Error('Forbidden: Not an admin');
          }

          // 2. Perform Update
          const { error: updateError } = await supabaseAdmin
            .from('venues')
            .update({ status: payload.status })
            .eq('id', payload.venueId);

          if (updateError) throw updateError;

          // 3. Audit Log
          await supabaseAdmin.from('audit_logs').insert({
            actor_auth_user_id: user.id,
            action: `VENUE_${payload.status.toUpperCase()}`,
            entity_type: 'venue',
            entity_id: payload.venueId
          });

          result = { success: true };
        }
        break;

      default:
        throw new Error(`Unknown business-logic action: ${action}`);
    }

    return new Response(JSON.stringify(result), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error("Business Logic Error:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});