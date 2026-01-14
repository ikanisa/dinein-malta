import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { GlassCard } from '../components/GlassCard';
import { MenuListSkeleton } from '../components/Loading';
import { OptimizedImage } from '../components/OptimizedImage';
import { ErrorState } from '../components/common/ErrorState';
import { getVenueBySlugOrId, getOrdersForVenue, toOrderStatus, toPaymentStatus } from '../services/databaseService';
import { Venue, Order, OrderStatus } from '../types';
import { useCart } from '../context/CartContext';
import { supabase } from '../services/supabase';

const ClientMenu = () => {
  const { venueId, tableCode } = useParams();
  const navigate = useNavigate();
  const { cart, addToCart, removeFromCart, clearCart, totalAmount, totalItems } = useCart();

  const [venue, setVenue] = useState<Venue | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [myOrders, setMyOrders] = useState<Order[]>([]);

  // Review Modal State
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [manualTableRef, setManualTableRef] = useState(tableCode || '');
  const [tableError, setTableError] = useState(false);

  // Refs
  const categoryScrollRef = useRef<HTMLDivElement>(null);
  const tableInputRef = useRef<HTMLInputElement>(null);

  const loadMyOrders = async (vendorId?: string) => {
    const stored = localStorage.getItem('my_orders_ids');
    if (!stored || !vendorId) return;
    try {
      const ids = JSON.parse(stored);
      if (!Array.isArray(ids) || ids.length === 0) return;
      const allVenueOrders = await getOrdersForVenue(vendorId);
      const mines = allVenueOrders.filter(o => ids.includes(o.id));
      setMyOrders(mines.sort((a, b) => b.timestamp - a.timestamp));
    } catch (error) {
      console.warn('Failed to load order history', error);
    }
  };

  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!venueId) return;
    let active = true;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const v = await getVenueBySlugOrId(venueId);
        if (!active) return;

        if (!v) {
          throw new Error('Venue not found');
        }

        setVenue(v);
        try {
          localStorage.setItem('last_venue_id', v.id);
        } catch (error) {
          console.warn('Failed to persist last venue', error);
        }
        await loadMyOrders(v.id);
      } catch (err) {
        if (!active) return;
        console.error('Failed to load venue:', err);
        setError(err instanceof Error ? err : new Error('Failed to load venue'));
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => { active = false; };
  }, [venueId]);

  useEffect(() => {
    if (tableCode) setManualTableRef(tableCode);
  }, [tableCode]);

  // Realtime subscription for current order status
  useEffect(() => {
    if (!currentOrder) return;

    const channel = supabase
      .channel(`order-${currentOrder.id}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'orders', filter: `id=eq.${currentOrder.id}` },
        async (payload) => {
          setCurrentOrder(prev => prev ? {
            ...prev,
            status: toOrderStatus(payload.new.status),
            paymentStatus: toPaymentStatus(payload.new.payment_status),
          } : null);
          // Refresh history list too
          await loadMyOrders(venue?.id);

          // Update badge when order status changes
          const { setBadge } = await import('../services/badgeAPI');
          const stored = localStorage.getItem('my_orders_ids');
          if (stored) {
            const ids = JSON.parse(stored);
            await setBadge(ids.length);
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [currentOrder?.id, venue?.id]);


  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (loading) {
    return (
      <div className="pb-32 animate-fade-in pt-safe-top">
        <div className="h-64 relative bg-gray-900 animate-pulse" />
        <div className="p-4 space-y-4">
          <MenuListSkeleton />
        </div>
      </div>
    );
  }

  if (error || !venue) {
    return (
      <div className="min-h-screen pt-safe-top flex flex-col items-center justify-center p-6">
        <ErrorState
          error={error || new Error("This venue could not be found. It may have been removed or is temporarily unavailable.")}
          onRetry={() => window.location.reload()}
          className="w-full max-w-md"
        />
        <button
          onClick={() => navigate(-1)}
          className="mt-6 px-6 py-3 bg-surface-highlight text-foreground font-medium rounded-xl border border-border hover:bg-surface transition-colors"
        >
          ← Go Back
        </button>
      </div>
    );
  }

  const availableItems = venue.menu.filter(i => i.available !== false);
  const categories = ['All', ...Array.from(new Set(availableItems.map(i => i.category)))];
  const filteredItems = activeCategory === 'All'
    ? availableItems
    : availableItems.filter(i => i.category === activeCategory);

  // Determine payment availability dynamically from venue data
  const getPaymentProvider = () => {
    if (venue.revolutHandle) {
      return {
        name: 'Revolut Pay',
        color: 'bg-secondary-500 shadow-secondary-500/30',
        icon: 'R',
        linkPrefix: 'https://revolut.me/',
        handle: venue.revolutHandle
      };
    }
    return null;
  };

  const paymentProvider = getPaymentProvider();

  const validateAndProceed = (method: 'digital' | 'cash') => {
    if (!manualTableRef.trim()) {
      setTableError(true);
      // Auto-focus the input if invalid
      if (tableInputRef.current) {
        tableInputRef.current.focus();
        tableInputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }
    setTableError(false);
    setIsReviewOpen(false);
    handlePlaceOrder(method);
  };

  const handlePlaceOrder = async (method: 'digital' | 'cash') => {
    if (cart.length === 0) return;

    try {
      // Use offline-aware order creation
      const { createOrderWithOfflineSupport } = await import('../services/orderService');
      const newOrder = await createOrderWithOfflineSupport({
        venueId: venue.id,
        tablePublicCode: tableCode || manualTableRef.trim(),
        tableNumber: manualTableRef.trim(),
        items: cart,
        totalAmount,
      });

      const isQueued = Boolean((newOrder as any)._isQueued);
      if (isQueued) {
        const { toast } = await import('react-hot-toast');
        toast.success('Order queued - will be sent when online', { duration: 4000 });
        clearCart();
        return;
      }

      const stored = localStorage.getItem('my_orders_ids');
      const ids = stored ? JSON.parse(stored) : [];
      ids.push(newOrder.id);
      localStorage.setItem('my_orders_ids', JSON.stringify(ids));

      setCurrentOrder(newOrder);
      await loadMyOrders(venue.id);

      // Navigate to order status page
      navigate(`/order/${newOrder.id}`);

      // Update badge and track analytics
      const { setBadge } = await import('../services/badgeAPI');
      const { trackOrderPlaced } = await import('../services/analytics');
      await setBadge(ids.length);
      trackOrderPlaced(newOrder.id, venue.id, totalAmount);

      if (method === 'digital') {
        setShowPaymentModal(true);
      } else {
        clearCart();
      }
    } catch (e) {
      const { toast } = await import('react-hot-toast');
      toast.error("Could not place order. Please check your connection.");
      console.error('Order creation error:', e);
    }
  };

  // Payment Modal (Full Screen Overlay)
  if (showPaymentModal && currentOrder && paymentProvider) {
    const paymentUrl = `${paymentProvider.linkPrefix}${paymentProvider.handle}`;

    return (
      <div className="fixed inset-0 z-[100] bg-black/90 flex flex-col items-center justify-center p-6 animate-fade-in backdrop-blur-xl">
        <GlassCard className="w-full max-w-md bg-surface border border-border p-6 rounded-3xl">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-foreground">Pay Bill</h2>
            <button onClick={() => setShowPaymentModal(false)} className="w-8 h-8 rounded-full bg-surface-highlight flex items-center justify-center text-foreground">✕</button>
          </div>

          <div className="text-center mb-8">
            <div className="text-sm text-muted uppercase tracking-widest mb-2">Total Amount</div>
            <div className="text-5xl font-bold text-foreground font-mono tracking-tighter">€{currentOrder.totalAmount.toFixed(2)}</div>
          </div>

          <div className="space-y-4 mb-8">
            <div className="bg-surface-highlight p-4 rounded-xl flex justify-between items-center">
              <div>
                <div className="text-xs text-muted">Payment Reference</div>
                <div className="text-xl font-mono font-bold text-accent-500">{currentOrder.orderCode}</div>
              </div>
              <button
                onClick={() => copyToClipboard(currentOrder.orderCode)}
                className="px-3 py-1 bg-accent-500/15 text-accent-500 text-xs font-bold rounded border border-accent-500/30"
              >
                Copy
              </button>
            </div>
            <p className="text-xs text-center text-muted">Please include the reference code.</p>
          </div>

          <a
            href={paymentUrl}
            target="_blank"
            rel="noreferrer"
            onClick={() => { clearCart(); }}
            className={`block w-full py-4 text-center text-white font-bold rounded-2xl shadow-lg mb-3 active:scale-95 transition-transform ${paymentProvider.color}`}
          >
            Open {paymentProvider.name}
          </a>

          <button
            onClick={() => { setShowPaymentModal(false); clearCart(); }}
            className="block w-full py-4 text-center bg-surface-highlight text-foreground font-bold rounded-2xl active:scale-95 transition-transform"
          >
            I&rsquo;ve Paid
          </button>
        </GlassCard>
      </div>
    );
  }

  // Success View with Status
  if (currentOrder && !showPaymentModal) {
    return (
      <div className="fixed inset-0 z-[100] bg-background flex flex-col items-center justify-center p-6 animate-fade-in text-center">
        <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mb-6 animate-bounce">
          <span className="text-4xl">👨‍🍳</span>
        </div>
        <h2 className="text-3xl font-bold mb-2 text-foreground">
          {currentOrder.status === OrderStatus.SERVED ? 'Order Served!' : 'Order Sent!'}
        </h2>
        <p className="text-muted mb-8 max-w-xs mx-auto">
          {currentOrder.status === OrderStatus.SERVED ? 'Enjoy your meal.' : 'The kitchen has received your order. Sit tight.'}
        </p>

        {currentOrder.status !== OrderStatus.SERVED && (
          <div className="mb-8 flex flex-col items-center gap-2">
            <div className="animate-pulse bg-secondary-500/15 text-secondary-600 px-4 py-1 rounded-full text-xs font-bold border border-secondary-500/30">
              STATUS: {currentOrder.status}
            </div>
          </div>
        )}

        <div className="bg-surface-highlight px-8 py-4 rounded-2xl mb-8">
          <div className="text-xs text-muted uppercase tracking-widest mb-1">Your Code</div>
          <div className="text-4xl font-mono font-bold text-secondary-600">{currentOrder.orderCode}</div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={async () => {
              const { shareOrder } = await import('../services/shareAPI');
              await shareOrder(currentOrder.orderCode, venue.name);
            }}
            className="px-6 py-3 bg-surface-highlight text-foreground font-bold rounded-full border border-border active:scale-95 transition-transform"
            aria-label="Share order"
          >
            🔗 Share
          </button>
          <button
            onClick={() => setCurrentOrder(null)}
            className="px-8 py-3 bg-foreground text-background font-bold rounded-full shadow-lg active:scale-95 transition-transform"
            aria-label="Order more items"
          >
            Order More
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-32 bg-background relative transition-colors duration-500">

      {/* Parallax Header */}
      <div className="h-[40vh] relative w-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80 z-10" />
        <OptimizedImage
          src={venue.imageUrl || `https://picsum.photos/800/800?grayscale`}
          alt={`${venue.name} cover`}
          aspectRatio="16/9"
          className="w-full h-full"
          priority
        />

        <div className="absolute top-safe px-4 py-2 z-20 w-full flex justify-between items-start">
          <button onClick={() => navigate('/')} className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white border border-white/10 active:scale-90 transition">
            ⬅
          </button>
          {myOrders.length > 0 && (
            <button className="px-3 py-1.5 bg-black/40 backdrop-blur-md rounded-full text-xs font-bold border border-white/10 text-white">
              {myOrders.length} Orders
            </button>
          )}
        </div>

        <div className="absolute bottom-0 left-0 w-full p-6 z-20">
          <h1 className="text-4xl font-bold text-white mb-2 leading-tight">{venue.name}</h1>
          <div className="flex flex-wrap gap-2 text-sm text-gray-200">
            <span>{venue.description}</span>
          </div>
          {venue.tags && venue.tags.length > 0 && (
            <div className="flex gap-2 mt-2 overflow-x-auto no-scrollbar">
              {venue.tags.map(t => (
                <span key={t} className="text-[10px] bg-secondary-500/30 backdrop-blur-sm text-white/90 px-2 py-0.5 rounded border border-secondary-500/30 whitespace-nowrap">
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Sticky Category Bar */}
      <div className="sticky top-0 z-30 bg-glass backdrop-blur-xl border-b border-glassBorder py-3">
        <div
          ref={categoryScrollRef}
          className="flex px-4 gap-3 overflow-x-auto no-scrollbar scroll-smooth"
        >
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all flex-shrink-0 ${activeCategory === cat
                ? 'bg-foreground text-background scale-105'
                : 'bg-surface-highlight text-muted hover:bg-black/10'
                }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Menu Grid */}
      <div className="p-4 space-y-4">
        {filteredItems.map(item => (
          <GlassCard key={item.id} className="flex gap-4 p-0 overflow-hidden bg-surface border-0 shadow-sm">
            <div className="w-28 h-28 bg-surface-highlight relative flex-shrink-0">
              <OptimizedImage
                src={item.imageUrl || `https://via.placeholder.com/150?text=${encodeURIComponent(item.name)}`}
                alt={item.name}
                aspectRatio="1/1"
                className="w-full h-full"
              />
            </div>
            <div className="flex-1 py-3 pr-3 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-base leading-tight mb-1 text-foreground">{item.name}</h3>
                </div>
                <p className="text-xs text-muted line-clamp-2 leading-relaxed">{item.description}</p>
              </div>

              <div className="flex justify-between items-end mt-2">
                <span className="font-bold text-lg text-foreground">€{item.price.toFixed(2)}</span>
                <button
                  onClick={() => addToCart(item)}
                  className="w-8 h-8 rounded-full bg-foreground text-background flex items-center justify-center font-bold text-lg active:scale-90 transition-transform shadow-lg"
                >
                  +
                </button>
              </div>
            </div>
          </GlassCard>
        ))}
        {filteredItems.length === 0 && (
          <div className="animate-fade-in">
            <React.Suspense fallback={<div className="py-10 text-center text-muted">Loading...</div>}>
              {(() => {
                const EmptyState = React.lazy(() => import('../components/ui/EmptyState'));
                return (
                  <EmptyState
                    icon="🍽️"
                    title="No items here"
                    description={`No items in the "${activeCategory}" category yet.`}
                    size="sm"
                  />
                );
              })()}
            </React.Suspense>
          </div>
        )}
      </div>

      {/* Floating Summary Bar */}
      {cart.length > 0 && !isReviewOpen && !showPaymentModal && !currentOrder && (
        <div className="fixed bottom-6 left-4 right-4 z-[60] animate-slide-up">
          <GlassCard
            onClick={() => setIsReviewOpen(true)}
            className="flex justify-between items-center bg-surface border border-border shadow-2xl p-4 cursor-pointer active:scale-95 transition-transform"
          >
            <div className="flex items-center gap-3">
              <div className="bg-foreground text-background font-bold w-10 h-10 rounded-full flex items-center justify-center shadow-lg">
                {totalItems}
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-muted font-bold uppercase tracking-wider">Total</span>
                <span className="font-bold text-xl text-foreground">€{totalAmount.toFixed(2)}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 font-bold text-sm text-secondary-600">
              View Order <span className="text-xl">→</span>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Order Review Modal */}
      {isReviewOpen && (
        <div className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm flex flex-col justify-end animate-fade-in" onClick={() => setIsReviewOpen(false)}>
          <div
            className="bg-surface rounded-t-3xl border-t border-border p-6 pb-safe-bottom w-full max-h-[85vh] overflow-y-auto animate-slide-up relative shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            {/* Handle bar */}
            <div className="w-12 h-1.5 bg-surface-highlight rounded-full mx-auto mb-6" />

            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-foreground">Your Order</h2>
              <button onClick={() => setIsReviewOpen(false)} className="w-8 h-8 rounded-full bg-surface-highlight flex items-center justify-center text-muted">✕</button>
            </div>

            {/* Table Reference Input */}
            <div className="mb-6 bg-surface-highlight p-4 rounded-xl border border-border">
              <label className="text-xs text-muted font-bold uppercase tracking-wider mb-2 block">Table Number or Code (Required)</label>
              <input
                ref={tableInputRef}
                type="text"
                value={manualTableRef}
                onChange={(e) => {
                  setManualTableRef(e.target.value);
                  if (e.target.value.trim()) setTableError(false);
                }}
                placeholder="e.g. 12 or TBL-ABCD"
                className={`w-full bg-background border p-3 rounded-lg text-foreground font-bold text-lg outline-none transition-colors ${tableError ? 'border-red-500 animate-pulse' : 'border-border focus:border-secondary-500'}`}
              />
              {tableError && (
                <p className="text-red-400 text-xs mt-2 font-bold animate-pulse">Please enter your table number or code to proceed.</p>
              )}
            </div>

            <div className="space-y-3 mb-8">
              {cart.map((line, idx) => (
                <div key={idx} className="flex justify-between items-center bg-surface-highlight p-3 rounded-xl border border-border">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 bg-background rounded-lg p-1 border border-border">
                      <button onClick={() => removeFromCart(line.item.id)} className="w-8 h-8 flex items-center justify-center text-muted hover:text-foreground font-bold active:scale-90 transition">-</button>
                      <span className="font-bold w-6 text-center text-sm text-foreground">{line.quantity}</span>
                      <button onClick={() => addToCart(line.item)} className="w-8 h-8 flex items-center justify-center text-foreground font-bold active:scale-90 transition">+</button>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-sm truncate pr-2 text-foreground">{line.item.name}</div>
                      <div className="text-xs text-muted">€{line.item.price.toFixed(2)}</div>
                    </div>
                  </div>
                  <div className="font-bold text-foreground">€{(line.item.price * line.quantity).toFixed(2)}</div>
                </div>
              ))}
            </div>

            <div className="border-t border-border pt-4 mb-6 space-y-2">
              <div className="flex justify-between text-muted text-sm">
                <span>Subtotal</span>
                <span>€{totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-2xl font-bold text-foreground">
                <span>Total</span>
                <span>€{totalAmount.toFixed(2)}</span>
              </div>
            </div>

            <h3 className="font-bold text-muted text-xs uppercase tracking-wider mb-3">Confirm & Pay</h3>
            <div className="grid grid-cols-2 gap-3 pb-6">
              <button
                onClick={() => validateAndProceed('cash')}
                className={`py-4 rounded-xl border border-border font-bold transition flex items-center justify-center gap-2 bg-surface-highlight text-muted hover:bg-black/10 active:scale-95 ${!manualTableRef.trim() ? 'opacity-70' : ''}`}
              >
                💶 Cash
              </button>
              <button
                onClick={() => validateAndProceed('digital')}
                disabled={!paymentProvider}
                className={`py-4 rounded-xl font-bold shadow-lg transition flex items-center justify-center gap-2 ${paymentProvider ? paymentProvider.color + ' text-white' : 'bg-gray-500/20 text-gray-500 cursor-not-allowed'} active:scale-95 ${!manualTableRef.trim() ? 'opacity-70' : ''}`}
              >
                {paymentProvider ? <>{paymentProvider.icon} {paymentProvider.name}</> : 'No Digital Pay'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientMenu;
