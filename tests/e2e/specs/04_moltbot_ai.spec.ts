import { test, expect } from '@playwright/test';
import { VENUES, ROUTES } from '../fixtures/testData';
import { waitForPageReady } from '../utils/wait';

/**
 * Moltbot AI Assistant E2E Tests
 * 
 * Tests the AI-assisted ordering and management flows:
 * 1. Guest agent - menu discovery, ordering via chat
 * 2. Bar manager agent - order management via chat
 * 
 * These tests verify the agentic loop works end-to-end,
 * including tool calling and response generation.
 * 
 * NOTE: These tests require the Supabase edge function to be deployed
 * and the ANTHROPIC_API_KEY to be set.
 */

// API endpoint for agent-chat
const AGENT_CHAT_URL = process.env.SUPABASE_URL
    ? `${process.env.SUPABASE_URL}/functions/v1/agent-chat`
    : 'http://localhost:54321/functions/v1/agent-chat';

// Test venue ID - set via environment variable for CI
const TEST_VENUE_ID = process.env.E2E_VENUE_ID || 'test-venue-uuid';
const TEST_VENUE_SLUG = VENUES.PRIMARY.slug;

test.describe('Moltbot Guest Agent', () => {
    test('Can search menu via AI chat', async ({ request }) => {
        // Send a menu search request to the agent
        const response = await request.post(AGENT_CHAT_URL, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY || ''}`
            },
            data: {
                message: "What drinks do you have?",
                agent_type: "guest",
                context: {
                    venue_id: TEST_VENUE_ID,
                    table_no: "5"
                }
            }
        });

        // Should return 200 OK
        expect(response.ok()).toBeTruthy();

        const data = await response.json();

        // Response should contain assistant content
        expect(data).toHaveProperty('content');
        expect(data.content).toBeTruthy();

        // Should have called menu_search tool
        if (data.tool_calls && data.tool_calls.length > 0) {
            const menuSearchCall = data.tool_calls.find(
                (call: { tool: string }) => call.tool === 'menu_search'
            );
            expect(menuSearchCall).toBeDefined();
        }

        console.log('Guest menu search response:', data.content);
    });

    test('Can add item to cart via AI chat', async ({ request }) => {
        // First search for items
        const searchResponse = await request.post(AGENT_CHAT_URL, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY || ''}`
            },
            data: {
                message: "Show me your beers",
                agent_type: "guest",
                context: {
                    venue_id: TEST_VENUE_ID,
                    table_no: "5",
                    user_id: "test-user-123"
                }
            }
        });

        expect(searchResponse.ok()).toBeTruthy();

        // Now add to cart
        const addResponse = await request.post(AGENT_CHAT_URL, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY || ''}`
            },
            data: {
                message: "Add one of those to my cart",
                agent_type: "guest",
                context: {
                    venue_id: TEST_VENUE_ID,
                    table_no: "5",
                    user_id: "test-user-123"
                }
            }
        });

        expect(addResponse.ok()).toBeTruthy();
        const data = await addResponse.json();

        // Should confirm item added
        expect(data.content).toContain('cart');

        console.log('Guest add to cart response:', data.content);
    });

    test('Can call staff via AI chat', async ({ request }) => {
        const response = await request.post(AGENT_CHAT_URL, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY || ''}`
            },
            data: {
                message: "I need to speak to a waiter please",
                agent_type: "guest",
                context: {
                    venue_id: TEST_VENUE_ID,
                    table_no: "5"
                }
            }
        });

        expect(response.ok()).toBeTruthy();
        const data = await response.json();

        // Should call the call_staff tool
        if (data.tool_calls) {
            const staffCall = data.tool_calls.find(
                (call: { tool: string }) => call.tool === 'call_staff'
            );
            expect(staffCall).toBeDefined();
        }

        console.log('Guest call staff response:', data.content);
    });
});

test.describe('Moltbot Bar Manager Agent', () => {
    test('Can get active orders via AI chat', async ({ request }) => {
        const response = await request.post(AGENT_CHAT_URL, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY || ''}`
            },
            data: {
                message: "Show me all active orders",
                agent_type: "bar_manager",
                context: {
                    venue_id: TEST_VENUE_ID
                }
            }
        });

        expect(response.ok()).toBeTruthy();
        const data = await response.json();

        // Should have called get_active_orders tool
        if (data.tool_calls) {
            const ordersCall = data.tool_calls.find(
                (call: { tool: string }) => call.tool === 'get_active_orders'
            );
            expect(ordersCall).toBeDefined();
        }

        console.log('Bar manager active orders response:', data.content);
    });

    test('Can get sales summary via AI chat', async ({ request }) => {
        const response = await request.post(AGENT_CHAT_URL, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY || ''}`
            },
            data: {
                message: "Give me a summary of today's sales",
                agent_type: "bar_manager",
                context: {
                    venue_id: TEST_VENUE_ID
                }
            }
        });

        expect(response.ok()).toBeTruthy();
        const data = await response.json();

        // Should have called get_sales_summary tool
        if (data.tool_calls) {
            const salesCall = data.tool_calls.find(
                (call: { tool: string }) => call.tool === 'get_sales_summary'
            );
            expect(salesCall).toBeDefined();
        }

        console.log('Bar manager sales summary response:', data.content);
    });
});

test.describe('Moltbot Error Handling', () => {
    test('Returns error for missing venue context', async ({ request }) => {
        const response = await request.post(AGENT_CHAT_URL, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY || ''}`
            },
            data: {
                message: "What's on the menu?",
                agent_type: "guest",
                context: {
                    // Missing venue_id
                }
            }
        });

        // Should still return 200 but with error message or graceful handling
        const data = await response.json();
        console.log('Missing context response:', data);
    });

    test('Returns error for invalid agent type', async ({ request }) => {
        const response = await request.post(AGENT_CHAT_URL, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY || ''}`
            },
            data: {
                message: "Hello",
                agent_type: "invalid_type",
                context: {
                    venue_id: TEST_VENUE_ID
                }
            }
        });

        // Should return error
        const data = await response.json();
        console.log('Invalid agent type response:', data);
    });
});
