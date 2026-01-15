// Supabase client imported via databaseService
import {
    getAllVenues,
    getVenueBySlugOrId,
    getMenuItemsForVendor,
    createMenuItem as dbCreateMenuItem,
    updateMenuItem as dbUpdateMenuItem,
    deleteMenuItem as dbDeleteMenuItem,
    getOrdersForVenue,
    createOrder as dbCreateOrder,
    updateOrderStatus as dbUpdateOrderStatus,
    getTablesForVenue,
    getReservationsForVenue,
    createReservation as dbCreateReservation,
} from './databaseService';
import { Venue, MenuItem, Order, Table, Reservation } from '../types';

// --- API ERROR CLASS ---

export class APIError extends Error {
    constructor(
        message: string,
        public statusCode?: number,
        public details?: any
    ) {
        super(message);
        this.name = 'APIError';
    }
}

// --- VENDORS API ---

export const vendorsApi = {
    async getAll(filters?: { status?: string; search?: string }): Promise<Venue[]> {
        try {
            const venues = await getAllVenues();
            let filtered = venues;

            if (filters?.status) {
                filtered = filtered.filter(v => v.status === filters.status);
            }

            if (filters?.search) {
                const search = filters.search.toLowerCase();
                filtered = filtered.filter(v =>
                    v.name.toLowerCase().includes(search) ||
                    v.description?.toLowerCase().includes(search)
                );
            }

            return filtered;
        } catch (error) {
            console.error('Error fetching vendors:', error);
            throw error instanceof APIError ? error : new APIError('Failed to fetch vendors');
        }
    },

    async getBySlug(slug: string): Promise<Venue | null> {
        try {
            return await getVenueBySlugOrId(slug);
        } catch (error) {
            console.error('Error fetching vendor:', error);
            throw error instanceof APIError ? error : new APIError('Vendor not found');
        }
    },
};

// --- MENU ITEMS API ---

export const menuItemsApi = {
    async getForVendor(vendorId: string): Promise<MenuItem[]> {
        try {
            return await getMenuItemsForVendor(vendorId);
        } catch (error) {
            console.error('Error fetching menu items:', error);
            throw error instanceof APIError ? error : new APIError('Failed to fetch menu items');
        }
    },

    async create(vendorId: string, item: Omit<MenuItem, 'id'>): Promise<MenuItem> {
        try {
            return await dbCreateMenuItem(vendorId, item);
        } catch (error) {
            console.error('Error creating menu item:', error);
            throw error instanceof APIError ? error : new APIError('Failed to create menu item');
        }
    },

    async update(itemId: string, updates: Partial<MenuItem>): Promise<MenuItem> {
        try {
            return await dbUpdateMenuItem(itemId, updates);
        } catch (error) {
            console.error('Error updating menu item:', error);
            throw error instanceof APIError ? error : new APIError('Failed to update menu item');
        }
    },

    async delete(itemId: string): Promise<void> {
        try {
            await dbDeleteMenuItem(itemId);
        } catch (error) {
            console.error('Error deleting menu item:', error);
            throw error instanceof APIError ? error : new APIError('Failed to delete menu item');
        }
    },
};

// --- ORDERS API ---

export const ordersApi = {
    async getForVendor(vendorId: string): Promise<Order[]> {
        try {
            return await getOrdersForVenue(vendorId);
        } catch (error) {
            console.error('Error fetching orders:', error);
            throw error instanceof APIError ? error : new APIError('Failed to fetch orders');
        }
    },

    async create(orderData: any): Promise<Order> {
        try {
            return await dbCreateOrder(orderData);
        } catch (error) {
            console.error('Error creating order:', error);
            throw error instanceof APIError ? error : new APIError('Failed to create order');
        }
    },

    async updateStatus(orderId: string, status: string): Promise<void> {
        try {
            await dbUpdateOrderStatus(orderId, status as any);
        } catch (error) {
            console.error('Error updating order status:', error);
            throw error instanceof APIError ? error : new APIError('Failed to update order status');
        }
    },
};

// --- TABLES API ---

export const tablesApi = {
    async getForVendor(vendorId: string): Promise<Table[]> {
        try {
            return await getTablesForVenue(vendorId);
        } catch (error) {
            console.error('Error fetching tables:', error);
            throw error instanceof APIError ? error : new APIError('Failed to fetch tables');
        }
    },
};

// --- RESERVATIONS API ---

export const reservationsApi = {
    async getForVendor(vendorId: string): Promise<Reservation[]> {
        try {
            return await getReservationsForVenue(vendorId);
        } catch (error) {
            console.error('Error fetching reservations:', error);
            throw error instanceof APIError ? error : new APIError('Failed to fetch reservations');
        }
    },

    async create(reservationData: any): Promise<Reservation> {
        try {
            return await dbCreateReservation(reservationData);
        } catch (error) {
            console.error('Error creating reservation:', error);
            throw error instanceof APIError ? error : new APIError('Failed to create reservation');
        }
    },
};

// --- COMBINED API EXPORT ---

export const api = {
    vendors: vendorsApi,
    menuItems: menuItemsApi,
    orders: ordersApi,
    tables: tablesApi,
    reservations: reservationsApi,
};
