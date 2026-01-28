/**
 * UIPlan Demo Page
 *
 * For testing the UIPlan renderer with example data.
 */

import { UIPlanRenderer } from '../components/ui-plan/UIPlanRenderer';
import type { UIPlan } from '@dinein/core';

// Example home plan for testing
const exampleHomePlan: UIPlan = {
    version: 'ui_plan.v1',
    planId: 'demo_plan_001',
    generatedAt: new Date().toISOString(),
    tenant: { tenantId: 'dinein', venueId: null },
    session: {
        sessionKey: 'sess_demo',
        actor: { actorType: 'guest', actorId: 'demo_user', locale: 'en-RW', currency: 'RWF' },
    },
    screen: { name: 'home', title: 'Good evening! 🌙', layout: 'scroll' },
    sections: [
        {
            id: 'sec_hero',
            type: 'hero',
            title: 'Welcome to DineIn',
            subtitle: 'Find your next great meal',
            items: [],
            style: { emphasis: 'high' },
        },
        {
            id: 'sec_filters',
            type: 'chips',
            title: null,
            items: [
                { kind: 'action', id: 'filter_1', primaryText: 'Open now', actionRef: 'act_filter_open' },
                { kind: 'action', id: 'filter_2', primaryText: 'Happy hour', actionRef: 'act_filter_happy' },
                { kind: 'action', id: 'filter_3', primaryText: 'Live music', actionRef: 'act_filter_live' },
            ],
        },
        {
            id: 'sec_venues',
            type: 'carousel',
            title: 'Top venues',
            items: [
                {
                    kind: 'venue',
                    id: 'venue_001',
                    primaryText: 'The Hut',
                    secondaryText: 'Burgers • Pizza',
                    meta: { ratingText: '4.8 ★', badge: 'Popular' },
                    actionRef: 'act_venue_1',
                },
                {
                    kind: 'venue',
                    id: 'venue_002',
                    primaryText: 'Republica',
                    secondaryText: 'Italian • Wine',
                    meta: { ratingText: '4.6 ★' },
                    actionRef: 'act_venue_2',
                },
                {
                    kind: 'venue',
                    id: 'venue_003',
                    primaryText: 'Fusion',
                    secondaryText: 'Asian Cuisine',
                    meta: { ratingText: '4.5 ★' },
                    actionRef: 'act_venue_3',
                },
            ],
        },
        {
            id: 'sec_offers',
            type: 'grid',
            title: "Today's offers",
            items: [
                {
                    kind: 'offer',
                    id: 'offer_001',
                    primaryText: '20% off first order',
                    secondaryText: 'Valid until 9 PM',
                    meta: { badge: 'NEW' },
                    actionRef: 'act_offer_1',
                },
                {
                    kind: 'offer',
                    id: 'offer_002',
                    primaryText: 'Free dessert',
                    secondaryText: 'Orders over 15,000 RWF',
                    actionRef: 'act_offer_2',
                },
            ],
        },
    ],
    actions: {
        byId: {
            act_filter_open: { intent: 'applyFilter', params: { filters: { isOpen: true } } },
            act_filter_happy: { intent: 'applyFilter', params: { filters: { hasHappyHour: true } } },
            act_filter_live: { intent: 'applyFilter', params: { filters: { hasLiveMusic: true } } },
            act_venue_1: { intent: 'openVenue', params: { venueId: 'the-hut' } },
            act_venue_2: { intent: 'openVenue', params: { venueId: 'republica' } },
            act_venue_3: { intent: 'openVenue', params: { venueId: 'fusion' } },
            act_offer_1: { intent: 'openVenue', params: { venueId: 'the-hut', referrer: 'offer' } },
            act_offer_2: { intent: 'openVenue', params: { venueId: 'republica', referrer: 'offer' } },
        },
    },
    cache: { ttlSeconds: 300 },
};

export default function UIPlanDemoPage() {
    return (
        <div style={{ maxWidth: 428, margin: '0 auto', background: '#fff', minHeight: '100vh' }}>
            <UIPlanRenderer plan={exampleHomePlan} />
        </div>
    );
}
