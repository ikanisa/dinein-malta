import { supabase } from './supabase';

export interface Venue {
  id: string;
  name: string;
  address?: string;
  status: string;
  phone?: string;
}

export interface Order {
  id: string;
  order_code: string;
  venue_id: string;
  total_amount: number;
  status: string;
  payment_status: string;
  created_at: string;
}

export async function getAllVenues(): Promise<Venue[]> {
  const { data, error } = await supabase
    .from('vendors')
    .select('id, name, address, status, phone')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getAllOrders(): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function adminSetVendorStatus(vendorId: string, status: 'active' | 'suspended'): Promise<void> {
  const { error } = await supabase
    .from('vendors')
    .update({ status })
    .eq('id', vendorId);

  if (error) throw error;
}



