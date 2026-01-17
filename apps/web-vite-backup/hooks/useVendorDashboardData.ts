/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import QRCode from 'qrcode';
import {
  getOrdersForVenue,
  getReservationsForVenue,
  getTablesForVenue,
  getVenueByOwner,
  toOrderStatus,
  toPaymentStatus,
} from '../services/databaseService';
import { supabase } from '../services/supabase';
import { Order, Reservation, Table, Venue } from '../types';

interface UseVendorDashboardDataOptions {
  tab: string;
}

interface VendorDashboardData {
  venue: Venue | null;
  setVenue: React.Dispatch<React.SetStateAction<Venue | null>>;
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  tables: Table[];
  reservations: Reservation[];
  qrCodes: Record<string, string>;
  loading: boolean;
  refreshData: () => Promise<void>;
}

export const useVendorDashboardData = ({ tab }: UseVendorDashboardDataOptions): VendorDashboardData => {
  const navigate = useNavigate();
  const [venueId, setVenueId] = useState<string | null>(null);
  const [venue, setVenue] = useState<Venue | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [qrCodes, setQrCodes] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserVenue = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/vendor-login');
        return;
      }

      const myVenue = await getVenueByOwner(user.id);

      if (myVenue) {
        setVenueId(myVenue.id);
      } else {
        toast('No venue found linked to your account.', { icon: '🏪' });
        navigate('/vendor-onboarding');
      }
    };

    fetchUserVenue();
  }, [navigate]);

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const refreshData = useCallback(async () => {
    if (!venueId) return;
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const v = await getVenueByOwner(user.id);
        if (v) {
          setVenue(v);
        }
      }

      if (tab === 'orders') {
        const o = await getOrdersForVenue(venueId);
        setOrders(o.sort((a, b) => b.timestamp - a.timestamp));
        // Also load tables for orders tab (needed for order display)
        const t = await getTablesForVenue(venueId);
        setTables(t);
      } else if (tab === 'tables' || tab === 'live') {
        // Always load tables for live dashboard
        const t = await getTablesForVenue(venueId);
        setTables(t);
      } else if (tab === 'reservations') {
        const r = await getReservationsForVenue(venueId);
        setReservations(r.sort((a, b) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime()));
      }
    } finally {
      setLoading(false);
    }
  }, [tab, venueId]);

  useEffect(() => {
    if (venueId) {
      refreshData();
    }
  }, [venueId, refreshData]);

  const resolveTableLabel = useCallback((tableId?: string | null) => {
    if (!tableId) return '';
    const match = tables.find((t) => t.id === tableId);
    return match?.label || match?.code || '';
  }, [tables]);

  const mapRealtimeOrder = useCallback((row: any): Order => ({
    id: row.id,
    venueId: row.vendor_id,
    tableNumber: resolveTableLabel(row.table_id) || 'N/A',
    orderCode: row.order_code,
    items: [],
    totalAmount: Number(row.total_amount || 0),
    currency: row.currency || 'EUR',
    status: toOrderStatus(row.status),
    paymentStatus: toPaymentStatus(row.payment_status),
    timestamp: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
    customerNote: row.notes || undefined,
  }), [resolveTableLabel]);

  useEffect(() => {
    if (!venueId) return;
    const channel = supabase
      .channel('public:orders')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders', filter: `vendor_id=eq.${venueId}` },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newOrder = mapRealtimeOrder(payload.new);
            setOrders((prev) => [newOrder, ...prev]);

            if (document.visibilityState === 'hidden' && Notification.permission === 'granted') {
              try {
                const n = new Notification(`New Order: Table ${newOrder.tableNumber}`, {
                  body: `Total: €${newOrder.totalAmount.toFixed(2)}. Tap to view details.`,
                  icon: 'https://elhlcdiosomutugpneoc.supabase.co/storage/v1/object/public/assets/icon-192.png',
                  tag: `order-${newOrder.id}`,
                });
                n.onclick = () => {
                  window.focus();
                  n.close();
                };
              } catch (e) {
                console.error('Notification trigger failed', e);
              }
            }

            toast.success(`New Order! Table ${newOrder.tableNumber}`, { icon: '🔔' });
            if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
          } else if (payload.eventType === 'UPDATE') {
            const updatedOrder = mapRealtimeOrder(payload.new);
            setOrders((prev) =>
              prev.map((o) =>
                o.id === updatedOrder.id
                  ? { ...o, ...updatedOrder, tableNumber: updatedOrder.tableNumber || o.tableNumber }
                  : o
              )
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [venueId, mapRealtimeOrder]);

  useEffect(() => {
    if (tables.length > 0 && venueId) {
      tables.forEach(async (t) => {
        const url = `${window.location.origin}/#/v/${venueId}/t/${t.code}`;
        try {
          const data = await QRCode.toDataURL(url, {
            margin: 2,
            width: 300,
            color: { dark: '#000000', light: '#ffffff' },
          });
          setQrCodes((prev) => ({ ...prev, [t.id]: data }));
        } catch (e) {
          console.error('QR Gen Error', e);
        }
      });
    }
  }, [tables, venueId]);

  return {
    venue,
    setVenue,
    orders,
    setOrders,
    tables,
    reservations,
    qrCodes,
    loading,
    refreshData,
  };
};
