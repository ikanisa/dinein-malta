import { supabase } from './supabase';
import { Venue, MenuItem, Order, OrderStatus, PaymentStatus, Table, Reservation, ReservationStatus, User, UserType, AdminUser, AuditLog } from '../types';

// --- PRODUCTION SERVICE LAYER ---
// Replaces previous mock implementation with direct, secure Supabase interactions.

// --- HELPERS ---

const handleSupabaseError = (error: unknown, context: string) => {
  console.error(`DB Error [${context}]:`, JSON.stringify(error, null, 2));
  // specific error handling logic (e.g., toast notifications) could go here
  return null;
};

// --- MAPPERS ---
// Maps SQL snake_case to App camelCase

export const toOrderStatus = (value?: string | null): OrderStatus => {
  const normalized = (value || '').toString().toLowerCase();
  // Map database values to enum
  switch (normalized) {
    case 'new':
      return OrderStatus.NEW;
    case 'preparing':
      return OrderStatus.PREPARING;
    case 'ready':
      return OrderStatus.READY;
    case 'completed':
      return OrderStatus.COMPLETED;
    case 'served': // Legacy: served maps to completed
      return OrderStatus.COMPLETED;
    case 'cancelled':
      return OrderStatus.CANCELLED;
    case 'received': // Legacy: received maps to new
    default:
      return OrderStatus.NEW;
  }
};

export const toPaymentStatus = (value?: string | null): PaymentStatus => {
  const normalized = (value || '').toString().toUpperCase();
  return normalized === PaymentStatus.PAID ? PaymentStatus.PAID : PaymentStatus.UNPAID;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- DB row mapper
const mapVenue = (row: Record<string, any>): Venue => ({
  id: row.id,
  name: row.name,
  address: row.address || '',
  description: '', // Not in vendors schema
  revolutHandle: row.revolut_link || '',
  phone: row.phone,
  whatsappNumber: row.whatsapp,
  website: row.website,
  instagramUrl: undefined, // Not in vendors schema
  facebookUrl: undefined, // Not in vendors schema
  openingHours: row.hours_json ? (typeof row.hours_json === 'string' ? row.hours_json : JSON.stringify(row.hours_json)) : undefined,
  tags: [], // Not in vendors schema
  menu: [], // Menu items are in separate menu_items table
  imageUrl: row.photos_json && row.photos_json[0] ? (row.photos_json[0].url || row.photos_json[0]) : undefined,
  ownerId: row.owner_id, // Will need to join vendor_users to get this
  currency: 'EUR', // Fixed in schema
  status: row.status || 'active'
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- DB row mapper
const mapOrder = (row: Record<string, any>): Order => {
  const tableLabel = row.table?.label || row.table?.table_number?.toString() || row.table_number?.toString();
  return {
    id: row.id,
    venueId: row.vendor_id || row.venue_id,
    tableNumber: tableLabel || '',
    orderCode: row.order_code,
    items: row.items || [],
    totalAmount: Number(row.total_amount || 0),
    currency: row.currency || 'EUR',
    status: toOrderStatus(row.status),
    paymentStatus: toPaymentStatus(row.payment_status),
    timestamp: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
    customerNote: row.notes || row.customer_note
  };
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- DB row mapper
const mapTable = (row: Record<string, any>): Table => ({
  id: row.id,
  venueId: row.vendor_id || row.venue_id,
  label: row.label,
  code: row.public_code || row.code,
  active: row.is_active ?? row.active
});

// Helper to map DB status to frontend enum
const mapReservationStatus = (dbStatus: string): ReservationStatus => {
  const lower = dbStatus.toLowerCase();
  if (lower === 'pending') return ReservationStatus.PENDING;
  if (lower === 'accepted') return ReservationStatus.CONFIRMED; // DB uses 'accepted', frontend uses 'CONFIRMED'
  if (lower === 'declined') return ReservationStatus.DECLINED;
  if (lower === 'cancelled') return ReservationStatus.CANCELLED;
  return ReservationStatus.PENDING;
};

// Helper to map frontend enum to DB status
const mapReservationStatusToDb = (status: ReservationStatus): string => {
  switch (status) {
    case ReservationStatus.PENDING: return 'pending';
    case ReservationStatus.CONFIRMED: return 'accepted'; // Frontend uses 'CONFIRMED', DB uses 'accepted'
    case ReservationStatus.DECLINED: return 'declined';
    case ReservationStatus.CANCELLED: return 'cancelled';
    default: return 'pending';
  }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- DB row mapper
const mapReservation = (row: Record<string, any>): Reservation => {
  return {
    id: row.id,
    venueId: row.vendor_id, // Note: DB uses vendor_id, not venue_id
    clientAuthUserId: row.client_auth_user_id,
    partySize: row.party_size,
    datetime: row.datetime, // Already ISO string from DB
    status: mapReservationStatus(row.status),
    createdAt: row.created_at, // ISO string from DB
    note: row.notes || undefined // DB uses 'notes', not 'note'
  };
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- DB row mapper
const mapUser = (row: Record<string, any>): User => ({
  id: row.id,
  name: row.name || 'Guest',
  role: (row.role as UserType) || UserType.CLIENT,
  favorites: row.favorites || [],
  notificationsEnabled: row.notifications_enabled ?? true
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- DB row mapper
const mapMenuItem = (row: Record<string, any>): MenuItem => ({
  id: row.id,
  name: row.name,
  description: row.description || '',
  price: parseFloat(row.price),
  imageUrl: row.image_url || undefined,
  category: row.category || 'Mains',
  available: row.is_available ?? true,
  tags: row.tags_json || [],
  options: [] // Could add options_json field if needed in the future
});

// --- CORE FUNCTIONS ---

// VENUES

export const getVenueById = async (id: string): Promise<Venue | undefined> => {
  // Optimized query: select only needed columns
  const { data, error } = await supabase
    .from('vendors')
    .select('id, name, address, revolut_link, phone, whatsapp, website, hours_json, photos_json, status')
    .eq('id', id)
    .single();
  if (error) return undefined;
  const venue = mapVenue(data);

  // Fetch menu items using the helper function
  venue.menu = await getMenuItemsForVendor(id);

  return venue;
};

export const getVenueBySlugOrId = async (value: string): Promise<Venue | null> => {
  if (!value) return null;
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
  if (isUuid) {
    const venue = await getVenueById(value);
    return venue || null;
  }

  const { data, error } = await supabase
    .from('vendors')
    .select('id, name, address, revolut_link, phone, whatsapp, website, hours_json, photos_json, status, slug')
    .eq('slug', value)
    .single();

  if (error || !data) return null;

  const venue = mapVenue(data);
  venue.menu = await getMenuItemsForVendor(venue.id);
  return venue;
};

export const getVenueByOwner = async (ownerId: string): Promise<Venue | undefined> => {
  // Join vendor_users to find vendor by owner
  const { data: vendorUser } = await supabase
    .from('vendor_users')
    .select('vendor_id')
    .eq('auth_user_id', ownerId)
    .eq('is_active', true)
    .single();

  if (!vendorUser) return undefined;

  const { data, error } = await supabase.from('vendors').select('*').eq('id', vendorUser.vendor_id).single();
  if (error || !data) return undefined;

  const venue = mapVenue(data);
  venue.ownerId = ownerId;

  // Fetch menu items using the helper function
  venue.menu = await getMenuItemsForVendor(data.id);

  return venue;
};

export const getAllVenues = async (): Promise<Venue[]> => {
  // Optimized query: select only needed columns
  const { data, error } = await supabase
    .from('vendors')
    .select('id, name, address, revolut_link, phone, whatsapp, website, hours_json, photos_json, status')
    .eq('status', 'active');
  if (error) handleSupabaseError(error, 'getAllVenues');
  const venues = (data || []).map(mapVenue);

  // Batch fetch menu items for all venues (more efficient than N+1 queries)
  const venueIds = venues.map(v => v.id);
  if (venueIds.length > 0) {
    const { data: menuItems } = await supabase
      .from('menu_items')
      .select('vendor_id, id, name, description, price, category, is_available, tags_json, image_url')
      .in('vendor_id', venueIds)
      .eq('is_available', true);

    // Group menu items by vendor_id
    const menuMap = new Map<string, MenuItem[]>();
    (menuItems || []).forEach(item => {
      if (!menuMap.has(item.vendor_id)) {
        menuMap.set(item.vendor_id, []);
      }
      menuMap.get(item.vendor_id)!.push(mapMenuItem(item));
    });

    // Attach menu items to venues
    venues.forEach(venue => {
      venue.menu = menuMap.get(venue.id) || [];
    });
  }

  return venues;
};

export const getFeaturedVenues = async (limit = 10): Promise<Venue[]> => {
  // Optimized query: select only needed columns
  const { data, error } = await supabase
    .from('vendors')
    .select('id, name, address, revolut_link, phone, whatsapp, website, hours_json, photos_json, status')
    .eq('status', 'active')
    .limit(limit);
  if (error) handleSupabaseError(error, 'getFeaturedVenues');
  const venues = (data || []).map(mapVenue);

  // Batch fetch menu items for featured venues
  const venueIds = venues.map(v => v.id);
  if (venueIds.length > 0) {
    const { data: menuItems } = await supabase
      .from('menu_items')
      .select('vendor_id, id, name, description, price, category, is_available, tags_json, image_url')
      .in('vendor_id', venueIds)
      .eq('is_available', true);

    const menuMap = new Map<string, MenuItem[]>();
    (menuItems || []).forEach(item => {
      if (!menuMap.has(item.vendor_id)) {
        menuMap.set(item.vendor_id, []);
      }
      menuMap.get(item.vendor_id)!.push(mapMenuItem(item));
    });

    venues.forEach(venue => {
      venue.menu = menuMap.get(venue.id) || [];
    });
  }

  return venues;
};

export const createVendor = async (vendorData: {
  name: string;
  slug?: string;
  address?: string;
  hours_json?: unknown;
  photos_json?: unknown;
  website?: string;
  phone?: string;
  revolut_link?: string;
  whatsapp?: string;
}): Promise<Venue> => {
  // Use secure Edge Function for vendor onboarding
  const { data, error } = await supabase.functions.invoke('vendor_claim', {
    body: vendorData
  });

  if (error) {
    console.error("Vendor claim error:", error);
    throw new Error(error.message || "Failed to claim vendor. Please try again.");
  }

  // Map vendor response to Venue format (for frontend compatibility)
  const vendor = data.vendor;
  return {
    id: vendor.id,
    name: vendor.name,
    address: vendor.address || '',
    description: '', // Not in vendor schema
    revolutHandle: vendor.revolut_link || '',
    phone: vendor.phone,
    whatsappNumber: vendor.whatsapp,
    website: vendor.website,
    openingHours: vendor.hours_json ? JSON.stringify(vendor.hours_json) : undefined,
    tags: [],
    menu: [],
    imageUrl: vendor.photos_json?.[0] || undefined,
    ownerId: data.membership?.auth_user_id,
    currency: 'EUR',
    status: vendor.status
  };
};

// Legacy function name for backward compatibility
export const createVenue = createVendor;

export const updateVenue = async (venue: Venue): Promise<void> => {
  // Map Venue to vendors table schema
  const dbVendor = {
    name: venue.name,
    address: venue.address,
    revolut_link: venue.revolutHandle,
    phone: venue.phone,
    whatsapp: venue.whatsappNumber,
    website: venue.website,
    hours_json: venue.openingHours ? { text: venue.openingHours } : null,
    photos_json: venue.imageUrl ? [{ url: venue.imageUrl }] : null
    // Note: description, instagram, facebook, tags not in vendors schema
    // Menu items are in separate menu_items table
  };

  const { error } = await supabase.from('vendors').update(dbVendor).eq('id', venue.id);
  if (error) throw error;
};

// MENU ITEMS CRUD FUNCTIONS

export const getMenuItemsForVendor = async (vendorId: string, includeUnavailable = false): Promise<MenuItem[]> => {
  // Optimized query: select only needed columns
  let query = supabase
    .from('menu_items')
    .select('id, vendor_id, name, description, price, category, is_available, tags_json, image_url, currency')
    .eq('vendor_id', vendorId);

  if (!includeUnavailable) {
    query = query.eq('is_available', true);
  }

  const { data, error } = await query
    .order('category', { ascending: true })
    .order('name', { ascending: true });

  if (error) throw error;
  return (data || []).map(mapMenuItem);
};

export const createMenuItem = async (vendorId: string, item: Omit<MenuItem, 'id'>): Promise<MenuItem> => {
  const imageUrl = item.imageUrl;

  const { data, error } = await supabase
    .from('menu_items')
    .insert({
      vendor_id: vendorId,
      name: item.name,
      description: item.description || '',
      price: item.price,
      category: item.category || 'Mains',
      is_available: item.available ?? true,
      tags_json: item.tags || [],
      image_url: imageUrl || null,
      currency: 'EUR'
    })
    .select()
    .single();

  if (error) throw error;

  const createdItem = mapMenuItem(data);

  // Gemini AI removed from client - image generation disabled
  // Images must be provided manually or generated via admin Edge Functions
  // Item created without automatic image generation

  return createdItem;
};

export const updateMenuItem = async (itemId: string, updates: Partial<MenuItem>): Promise<MenuItem> => {
  const dbUpdates: Record<string, unknown> = {};
  if (updates.name) dbUpdates.name = updates.name;
  if (updates.description !== undefined) dbUpdates.description = updates.description;
  if (updates.price !== undefined) dbUpdates.price = updates.price;
  if (updates.category) dbUpdates.category = updates.category;
  if (updates.available !== undefined) dbUpdates.is_available = updates.available;
  if (updates.tags) dbUpdates.tags_json = updates.tags;
  if (updates.imageUrl !== undefined) dbUpdates.image_url = updates.imageUrl;

  const { data, error } = await supabase
    .from('menu_items')
    .update(dbUpdates)
    .eq('id', itemId)
    .select()
    .single();

  if (error) throw error;
  return mapMenuItem(data);
};

export const deleteMenuItem = async (itemId: string): Promise<void> => {
  const { error } = await supabase
    .from('menu_items')
    .delete()
    .eq('id', itemId);

  if (error) throw error;
};

export const updateVenueMenu = async (venueId: string, menu: MenuItem[]): Promise<void> => {
  // Get current menu items (including unavailable ones for comparison)
  const currentItems = await getMenuItemsForVendor(venueId, true);
  const currentIds = new Set(currentItems.map(i => i.id));
  const newIds = new Set(menu.map(i => i.id));

  // Delete items not in new menu
  for (const item of currentItems) {
    if (!newIds.has(item.id)) {
      await deleteMenuItem(item.id);
    }
  }

  // Create or update items
  for (const item of menu) {
    if (item.id.startsWith('new-') || item.id.startsWith('temp-') || !currentIds.has(item.id)) {
      // Create new item (remove the temp id)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id: _id, ...itemData } = item;
      await createMenuItem(venueId, itemData);
    } else {
      // Update existing item
      await updateMenuItem(item.id, item);
    }
  }
};

// ORDERS

export const createOrder = async (orderData: {
  venueId: string;
  tableNumber?: string;
  tablePublicCode?: string;
  items: Array<{ item: MenuItem; quantity: number; selectedOptions?: string[] }>;
  totalAmount?: number; // Ignored - computed server-side
  notes?: string;
}): Promise<Order> => {
  // SECURE: Use Edge Function with server-side validation
  // Never allow direct client inserts - security critical!

  if (!orderData.tablePublicCode && !orderData.tableNumber) {
    throw new Error('Either tablePublicCode or tableNumber is required');
  }

  // Transform frontend cart format to Edge Function input format
  const edgeFunctionInput = {
    vendor_id: orderData.venueId, // Frontend uses venueId, backend uses vendor_id
    table_public_code: orderData.tablePublicCode || orderData.tableNumber || '',
    items: orderData.items.map(cartItem => ({
      menu_item_id: cartItem.item.id,
      qty: cartItem.quantity,
      modifiers_json: cartItem.selectedOptions || null
    })),
    notes: orderData.notes || undefined
  };

  const { data, error } = await supabase.functions.invoke('order_create', {
    body: edgeFunctionInput
  });

  if (error) {
    console.error('Order creation failed:', error);
    throw new Error(error.message || 'Failed to create order. Please try again.');
  }

  // Transform Edge Function response to frontend Order format
  const orderResponse = data.order;
  const orderItems = data.order.items || [];

  // Helper to map database status to frontend enum
  const mapOrderStatus = (dbStatus: string): OrderStatus => {
    return toOrderStatus(dbStatus);
  };

  const mapPaymentStatus = (dbStatus: string): PaymentStatus => {
    const upper = dbStatus.toUpperCase();
    return upper === 'PAID' ? PaymentStatus.PAID : PaymentStatus.UNPAID;
  };

  // Map order items back to frontend format (we need to fetch menu items for full details)
  // For now, use snapshot data from order_items
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Edge function response
  const mappedItems = orderItems.map((oi: any) => ({
    item: {
      id: '', // Snapshot doesn't include menu_item_id, but we have name/price
      name: oi.name_snapshot,
      description: '',
      price: parseFloat(oi.price_snapshot),
      category: '',
      available: true
    },
    quantity: oi.qty,
    selectedOptions: oi.modifiers_json || []
  }));

  return {
    id: orderResponse.id,
    venueId: orderResponse.vendor_id,
    tableNumber: orderData.tableNumber || orderData.tablePublicCode || '',
    orderCode: orderResponse.order_code,
    items: mappedItems,
    totalAmount: parseFloat(orderResponse.total_amount),
    currency: orderResponse.currency || 'EUR',
    status: mapOrderStatus(orderResponse.status),
    paymentStatus: mapPaymentStatus(orderResponse.payment_status),
    timestamp: new Date(orderResponse.created_at).getTime(),
    customerNote: orderResponse.notes || undefined
  };
};

// Get single order by ID (for client order status page)
export const getOrderById = async (orderId: string): Promise<Order | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (
        id,
        name_snapshot,
        price_snapshot,
        qty,
        modifiers_json
      )
    `)
    .eq('id', orderId)
    .eq('client_auth_user_id', user.id) // RLS ensures user can only see their own orders
    .single();

  if (error || !data) {
    console.error('Error fetching order:', error);
    return null;
  }

  // Map order items
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase query result
  const items = (data.order_items || []).map((item: any) => ({
    id: item.id,
    name: item.name_snapshot,
    price: Number(item.price_snapshot),
    quantity: item.qty,
    selectedOptions: item.modifiers_json || []
  }));

  // Get table number if table_id exists
  let tableNumber = '';
  if (data.table_id) {
    const { data: tableData } = await supabase
      .from('tables')
      .select('table_number, label')
      .eq('id', data.table_id)
      .single();
    tableNumber = tableData?.table_number?.toString() || tableData?.label || '';
  }

  return {
    id: data.id,
    venueId: data.vendor_id,
    tableNumber,
    orderCode: data.order_code,
    items,
    totalAmount: Number(data.total_amount),
    currency: data.currency || 'EUR',
    status: toOrderStatus(data.status),
    paymentStatus: toPaymentStatus(data.payment_status),
    timestamp: new Date(data.created_at).getTime(),
    customerNote: data.notes || undefined,
    createdAt: data.created_at
  };
};

export const getOrdersForVenue = async (venueId: string): Promise<Order[]> => {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      table:tables (table_number, label, public_code),
      order_items (
        id,
        name_snapshot,
        price_snapshot,
        qty,
        modifiers_json
      )
    `)
    .eq('vendor_id', venueId)
    .order('created_at', { ascending: false });

  if (error) handleSupabaseError(error, 'getOrdersForVenue');

  // Map orders and include order items
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase query result
  const orders = (data || []).map((row: any) => {
    const order = mapOrder(row);
    // Map order_items to order.items format
    if (row.order_items && Array.isArray(row.order_items)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      order.items = row.order_items.map((oi: any) => ({
        item: {
          id: oi.id || '',
          name: oi.name_snapshot || '',
          description: '',
          price: parseFloat(oi.price_snapshot || 0),
          category: '',
          available: true,
        },
        quantity: oi.qty || 1,
        selectedOptions: oi.modifiers_json ? (Array.isArray(oi.modifiers_json) ? oi.modifiers_json : []) : undefined,
      }));
    }
    return order;
  });

  return orders;
};

export const getAllOrders = async (): Promise<Order[]> => {
  const { data, error } = await supabase
    .from('orders')
    .select('*, table:tables (table_number, label, public_code)');
  if (error) handleSupabaseError(error, 'getAllOrders');
  return (data || []).map(mapOrder);
}

export const updateOrderStatus = async (orderId: string, status: OrderStatus): Promise<void> => {
  // Map enum values to database values
  const statusMap: Record<OrderStatus, string> = {
    [OrderStatus.NEW]: 'new',
    [OrderStatus.PREPARING]: 'preparing',
    [OrderStatus.READY]: 'ready',
    [OrderStatus.COMPLETED]: 'completed',
    [OrderStatus.CANCELLED]: 'cancelled',
    // Legacy mappings
    [OrderStatus.RECEIVED]: 'new',
    [OrderStatus.SERVED]: 'completed'
  };

  const dbStatus = statusMap[status] || status.toLowerCase();

  const { error } = await supabase.functions.invoke('order_update_status', {
    body: {
      order_id: orderId,
      status: dbStatus
    }
  });

  if (error) {
    throw new Error(error.message || 'Failed to update order status');
  }
};

export const updatePaymentStatus = async (orderId: string, status: PaymentStatus): Promise<void> => {
  // Use Edge Function for payment status updates (vendor confirmation)
  if (status !== PaymentStatus.PAID) {
    throw new Error('Can only mark orders as paid');
  }

  const { error } = await supabase.functions.invoke('order_mark_paid', {
    body: {
      order_id: orderId
    }
  });

  if (error) {
    throw new Error(error.message || 'Failed to update payment status');
  }
};

// ADMIN

export const adminSetVendorStatus = async (vendorId: string, status: 'active' | 'suspended') => {
  const { error } = await supabase.functions.invoke('business-logic', {
    body: { action: 'admin-update-status', payload: { venueId: vendorId, status } }
  });
  if (error) throw error;
};

// TABLES

export const getTablesForVenue = async (venueId: string): Promise<Table[]> => {
  const { data, error } = await supabase
    .from('tables')
    .select('id, vendor_id, table_number, label, public_code, is_active')
    .eq('vendor_id', venueId);
  if (error) handleSupabaseError(error, 'getTables');
  return (data || []).map(mapTable);
};

export const createTablesBatch = async (venueId: string, count: number, startNum: number): Promise<Table[]> => {
  // Use secure Edge Function for table generation with proper public_code creation
  const { data, error } = await supabase.functions.invoke('tables_generate', {
    body: {
      vendor_id: venueId, // Frontend uses venueId, backend uses vendor_id
      count: count,
      start_number: startNum
    }
  });

  if (error) {
    throw new Error(error.message || 'Failed to create tables');
  }

  // Map response tables to frontend Table format
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Edge function response
  return (data.tables || []).map((t: any) => ({
    id: t.id,
    venueId: t.vendor_id,
    label: t.label,
    code: t.public_code,
    active: t.is_active
  }));
};

export const deleteTable = async (tableId: string): Promise<void> => {
  const { error } = await supabase.from('tables').delete().eq('id', tableId);
  if (error) throw error;
};

export const updateTableStatus = async (tableId: string, active: boolean): Promise<void> => {
  const { error } = await supabase.from('tables').update({ is_active: active }).eq('id', tableId);
  if (error) throw error;
};

export const regenerateTableCode = async (tableId: string): Promise<void> => {
  const suffix = Math.random().toString(36).substr(2, 6).toUpperCase();
  const { data } = await supabase.from('tables').select('public_code').eq('id', tableId).single();
  if (data) {
    const prefix = data.public_code.split('-')[0];
    const { error } = await supabase.from('tables').update({ public_code: `${prefix}-${suffix}` }).eq('id', tableId);
    if (error) throw error;
  }
};

// RESERVATIONS

export const createReservation = async (resData: {
  venueId: string;
  partySize: number;
  datetime: string; // ISO timestamp string
  note?: string;
}): Promise<Reservation> => {
  // Get authenticated user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    throw new Error('Must be authenticated to create reservation');
  }

  const dbRes = {
    vendor_id: resData.venueId, // DB uses vendor_id
    client_auth_user_id: user.id,
    party_size: resData.partySize,
    datetime: resData.datetime, // ISO timestamp string
    notes: resData.note || null, // DB uses 'notes'
    status: 'pending' // DB uses lowercase status
  };

  const { data, error } = await supabase
    .from('reservations')
    .insert(dbRes)
    .select()
    .single();

  if (error) throw error;
  return mapReservation(data);
};

export const getReservationsForVenue = async (venueId: string): Promise<Reservation[]> => {
  const { data, error } = await supabase
    .from('reservations')
    .select('*')
    .eq('vendor_id', venueId) // DB uses vendor_id
    .order('datetime', { ascending: true });

  if (error) handleSupabaseError(error, 'getReservationsForVenue');
  return (data || []).map(mapReservation);
};

export const updateReservationStatus = async (id: string, status: ReservationStatus): Promise<void> => {
  // Map frontend enum to DB status
  const dbStatus = mapReservationStatusToDb(status);

  const { error } = await supabase
    .from('reservations')
    .update({ status: dbStatus })
    .eq('id', id);

  if (error) throw error;
};

// USER PROFILES

export const getMyProfile = async (): Promise<User> => {
  const { data: { user } } = await supabase.auth.getUser();
  // Return guest structure if no user
  if (!user) return { id: 'guest', name: 'Guest', role: UserType.CLIENT, favorites: [], notificationsEnabled: true };

  const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single();

  if (error || !data) {
    // If profile doesn't exist (first time), create it
    const newP = { id: user.id, name: 'Guest', role: 'CLIENT' };
    const { error: insertError } = await supabase.from('profiles').insert(newP);
    if (insertError) console.error("Error creating profile", insertError);
    return mapUser(newP);
  }
  return mapUser(data);
};

export const updateMyProfile = async (updates: Partial<User>): Promise<User> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return updates as User; // Cannot update guest

  const dbUpdates: Record<string, unknown> = {};
  if (updates.name) dbUpdates.name = updates.name;
  if (updates.role) dbUpdates.role = updates.role;
  if (updates.favorites) dbUpdates.favorites = updates.favorites;
  if (updates.notificationsEnabled !== undefined) dbUpdates.notifications_enabled = updates.notificationsEnabled;

  const { data, error } = await supabase.from('profiles').update(dbUpdates).eq('id', user.id).select().single();
  if (error) throw error;
  return mapUser(data);
};

export const toggleFavoriteVenue = async (venueId: string): Promise<string[]> => {
  const p = await getMyProfile();
  let favs = p.favorites || [];
  if (favs.includes(venueId)) favs = favs.filter(f => f !== venueId);
  else favs.push(venueId);
  await updateMyProfile({ favorites: favs });
  return favs;
};

// ADMIN & AUDIT

export const checkIsAdmin = async (email: string): Promise<boolean> => {
  const { data } = await supabase.from('admin_users').select('*').eq('email', email).eq('is_active', true).single();
  return !!data;
};

export const getAdminUsers = async (): Promise<AdminUser[]> => {
  const { data, error } = await supabase.from('admin_users').select('*');
  if (error) handleSupabaseError(error, 'getAdminUsers');
  return (data || []).map(r => ({ id: r.id, authUserId: r.auth_user_id, email: r.email, role: r.role, isActive: r.is_active, createdAt: new Date(r.created_at).getTime() }));
};

export const getAuditLogs = async (): Promise<AuditLog[]> => {
  const { data, error } = await supabase.from('audit_logs').select('*').order('created_at', { ascending: false });
  if (error) handleSupabaseError(error, 'getAuditLogs');
  return (data || []).map(r => ({ id: r.id, actorId: r.actor_auth_user_id, action: r.action, entityType: r.entity_type, entityId: r.entity_id, metadata: r.metadata_json, createdAt: new Date(r.created_at).getTime() }));
};

export const getAllUsers = async (): Promise<User[]> => {
  const { data, error } = await supabase.from('profiles').select('*');
  if (error) handleSupabaseError(error, 'getAllUsers');
  return (data || []).map(mapUser);
};
