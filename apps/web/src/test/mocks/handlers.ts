import { http, HttpResponse } from 'msw';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://test.supabase.co';

// Mock data
export const mockVendors = [
    {
        id: 'vendor-1',
        name: 'Test Restaurant',
        slug: 'test-restaurant',
        status: 'active',
        description: 'A delicious test restaurant',
        address: '123 Test Street, Valletta',
        phone: '+356 1234 5678',
        logo_url: null,
        cover_image_url: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
    },
    {
        id: 'vendor-2',
        name: 'Pizza Palace',
        slug: 'pizza-palace',
        status: 'active',
        description: 'Best pizza in town',
        address: '456 Pizza Lane, Sliema',
        phone: '+356 9876 5432',
        logo_url: null,
        cover_image_url: null,
        created_at: '2024-01-02T00:00:00Z',
        updated_at: '2024-01-02T00:00:00Z',
    },
];

export const mockMenuItems = [
    {
        id: 'item-1',
        vendor_id: 'vendor-1',
        name: 'Burger Deluxe',
        description: 'Juicy beef burger with all the toppings',
        price: 12.99,
        category: 'Mains',
        image_url: null,
        is_available: true,
        sort_order: 1,
        created_at: '2024-01-01T00:00:00Z',
    },
    {
        id: 'item-2',
        vendor_id: 'vendor-1',
        name: 'Caesar Salad',
        description: 'Fresh romaine with caesar dressing',
        price: 8.99,
        category: 'Starters',
        image_url: null,
        is_available: true,
        sort_order: 2,
        created_at: '2024-01-01T00:00:00Z',
    },
];

export const mockOrders = [
    {
        id: 'order-1',
        vendor_id: 'vendor-1',
        table_number: 'TABLE001',
        status: 'pending',
        total: 21.98,
        items: [
            { item_id: 'item-1', name: 'Burger Deluxe', quantity: 1, price: 12.99 },
            { item_id: 'item-2', name: 'Caesar Salad', quantity: 1, price: 8.99 },
        ],
        notes: '',
        created_at: '2024-01-15T12:00:00Z',
    },
];

// MSW handlers
export const handlers = [
    // GET vendors
    http.get(`${SUPABASE_URL}/rest/v1/vendors`, ({ request }) => {
        const url = new URL(request.url);
        const slug = url.searchParams.get('slug');
        // const _select = url.searchParams.get('select');

        if (slug) {
            const vendor = mockVendors.find((v) => v.slug === slug.replace('eq.', ''));
            if (vendor) {
                return HttpResponse.json([vendor]);
            }
            return HttpResponse.json([]);
        }

        return HttpResponse.json(mockVendors);
    }),

    // GET single vendor by ID
    http.get(`${SUPABASE_URL}/rest/v1/vendors/:id`, ({ params }) => {
        const vendor = mockVendors.find((v) => v.id === params.id);
        if (vendor) {
            return HttpResponse.json(vendor);
        }
        return HttpResponse.json(null, { status: 404 });
    }),

    // GET menu items
    http.get(`${SUPABASE_URL}/rest/v1/menu_items`, ({ request }) => {
        const url = new URL(request.url);
        const vendorId = url.searchParams.get('vendor_id');

        if (vendorId) {
            const items = mockMenuItems.filter(
                (item) => item.vendor_id === vendorId.replace('eq.', '')
            );
            return HttpResponse.json(items);
        }

        return HttpResponse.json(mockMenuItems);
    }),

    // GET orders
    http.get(`${SUPABASE_URL}/rest/v1/orders`, ({ request }) => {
        const url = new URL(request.url);
        const vendorId = url.searchParams.get('vendor_id');

        if (vendorId) {
            const orders = mockOrders.filter(
                (order) => order.vendor_id === vendorId.replace('eq.', '')
            );
            return HttpResponse.json(orders);
        }

        return HttpResponse.json(mockOrders);
    }),

    // POST order
    http.post(`${SUPABASE_URL}/rest/v1/orders`, async ({ request }) => {
        const body = await request.json() as Record<string, unknown>;
        const newOrder = {
            id: `order-${Date.now()}`,
            ...body,
            status: 'pending',
            created_at: new Date().toISOString(),
        };
        return HttpResponse.json(newOrder, { status: 201 });
    }),

    // PATCH order (update status)
    http.patch(`${SUPABASE_URL}/rest/v1/orders`, async ({ request }) => {
        const body = await request.json() as Record<string, unknown>;
        return HttpResponse.json({ ...mockOrders[0], ...body });
    }),
];
