import { supabase } from './supabase';

// Types
export interface Order {
  id: string;
  venue_id: string;
  table_number?: string;
  order_code: string;
  total_amount: number;
  status: 'received' | 'served' | 'cancelled';
  payment_status: 'unpaid' | 'paid';
  created_at: string;
  items?: any[];
  customer_note?: string;
}

export interface MenuItem {
  id: string;
  vendor_id: string;
  name: string;
  description?: string;
  price: number;
  category: string;
  image_url?: string;
  is_available: boolean;
  options?: any[];
  tags?: string[];
}

export interface Table {
  id: string;
  vendor_id: string;
  label: string;
  code: string;
  is_active: boolean;
}

export interface Venue {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  website?: string;
  status: string;
}

// Database functions
export async function getVenueByOwner(authUserId: string): Promise<Venue | null> {
  const { data: vendorUser } = await supabase
    .from('vendor_users')
    .select('vendor_id')
    .eq('auth_user_id', authUserId)
    .single();

  if (!vendorUser) return null;

  const { data: venue } = await supabase
    .from('vendors')
    .select('*')
    .eq('id', vendorUser.vendor_id)
    .single();

  return venue;
}

export async function getOrdersForVenue(venueId: string): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('venue_id', venueId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function updateOrderStatus(orderId: string, status: 'received' | 'served' | 'cancelled'): Promise<void> {
  const { error } = await supabase.functions.invoke('order_update_status', {
    body: { order_id: orderId, status }
  });
  if (error) throw error;
}

export async function updatePaymentStatus(orderId: string): Promise<void> {
  const { error } = await supabase.functions.invoke('order_mark_paid', {
    body: { order_id: orderId }
  });
  if (error) throw error;
}

export async function getMenuItems(venueId: string): Promise<MenuItem[]> {
  const { data, error } = await supabase
    .from('menu_items')
    .select('*')
    .eq('vendor_id', venueId)
    .order('category', { ascending: true })
    .order('name', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function createMenuItem(item: Omit<MenuItem, 'id' | 'vendor_id'> & { vendor_id: string }): Promise<MenuItem> {
  const { data, error } = await supabase
    .from('menu_items')
    .insert({
      vendor_id: item.vendor_id,
      name: item.name,
      description: item.description,
      price: item.price,
      category: item.category,
      image_url: item.image_url,
      is_available: item.is_available ?? true,
      options: item.options || [],
      tags: item.tags || []
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateMenuItem(itemId: string, updates: Partial<Omit<MenuItem, 'id' | 'vendor_id'>>): Promise<void> {
  const { error } = await supabase
    .from('menu_items')
    .update(updates)
    .eq('id', itemId);

  if (error) throw error;
}

export async function deleteMenuItem(itemId: string): Promise<void> {
  const { error } = await supabase
    .from('menu_items')
    .delete()
    .eq('id', itemId);

  if (error) throw error;
}

export async function getTablesForVenue(venueId: string): Promise<Table[]> {
  const { data, error } = await supabase
    .from('tables')
    .select('*')
    .eq('vendor_id', venueId)
    .order('label', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function createTablesBatch(venueId: string, count: number, startNum: number): Promise<Table[]> {
  const { data, error } = await supabase.functions.invoke('tables_generate', {
    body: { vendor_id: venueId, count, start_label: startNum }
  });

  if (error) throw error;
  return data.tables || [];
}

export async function updateTableStatus(tableId: string, isActive: boolean): Promise<void> {
  const { error } = await supabase
    .from('tables')
    .update({ is_active: isActive })
    .eq('id', tableId);

  if (error) throw error;
}

// Helper to call vendor_claim edge function (for onboarding)
export async function createVenue(vendorData: {
  google_place_id: string;
  name: string;
  slug?: string;
  address?: string;
  lat?: number;
  lng?: number;
  hours_json?: any;
  photos_json?: any;
  website?: string;
  phone?: string;
  revolut_link?: string;
  whatsapp?: string;
}): Promise<any> {
  const { data, error } = await supabase.functions.invoke('vendor_claim', {
    body: vendorData
  });

  if (error) throw error;
  return data;
}

export async function deleteTable(tableId: string): Promise<void> {
  const { error } = await supabase
    .from('tables')
    .delete()
    .eq('id', tableId);

  if (error) throw error;
}

export async function regenerateTableCode(tableId: string): Promise<void> {
  // Get current table
  const { data: table } = await supabase
    .from('tables')
    .select('code')
    .eq('id', tableId)
    .single();

  if (!table) throw new Error('Table not found');

  // Generate new code
  const suffix = Math.random().toString(36).substr(2, 6).toUpperCase();
  const prefix = table.code.split('-')[0];
  const newCode = `${prefix}-${suffix}`;

  const { error } = await supabase
    .from('tables')
    .update({ code: newCode })
    .eq('id', tableId);

  if (error) throw error;
}

