/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * IndexedDB Service using Dexie.js
 * Provides offline storage for menus and orders
 */

import Dexie, { Table } from 'dexie';

// Database schema
interface MenuCache {
  vendor_slug: string;
  data: any;
  updated_at: number;
}

interface OrderCache {
  id?: number;
  order_id: string;
  status: string;
  created_at: number;
  data: any;
}

interface FavoriteCache {
  id?: number;
  item_id: string;
  vendor_slug: string;
  added_at: number;
}

class DineInDB extends Dexie {
  menus!: Table<MenuCache, string>;
  orders!: Table<OrderCache, number>;
  favorites!: Table<FavoriteCache, number>;

  constructor() {
    super('DineInDB');
    this.version(1).stores({
      menus: 'vendor_slug, updated_at',
      orders: '++id, order_id, status, created_at',
      favorites: '++id, item_id, vendor_slug'
    });
  }
}

export const db = new DineInDB();

/**
 * Cache menu data for offline access
 */
export async function cacheMenu(vendorSlug: string, menuData: any): Promise<void> {
  try {
    await db.menus.put({
      vendor_slug: vendorSlug,
      data: menuData,
      updated_at: Date.now()
    });
  } catch (error) {
    console.error('Failed to cache menu:', error);
  }
}

/**
 * Get cached menu data
 * Returns cached data if less than 1 hour old, null otherwise
 */
export async function getCachedMenu(vendorSlug: string): Promise<any | null> {
  try {
    const cached = await db.menus.get(vendorSlug);
    if (cached && Date.now() - cached.updated_at < 3600000) {
      // Cache is less than 1 hour old
      return cached.data;
    }
    return null;
  } catch (error) {
    console.error('Failed to get cached menu:', error);
    return null;
  }
}

/**
 * Cache order for offline access
 */
export async function cacheOrder(order: OrderCache): Promise<void> {
  try {
    await db.orders.add({
      order_id: order.order_id,
      status: order.status,
      created_at: order.created_at,
      data: order.data
    });
  } catch (error) {
    console.error('Failed to cache order:', error);
  }
}

/**
 * Get cached orders
 */
export async function getCachedOrders(): Promise<OrderCache[]> {
  try {
    return await db.orders.orderBy('created_at').reverse().toArray();
  } catch (error) {
    console.error('Failed to get cached orders:', error);
    return [];
  }
}

/**
 * Cache favorite item
 */
export async function cacheFavorite(itemId: string, vendorSlug: string): Promise<void> {
  try {
    await db.favorites.add({
      item_id: itemId,
      vendor_slug: vendorSlug,
      added_at: Date.now()
    });
  } catch (error) {
    console.error('Failed to cache favorite:', error);
  }
}

/**
 * Remove favorite from cache
 */
export async function removeCachedFavorite(itemId: string): Promise<void> {
  try {
    await db.favorites.where('item_id').equals(itemId).delete();
  } catch (error) {
    console.error('Failed to remove cached favorite:', error);
  }
}

/**
 * Get cached favorites
 */
export async function getCachedFavorites(vendorSlug?: string): Promise<FavoriteCache[]> {
  try {
    if (vendorSlug) {
      return await db.favorites.where('vendor_slug').equals(vendorSlug).toArray();
    }
    return await db.favorites.toArray();
  } catch (error) {
    console.error('Failed to get cached favorites:', error);
    return [];
  }
}

/**
 * Clear old cache entries (older than 7 days)
 */
export async function clearOldCache(): Promise<void> {
  try {
    const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    
    // Clear old menus
    await db.menus.where('updated_at').below(sevenDaysAgo).delete();
    
    // Clear old orders (keep recent ones)
    await db.orders.where('created_at').below(sevenDaysAgo).delete();
  } catch (error) {
    console.error('Failed to clear old cache:', error);
  }
}
