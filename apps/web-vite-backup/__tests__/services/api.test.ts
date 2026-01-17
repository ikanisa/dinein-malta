/**
 * Unit tests for api.ts
 * Tests for vendorsApi, menuItemsApi, ordersApi, and APIError
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import { APIError, vendorsApi, menuItemsApi, ordersApi } from '../../services/api';

// Mock the databaseService
vi.mock('../../services/databaseService', () => ({
    getAllVenues: vi.fn(),
    getVenueBySlugOrId: vi.fn(),
    getMenuItemsForVendor: vi.fn(),
    createMenuItem: vi.fn(),
    updateMenuItem: vi.fn(),
    deleteMenuItem: vi.fn(),
    getOrdersForVenue: vi.fn(),
    createOrder: vi.fn(),
    updateOrderStatus: vi.fn(),
    getTablesForVenue: vi.fn(),
    getReservationsForVenue: vi.fn(),
    createReservation: vi.fn(),
}));

// Mock supabase
vi.mock('../../services/supabase', () => ({
    supabase: {
        auth: {
            getSession: vi.fn(() => Promise.resolve({ data: { session: null } })),
        },
    },
}));

import * as db from '../../services/databaseService';

describe('APIError', () => {
    it('creates error with message only', () => {
        const error = new APIError('Test error');
        expect(error.message).toBe('Test error');
        expect(error.name).toBe('APIError');
        expect(error.statusCode).toBeUndefined();
        expect(error.details).toBeUndefined();
    });

    it('creates error with statusCode and details', () => {
        const error = new APIError('Not found', 404, { id: '123' });
        expect(error.message).toBe('Not found');
        expect(error.statusCode).toBe(404);
        expect(error.details).toEqual({ id: '123' });
    });

    it('is instance of Error', () => {
        const error = new APIError('Test');
        expect(error).toBeInstanceOf(Error);
    });
});

describe('vendorsApi', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('getAll', () => {
        const mockVenues = [
            { id: '1', name: 'Restaurant A', status: 'active', description: 'Great food' },
            { id: '2', name: 'Restaurant B', status: 'inactive', description: 'Italian' },
            { id: '3', name: 'Cafe C', status: 'active', description: 'Coffee shop' },
        ];

        it('returns all venues when no filters', async () => {
            (db.getAllVenues as Mock).mockResolvedValue(mockVenues);

            const result = await vendorsApi.getAll();

            expect(db.getAllVenues).toHaveBeenCalled();
            expect(result).toHaveLength(3);
        });

        it('filters by status', async () => {
            (db.getAllVenues as Mock).mockResolvedValue(mockVenues);

            const result = await vendorsApi.getAll({ status: 'active' });

            expect(result).toHaveLength(2);
            expect(result.every(v => v.status === 'active')).toBe(true);
        });

        it('filters by search term in name', async () => {
            (db.getAllVenues as Mock).mockResolvedValue(mockVenues);

            const result = await vendorsApi.getAll({ search: 'Restaurant' });

            expect(result).toHaveLength(2);
            expect(result.every(v => v.name.includes('Restaurant'))).toBe(true);
        });

        it('filters by search term in description', async () => {
            (db.getAllVenues as Mock).mockResolvedValue(mockVenues);

            const result = await vendorsApi.getAll({ search: 'italian' });

            expect(result).toHaveLength(1);
            expect(result[0].description).toContain('Italian');
        });

        it('combines status and search filters', async () => {
            (db.getAllVenues as Mock).mockResolvedValue(mockVenues);

            const result = await vendorsApi.getAll({ status: 'active', search: 'cafe' });

            expect(result).toHaveLength(1);
            expect(result[0].name).toBe('Cafe C');
        });

        it('throws APIError on database error', async () => {
            (db.getAllVenues as Mock).mockRejectedValue(new Error('DB connection failed'));

            await expect(vendorsApi.getAll()).rejects.toThrow('Failed to fetch vendors');
        });

        it('rethrows APIError as-is', async () => {
            const apiError = new APIError('Custom error', 500);
            (db.getAllVenues as Mock).mockRejectedValue(apiError);

            await expect(vendorsApi.getAll()).rejects.toThrow('Custom error');
        });
    });

    describe('getBySlug', () => {
        it('returns venue when found', async () => {
            const mockVenue = { id: '1', name: 'Test Restaurant', slug: 'test-restaurant' };
            (db.getVenueBySlugOrId as Mock).mockResolvedValue(mockVenue);

            const result = await vendorsApi.getBySlug('test-restaurant');

            expect(db.getVenueBySlugOrId).toHaveBeenCalledWith('test-restaurant');
            expect(result).toEqual(mockVenue);
        });

        it('returns null when not found', async () => {
            (db.getVenueBySlugOrId as Mock).mockResolvedValue(null);

            const result = await vendorsApi.getBySlug('non-existent');

            expect(result).toBeNull();
        });

        it('throws APIError on error', async () => {
            (db.getVenueBySlugOrId as Mock).mockRejectedValue(new Error('DB error'));

            await expect(vendorsApi.getBySlug('test')).rejects.toThrow('Vendor not found');
        });
    });
});

describe('menuItemsApi', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('getForVendor', () => {
        it('returns menu items for vendor', async () => {
            const mockItems = [
                { id: '1', name: 'Burger', price: 15 },
                { id: '2', name: 'Pizza', price: 20 },
            ];
            (db.getMenuItemsForVendor as Mock).mockResolvedValue(mockItems);

            const result = await menuItemsApi.getForVendor('vendor-1');

            expect(db.getMenuItemsForVendor).toHaveBeenCalledWith('vendor-1');
            expect(result).toHaveLength(2);
        });

        it('throws APIError on error', async () => {
            (db.getMenuItemsForVendor as Mock).mockRejectedValue(new Error('DB error'));

            await expect(menuItemsApi.getForVendor('vendor-1')).rejects.toThrow('Failed to fetch menu items');
        });
    });

    describe('create', () => {
        it('creates menu item successfully', async () => {
            const newItem = { name: 'Salad', price: 10 };
            const createdItem = { id: 'item-1', ...newItem };
            (db.createMenuItem as Mock).mockResolvedValue(createdItem);

            const result = await menuItemsApi.create('vendor-1', newItem as any);

            expect(db.createMenuItem).toHaveBeenCalledWith('vendor-1', newItem);
            expect(result).toEqual(createdItem);
        });

        it('throws APIError on error', async () => {
            (db.createMenuItem as Mock).mockRejectedValue(new Error('DB error'));

            await expect(menuItemsApi.create('vendor-1', {} as any)).rejects.toThrow('Failed to create menu item');
        });
    });

    describe('update', () => {
        it('updates menu item successfully', async () => {
            const updates = { price: 25 };
            const updatedItem = { id: 'item-1', name: 'Burger', price: 25 };
            (db.updateMenuItem as Mock).mockResolvedValue(updatedItem);

            const result = await menuItemsApi.update('item-1', updates);

            expect(db.updateMenuItem).toHaveBeenCalledWith('item-1', updates);
            expect(result).toEqual(updatedItem);
        });

        it('throws APIError on error', async () => {
            (db.updateMenuItem as Mock).mockRejectedValue(new Error('DB error'));

            await expect(menuItemsApi.update('item-1', {})).rejects.toThrow('Failed to update menu item');
        });
    });

    describe('delete', () => {
        it('deletes menu item successfully', async () => {
            (db.deleteMenuItem as Mock).mockResolvedValue(undefined);

            await expect(menuItemsApi.delete('item-1')).resolves.toBeUndefined();
            expect(db.deleteMenuItem).toHaveBeenCalledWith('item-1');
        });

        it('throws APIError on error', async () => {
            (db.deleteMenuItem as Mock).mockRejectedValue(new Error('DB error'));

            await expect(menuItemsApi.delete('item-1')).rejects.toThrow('Failed to delete menu item');
        });
    });
});

describe('ordersApi', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('getForVendor', () => {
        it('returns orders for vendor', async () => {
            const mockOrders = [
                { id: 'order-1', status: 'pending', totalAmount: 50 },
                { id: 'order-2', status: 'completed', totalAmount: 75 },
            ];
            (db.getOrdersForVenue as Mock).mockResolvedValue(mockOrders);

            const result = await ordersApi.getForVendor('vendor-1');

            expect(db.getOrdersForVenue).toHaveBeenCalledWith('vendor-1');
            expect(result).toHaveLength(2);
        });

        it('throws APIError on error', async () => {
            (db.getOrdersForVenue as Mock).mockRejectedValue(new Error('DB error'));

            await expect(ordersApi.getForVendor('vendor-1')).rejects.toThrow('Failed to fetch orders');
        });
    });

    describe('create', () => {
        it('creates order successfully', async () => {
            const orderData = { venueId: 'venue-1', items: [] };
            const createdOrder = { id: 'order-1', ...orderData, status: 'pending' };
            (db.createOrder as Mock).mockResolvedValue(createdOrder);

            const result = await ordersApi.create(orderData);

            expect(db.createOrder).toHaveBeenCalledWith(orderData);
            expect(result).toEqual(createdOrder);
        });

        it('throws APIError on error', async () => {
            (db.createOrder as Mock).mockRejectedValue(new Error('DB error'));

            await expect(ordersApi.create({})).rejects.toThrow('Failed to create order');
        });
    });

    describe('updateStatus', () => {
        it('updates order status successfully', async () => {
            (db.updateOrderStatus as Mock).mockResolvedValue(undefined);

            await expect(ordersApi.updateStatus('order-1', 'completed')).resolves.toBeUndefined();
            expect(db.updateOrderStatus).toHaveBeenCalledWith('order-1', 'completed');
        });

        it('throws APIError on error', async () => {
            (db.updateOrderStatus as Mock).mockRejectedValue(new Error('DB error'));

            await expect(ordersApi.updateStatus('order-1', 'completed')).rejects.toThrow('Failed to update order status');
        });
    });
});
