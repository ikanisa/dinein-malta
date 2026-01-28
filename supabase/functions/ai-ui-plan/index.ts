/**
 * AI UI Plan Edge Function
 *
 * Generates UIPlan for client apps based on screen context.
 * This is a simplified implementation that returns static plans.
 * In production, this would call the Moltbot UI Orchestrator.
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { validateUIPlan, generatePlanId } from '../_lib/ui_plan.ts';
import {
    checkBlockingKillSwitches,
} from '../_lib/kill_switches.ts';
import {
    getVenueBehavior,
} from '../_lib/rollout_mode.ts';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};


interface UIPlanRequest {
    actor: {
        actorType: 'guest' | 'staff' | 'admin';
        actorId: string;
        locale?: string;
    };
    screen: {
        name: string;
        venueId?: string;
        categoryId?: string;
        query?: string;
    };
    device?: {
        type?: string;
        viewport?: { width: number; height: number };
    };
}

serve(async (req) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;

        // Get auth token
        const authHeader = req.headers.get('Authorization');
        const supabase = createClient(supabaseUrl, supabaseKey, {
            global: { headers: { Authorization: authHeader || '' } },
        });

        // Parse request
        const body: UIPlanRequest = await req.json();
        const { actor, screen, device } = body;

        // Get session for tenant context
        const { data: { session } } = await supabase.auth.getSession();
        const userId = session?.user?.id || actor.actorId || 'anonymous';
        const venueId = screen.venueId;

        // ====================================================================
        // ROLLOUT INFRASTRUCTURE: Kill switches and mode checks
        // ====================================================================

        // Check kill switches first
        const killSwitchResult = await checkBlockingKillSwitches(supabase, venueId);
        if (killSwitchResult.blocked) {
            console.log('UIPlan blocked by kill switch:', killSwitchResult.reason);
            // Return static fallback UI
            return new Response(
                JSON.stringify({
                    plan: generateStaticFallbackPlan(venueId, screen.name),
                    fallback: true,
                    reason: killSwitchResult.reason,
                }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // Check if UIPlan is enabled for this venue's rollout mode
        if (venueId) {
            const venueBehavior = await getVenueBehavior(supabase, venueId);
            if (!venueBehavior.uiPlanEnabled) {
                console.log('UIPlan not enabled for venue rollout mode:', venueId);
                return new Response(
                    JSON.stringify({
                        plan: generateStaticFallbackPlan(venueId, screen.name),
                        fallback: true,
                        reason: 'rollout_mode',
                    }),
                    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                );
            }
        }

        // Generate plan based on screen
        const plan = await generatePlanForScreen(supabase, {
            userId,
            screenName: screen.name,
            venueId: screen.venueId,
            categoryId: screen.categoryId,
            query: screen.query,
            locale: actor.locale || 'en',
        });

        // Validate the plan before returning
        const validation = validateUIPlan(plan);
        if (!validation.valid) {
            console.error('Generated invalid UIPlan:', validation.errors);
            // Return plan anyway with warnings in debug
            plan.debug = {
                ...plan.debug,
                warnings: validation.errors,
            };
        }

        return new Response(JSON.stringify({ plan }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('AI UI Plan error:', error);
        return new Response(
            JSON.stringify({ error: error.message || 'Internal error' }),
            {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
        );
    }
});

interface PlanContext {
    userId: string;
    screenName: string;
    venueId?: string;
    categoryId?: string;
    query?: string;
    locale: string;
}

async function generatePlanForScreen(
    supabase: ReturnType<typeof createClient>,
    ctx: PlanContext
) {
    const now = new Date().toISOString();
    const planId = generatePlanId();

    // Base plan structure
    const basePlan = {
        version: 'ui_plan.v1',
        planId,
        generatedAt: now,
        tenant: {
            tenantId: 'dinein',
            venueId: ctx.venueId || null,
        },
        session: {
            sessionKey: `sess_${ctx.userId}`,
            actor: {
                actorType: 'guest',
                actorId: ctx.userId,
                locale: ctx.locale,
                currency: ctx.locale.includes('RW') ? 'RWF' : 'EUR',
            },
        },
        actions: { byId: {} },
        cache: { ttlSeconds: 300 },
    };

    switch (ctx.screenName) {
        case 'home':
            return generateHomePlan(supabase, basePlan, ctx);
        case 'venue':
            return generateVenuePlan(supabase, basePlan, ctx);
        case 'menu':
            return generateMenuPlan(supabase, basePlan, ctx);
        default:
            return {
                ...basePlan,
                screen: { name: ctx.screenName, title: 'DineIn', layout: 'scroll' },
                sections: [],
            };
    }
}

async function generateHomePlan(supabase: any, basePlan: any, ctx: PlanContext) {
    // Fetch venues
    const { data: venues } = await supabase
        .from('venues')
        .select('id, name, slug, description, country')
        .eq('is_active', true)
        .limit(10);

    // Build sections
    const sections = [];
    const actions: Record<string, any> = {};

    // Hero greeting
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning!' : hour < 18 ? 'Good afternoon!' : 'Good evening!';

    sections.push({
        id: 'sec_hero',
        type: 'hero',
        title: greeting,
        subtitle: 'What are you in the mood for?',
        items: [],
    });

    // Venues carousel
    if (venues && venues.length > 0) {
        const venueItems = venues.map((v: any) => {
            const actionRef = `act_venue_${v.id}`;
            actions[actionRef] = {
                intent: 'openVenue',
                params: { venueId: v.slug || v.id },
            };
            return {
                kind: 'venue',
                id: v.id,
                primaryText: v.name,
                secondaryText: v.description || '',
                actionRef,
            };
        });

        sections.push({
            id: 'sec_venues',
            type: 'carousel',
            title: 'Popular venues',
            items: venueItems,
        });
    }

    return {
        ...basePlan,
        screen: { name: 'home', title: greeting, layout: 'scroll' },
        sections,
        actions: { byId: actions },
    };
}

async function generateVenuePlan(supabase: any, basePlan: any, ctx: PlanContext) {
    if (!ctx.venueId) {
        return { ...basePlan, screen: { name: 'venue', title: 'Venue', layout: 'scroll' }, sections: [] };
    }

    // Fetch venue
    const { data: venue } = await supabase
        .from('venues')
        .select('*')
        .or(`id.eq.${ctx.venueId},slug.eq.${ctx.venueId}`)
        .single();

    if (!venue) {
        return { ...basePlan, screen: { name: 'venue', title: 'Venue not found', layout: 'scroll' }, sections: [] };
    }

    // Fetch categories
    const { data: categories } = await supabase
        .from('menu_categories')
        .select('id, name')
        .eq('venue_id', venue.id)
        .order('position');

    const sections = [];
    const actions: Record<string, any> = {};

    // Hero
    sections.push({
        id: 'sec_hero',
        type: 'hero',
        title: venue.name,
        subtitle: venue.description || '',
        items: [],
        style: { emphasis: 'high' },
    });

    // Categories chips
    if (categories && categories.length > 0) {
        const catItems = categories.map((c: any) => {
            const actionRef = `act_cat_${c.id}`;
            actions[actionRef] = {
                intent: 'openMenu',
                params: { venueId: ctx.venueId, categoryId: c.id },
            };
            return {
                kind: 'category',
                id: c.id,
                primaryText: c.name,
                actionRef,
            };
        });

        sections.push({
            id: 'sec_categories',
            type: 'chips',
            title: 'Menu',
            items: catItems,
        });
    }

    // CTA
    const ctaRef = 'act_start_visit';
    actions[ctaRef] = {
        intent: 'startVisit',
        params: { venueId: ctx.venueId },
        requiresConfirmation: true,
        confirmationText: `Start your order at ${venue.name}?`,
    };
    sections.push({
        id: 'sec_cta',
        type: 'cta',
        items: [{ kind: 'action', id: 'start', primaryText: 'Start Ordering', actionRef: ctaRef }],
    });

    return {
        ...basePlan,
        tenant: { ...basePlan.tenant, venueId: venue.id },
        screen: {
            name: 'venue',
            title: venue.name,
            layout: 'scroll',
            breadcrumbs: [
                { label: 'Home', actionRef: 'act_home' },
                { label: venue.name },
            ],
        },
        sections,
        actions: { byId: { ...actions, act_home: { intent: 'openHome', params: {} } } },
    };
}

async function generateMenuPlan(supabase: any, basePlan: any, ctx: PlanContext) {
    if (!ctx.venueId) {
        return { ...basePlan, screen: { name: 'menu', title: 'Menu', layout: 'scroll' }, sections: [] };
    }

    // Fetch venue
    const { data: venue } = await supabase
        .from('venues')
        .select('id, name, slug')
        .or(`id.eq.${ctx.venueId},slug.eq.${ctx.venueId}`)
        .single();

    if (!venue) {
        return { ...basePlan, screen: { name: 'menu', title: 'Menu', layout: 'scroll' }, sections: [] };
    }

    // Fetch items (optionally filtered by category)
    let itemsQuery = supabase
        .from('menu_items')
        .select('id, name, description, price, category_id')
        .eq('venue_id', venue.id)
        .eq('is_available', true)
        .limit(50);

    if (ctx.categoryId) {
        itemsQuery = itemsQuery.eq('category_id', ctx.categoryId);
    }

    const { data: items } = await itemsQuery;

    const sections = [];
    const actions: Record<string, any> = {};

    // Items list
    if (items && items.length > 0) {
        const menuItems = items.map((item: any) => {
            const actionRef = `act_add_${item.id}`;
            actions[actionRef] = {
                intent: 'addToCart',
                params: { visitId: 'current', itemId: item.id, qty: 1 },
            };
            return {
                kind: 'menu_item',
                id: item.id,
                primaryText: item.name,
                secondaryText: item.description || '',
                meta: { priceText: `${item.price} RWF` },
                actionRef,
            };
        });

        sections.push({
            id: 'sec_items',
            type: 'list',
            title: 'Menu',
            items: menuItems,
        });
    }

    return {
        ...basePlan,
        tenant: { ...basePlan.tenant, venueId: venue.id },
        screen: {
            name: 'menu',
            title: venue.name,
            layout: 'scroll',
            breadcrumbs: [
                { label: 'Home', actionRef: 'act_home' },
                { label: venue.name },
            ],
        },
        sections,
        actions: { byId: { ...actions, act_home: { intent: 'openHome', params: {} } } },
    };
}

/**
 * Generate a static fallback UI plan when AI is disabled.
 * This provides basic navigation without AI enhancement.
 */
function generateStaticFallbackPlan(venueId: string | undefined, screenName: string) {
    const planId = generatePlanId();
    const now = new Date().toISOString();

    return {
        version: 'ui_plan.v1',
        planId,
        generatedAt: now,
        fallback: true,
        tenant: {
            tenantId: 'dinein',
            venueId: venueId || null,
        },
        session: {
            sessionKey: 'fallback',
            actor: {
                actorType: 'guest',
                actorId: 'anonymous',
                locale: 'en',
                currency: 'RWF',
            },
        },
        screen: {
            name: screenName,
            title: screenName === 'home' ? 'DineIn' : 'Menu',
            layout: 'scroll',
        },
        sections: [
            {
                id: 'sec_info',
                type: 'info',
                title: 'AI Unavailable',
                subtitle: 'Browse the menu manually or ask staff for assistance.',
                items: [],
                style: { emphasis: 'medium' },
            },
        ],
        actions: { byId: {} },
        cache: { ttlSeconds: 60 },
        debug: {
            warnings: ['AI unavailable - static fallback served'],
        },
    };
}

