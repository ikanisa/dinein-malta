import { describe, it, expect, beforeAll, afterAll, afterEach, vi } from 'vitest';
import { server } from '@/src/test/mocks/server';
import { mockVendors, mockMenuItems, mockOrders } from '@/src/test/mocks/handlers';

// Setup MSW server
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// Mock the supabase client
vi.mock('@/services/supabase', () => ({
    supabase: {
        from: (table: string) => ({
            select: (query?: string) => ({
                eq: (column: string, value: string) =>
                    Promise.resolve({
                        data:
                            table === 'vendors'
                                ? mockVendors.filter((v) => v[column as keyof typeof v] === value)
                                : table === 'menu_items'
                                    ? mockMenuItems.filter((m) => m[column as keyof typeof m] === value)
                                    : mockOrders.filter((o) => o[column as keyof typeof o] === value),
                        error: null,
                    }),
                single: () =>
                    Promise.resolve({
                        data: table === 'vendors' ? mockVendors[0] : null,
                        error: null,
                    }),
                order: () => ({
                    limit: () =>
                        Promise.resolve({
                            data:
                                table === 'vendors'
                                    ? mockVendors
                                    : table === 'menu_items'
                                        ? mockMenuItems
                                        : mockOrders,
                            error: null,
                        }),
                }),
            }),
            insert: (data: any) =>
                Promise.resolve({
                    data: { id: 'new-id', ...data },
                    error: null,
                }),
            update: (data: any) => ({
                eq: () =>
                    Promise.resolve({
                        data: { ...mockOrders[0], ...data },
                        error: null,
                    }),
            }),
        }),
        auth: {
            getSession: () => Promise.resolve({ data: { session: null }, error: null }),
            onAuthStateChange: () => ({ data: { subscription: { unsubscribe: vi.fn() } } }),
        },
    },
}));

describe('Database Service Integration', () => {
    describe('Vendor Operations', () => {
        it('fetches all vendors', async () => {
            const { supabase } = await import('@/services/supabase');
            const { data, error } = await supabase
                .from('vendors')
                .select('*')
                .order('name')
                .limit(100);

            expect(error).toBeNull();
            expect(data).toHaveLength(2);
            expect(data).toEqual(mockVendors);
        });

        it('fetches vendor by slug', async () => {
            const { supabase } = await import('@/services/supabase');
            const { data, error } = await supabase
                .from('vendors')
                .select('*')
                .eq('slug', 'test-restaurant');

            expect(error).toBeNull();
            expect(data).toHaveLength(1);
            expect(data[0].name).toBe('Test Restaurant');
        });

        it('fetches single vendor', async () => {
            const { supabase } = await import('@/services/supabase');
            const { data, error } = await supabase
                .from('vendors')
                .select('*')
                .single();

            expect(error).toBeNull();
            expect(data).toEqual(mockVendors[0]);
        });
    });

    describe('Menu Item Operations', () => {
        it('fetches menu items by vendor ID', async () => {
            const { supabase } = await import('@/services/supabase');
            const { data, error } = await supabase
                .from('menu_items')
                .select('*')
                .eq('vendor_id', 'vendor-1');

            expect(error).toBeNull();
            expect(data).toHaveLength(2);
            expect(data[0].name).toBe('Burger Deluxe');
        });
    });

    describe('Order Operations', () => {
        it('fetches orders by vendor ID', async () => {
            const { supabase } = await import('@/services/supabase');
            const { data, error } = await supabase
                .from('orders')
                .select('*')
                .eq('vendor_id', 'vendor-1');

            expect(error).toBeNull();
            expect(data).toHaveLength(1);
            expect(data[0].status).toBe('pending');
        });

        it('creates a new order', async () => {
            const { supabase } = await import('@/services/supabase');
            const newOrder = {
                vendor_id: 'vendor-1',
                table_number: 'TABLE002',
                items: [{ item_id: 'item-1', quantity: 2 }],
                total: 25.98,
            };

            const { data, error } = await supabase.from('orders').insert(newOrder);

            expect(error).toBeNull();
            expect(data).toHaveProperty('id');
            expect(data.vendor_id).toBe('vendor-1');
        });

        it('updates order status', async () => {
            const { supabase } = await import('@/services/supabase');
            const { data, error } = await supabase
                .from('orders')
                .update({ status: 'preparing' })
                .eq('id', 'order-1');

            expect(error).toBeNull();
            expect(data.status).toBe('preparing');
        });
    });
});
