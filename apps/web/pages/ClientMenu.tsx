import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { GlassCard } from '../components/GlassCard';
import { MenuListSkeleton } from '../components/Loading';
import { OptimizedImage } from '../components/OptimizedImage';
import { ErrorState } from '../components/common/ErrorState';
import { CartBar } from '../components/menu/CartBar';
import { CartItem } from '../components/menu/CartItem';
import { BottomSheet } from '../components/ui/BottomSheet';
import { PullToRefresh } from '../components/PullToRefresh';
import { useMenu } from '../hooks/useMenu';
import { getOrdersForVenue, toOrderStatus, toPaymentStatus } from '../services/databaseService';
import { Order, OrderStatus } from '../types';
import { useCart } from '../context/CartContext';
import { supabase } from '../services/supabase';

const EmptyState = React.lazy(() => import('../components/ui/EmptyState'));

const ClientMenu = () => {
  const { venueId, tableCode } = useParams();
  const navigate = useNavigate();
  const { cart, addToCart, removeFromCart, clearCart, totalAmount, totalItems, toggleFavorite, isFavorite, favorites } = useCart();

  // Use optimized menu hook
  const { venue, menu: allMenuItems, categories, isLoading: menuLoading, error: menuError, refetch } = useMenu(venueId, tableCode);

  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
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

  // Load orders when venue is available
  useEffect(() => {
    if (venue?.id) {
      localStorage.setItem('last_venue_id', venue.id);
      loadMyOrders(venue.id);
    }
  }, [venue?.id]);

  useEffect(() => {
    if (tableCode) setManualTableRef(tableCode);
  }, [tableCode]);

  // Update active category when categories change
  useEffect(() => {
    if (categories.length > 0 && !categories.includes(activeCategory)) {
      setActiveCategory('All');
    }
  }, [categories]);

  // Realtime subscription for current order status
  useEffect(() => {
    if (!currentOrder || !venue?.id) return;

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
          await loadMyOrders(venue.id);

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

  if (menuLoading) {
    return (
      <main className="pb-32 animate-fade-in pt-safe-top" role="main" aria-label="Loading menu">
        {/* Hero skeleton with fixed aspect ratio to prevent CLS */}
        <div
          className="h-[40vh] relative bg-gray-900 animate-pulse"
          style={{ minHeight: '300px', aspectRatio: '16 / 9' }}
          aria-hidden="true"
        />
        <div className="p-4 space-y-4" aria-live="polite" aria-busy="true">
          <MenuListSkeleton />
        </div>
      </main>
    );
  }

  if (menuError || !venue) {
    return (
      <div className="min-h-screen pt-safe-top flex flex-col items-center justify-center p-6">
        <ErrorState
          error={menuError || new Error("This venue could not be found. It may have been removed or is temporarily unavailable.")}
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

  const availableItems = allMenuItems.filter(i => i.available !== false);

  // Apply filters: category and favorites
  let filteredItems = activeCategory === 'All'
    ? availableItems
    : availableItems.filter(i => i.category === activeCategory);

  if (showFavoritesOnly) {
    filteredItems = filteredItems.filter(item => isFavorite(item.id));
  }

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
      // Validate order input
      const { validateOrder, validateTableCode } = await import('../utils/validation');
      const tableValidation = validateTableCode(manualTableRef.trim());
      if (!tableValidation.valid) {
        const { toast } = await import('react-hot-toast');
        toast.error(tableValidation.error || 'Invalid table code');
        setTableError(true);
        return;
      }

      const orderInput = {
        vendor_id: venue.id,
        table_code: tableValidation.sanitized || manualTableRef.trim(),
        items: cart.map(item => ({
          menu_item_id: item.item.id,
          quantity: item.quantity,
          selectedOptions: item.options,
        })),
        total: totalAmount,
      };

      const validation = validateOrder(orderInput);
      if (!validation.success) {
        const { toast } = await import('react-hot-toast');
        const errorMessage = validation.error.issues[0]?.message || 'Invalid order data';
        toast.error(errorMessage);
        console.error('Order validation failed:', validation.error.issues);
        return;
      }

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
            <button onClick={() => setShowPaymentModal(false)} aria-label="Close payment modal" className="min-w-[48px] min-h-[48px] w-12 h-12 rounded-full bg-surface-highlight flex items-center justify-center text-foreground">✕</button>
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
    <PullToRefresh onRefresh={async () => { await refetch(); }} scrollContainerId="main-content">
      <main className="min-h-screen pb-32 bg-background relative transition-colors duration-500" role="main" aria-label="Menu">
        {/* ARIA live region for cart updates */}
        <div
          aria-live="polite"
          aria-atomic="true"
          className="sr-only"
          id="cart-announcements"
        >
          {totalItems > 0 && (
            <span>
              Cart updated: {totalItems} item{totalItems !== 1 ? 's' : ''} in cart, total €{totalAmount.toFixed(2)}
            </span>
          )}
        </div>

        {/* Parallax Header - Optimized for LCP */}
        <div className="h-[40vh] relative w-full overflow-hidden" style={{ minHeight: '300px', aspectRatio: '16 / 9' }}>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80 z-10" />
          <OptimizedImage
            src={venue.imageUrl || `https://picsum.photos/800/800?grayscale`}
            alt={`${venue.name} cover image`}
            aspectRatio="16/9"
            className="w-full h-full"
            priority
            width={800}
            height={450}
            sizes="100vw"
          />

          <div className="absolute top-safe-top px-4 py-2 z-50 w-full flex justify-between items-start pointer-events-none">
            <button
              onClick={() => navigate('/')}
              aria-label="Home"
              className="min-w-[48px] min-h-[48px] w-12 h-12 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white border border-white/10 active:scale-90 transition shadow-lg pointer-events-auto"
            >
              <span className="text-xl">🏠</span>
            </button>
            <div className="flex gap-2 items-center pointer-events-auto">
              {myOrders.length > 0 && (
                <button
                  onClick={() => navigate(`/order/${myOrders[0].id}`)}
                  className="px-3 py-1.5 bg-black/40 backdrop-blur-md rounded-full text-xs font-bold border border-white/10 text-white shadow-lg"
                >
                  {myOrders.length} Order{myOrders.length !== 1 ? 's' : ''}
                </button>
              )}
              <button
                onClick={() => navigate('/settings')}
                aria-label="Settings"
                className="min-w-[48px] min-h-[48px] w-12 h-12 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white border border-white/10 active:scale-90 transition shadow-lg"
              >
                <span className="text-xl">⚙️</span>
              </button>
            </div>
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
        <nav className="sticky top-0 z-30 bg-glass backdrop-blur-xl border-b border-glassBorder py-3" role="navigation" aria-label="Menu categories">
          <div
            ref={categoryScrollRef}
            className="flex px-4 gap-3 overflow-x-auto no-scrollbar scroll-smooth"
            role="tablist"
            aria-label="Filter menu by category"
          >
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                onKeyDown={(e) => {
                  // Arrow key navigation for categories
                  if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                    e.preventDefault();
                    const currentIndex = categories.indexOf(activeCategory);
                    const nextIndex = e.key === 'ArrowRight'
                      ? (currentIndex + 1) % categories.length
                      : (currentIndex - 1 + categories.length) % categories.length;
                    setActiveCategory(categories[nextIndex]);
                    // Focus the new button
                    const buttons = categoryScrollRef.current?.querySelectorAll('button');
                    if (buttons && buttons[nextIndex]) {
                      (buttons[nextIndex] as HTMLButtonElement).focus();
                    }
                  }
                }}
                role="tab"
                aria-selected={activeCategory === cat}
                aria-controls={`category-${cat.toLowerCase().replace(/\s+/g, '-')}`}
                className={`min-h-[48px] px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all flex-shrink-0 focus:ring-2 focus:ring-secondary-500 focus:ring-offset-2 ${activeCategory === cat
                  ? 'bg-foreground text-background scale-105'
                  : 'bg-surface-highlight text-muted hover:bg-black/10'
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </nav>

        {/* Menu Grid */}
        <section className="p-4 space-y-4 pb-24" aria-label={`Menu items in ${activeCategory} category`} id={`category-${activeCategory.toLowerCase().replace(/\s+/g, '-')}`} role="tabpanel" aria-live="polite" aria-atomic="false">
          {filteredItems.map(item => (
            <article
              key={item.id}
              className="flex gap-4 p-0 overflow-hidden bg-surface shadow-sm rounded-xl border border-border"
              role="article"
              aria-labelledby={`menu-item-${item.id}-name`}
            >
              <div
                className="w-28 h-28 bg-surface-highlight relative flex-shrink-0"
                role="img"
                aria-label={`${item.name} image`}
                style={{ aspectRatio: '1 / 1' }}
              >
                <OptimizedImage
                  src={item.imageUrl || `https://via.placeholder.com/150?text=${encodeURIComponent(item.name)}`}
                  alt={`${item.name}${item.description ? ` - ${item.description}` : ''}`}
                  aspectRatio="1/1"
                  className="w-full h-full"
                  width={112}
                  height={112}
                />
              </div>
              <div className="flex-1 py-3 pr-3 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start gap-2">
                    <h3
                      id={`menu-item-${item.id}-name`}
                      className="font-bold text-base leading-tight mb-1 text-foreground flex-1"
                    >
                      {item.name}
                    </h3>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(item);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          toggleFavorite(item);
                        }
                      }}
                      className="min-w-[48px] min-h-[48px] flex items-center justify-center text-xl flex-shrink-0 active:scale-90 transition-transform focus:ring-2 focus:ring-secondary-500 focus:ring-offset-2 rounded-full"
                      aria-label={isFavorite(item.id) ? `Remove ${item.name} from favorites` : `Add ${item.name} to favorites`}
                      aria-pressed={isFavorite(item.id)}
                    >
                      <span aria-hidden="true">{isFavorite(item.id) ? '⭐' : '☆'}</span>
                    </button>
                  </div>
                  {item.description && (
                    <p className="text-xs text-muted line-clamp-2 leading-relaxed" id={`menu-item-${item.id}-description`}>
                      {item.description}
                    </p>
                  )}
                </div>

                <div className="flex justify-between items-end mt-2">
                  <span
                    className="font-bold text-lg text-foreground"
                    aria-label={`Price: €${item.price.toFixed(2)}`}
                  >
                    €{item.price.toFixed(2)}
                  </span>
                  <button
                    onClick={() => addToCart(item)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        addToCart(item);
                      }
                    }}
                    aria-label={`Add ${item.name} to cart for €${item.price.toFixed(2)}`}
                    className="min-w-[48px] min-h-[48px] w-12 h-12 rounded-full bg-foreground text-background flex items-center justify-center font-bold text-xl active:scale-90 transition-transform shadow-lg focus:ring-2 focus:ring-secondary-500 focus:ring-offset-2"
                  >
                    <span aria-hidden="true">+</span>
                  </button>
                </div>
              </div>
            </article>
          ))}
          {filteredItems.length === 0 && (
            <div className="animate-fade-in pb-24">
              <React.Suspense fallback={<div className="py-10 text-center text-muted">Loading...</div>}>
                <EmptyState
                  icon={showFavoritesOnly ? "⭐" : "🍽️"}
                  title={showFavoritesOnly ? "No favorites yet" : "No items here"}
                  description={showFavoritesOnly
                    ? "Tap the star icon on menu items to save them as favorites."
                    : `No items in the "${activeCategory}" category yet.`}
                  size="sm"
                />
              </React.Suspense>
            </div>
          )}
        </section>

        {/* Cart Bar - Always visible when not in modals */}
        {!isReviewOpen && !showPaymentModal && !currentOrder && (
          <CartBar
            itemCount={totalItems}
            total={totalAmount}
            favoritesCount={favorites.length}
            showFavoritesOnly={showFavoritesOnly}
            onToggleFavorites={() => setShowFavoritesOnly(!showFavoritesOnly)}
            onReviewCart={() => setIsReviewOpen(true)}
          />
        )}

        {/* Order Review Bottom Sheet */}
        <BottomSheet
          isOpen={isReviewOpen}
          onClose={() => setIsReviewOpen(false)}
          title="Your Order"
          height="auto"
          swipeToClose={true}
        >
          {/* Table Reference Input */}
          <div className="mb-6 bg-surface-highlight p-4 rounded-xl border border-border">
            <label htmlFor="table-input" className="text-xs text-muted font-bold uppercase tracking-wider mb-2 block">
              Table Number or Code (Required)
            </label>
            <input
              id="table-input"
              ref={tableInputRef}
              type="text"
              value={manualTableRef}
              onChange={(e) => {
                setManualTableRef(e.target.value);
                if (e.target.value.trim()) setTableError(false);
              }}
              placeholder="e.g. 12 or TBL-ABCD"
              aria-invalid={tableError}
              aria-describedby={tableError ? 'table-error' : undefined}
              className={`w-full bg-background border p-3 rounded-lg text-foreground font-bold text-lg outline-none transition-colors focus:ring-2 focus:ring-secondary-500 focus:border-secondary-500 ${tableError ? 'border-red-500 animate-pulse' : 'border-border'
                }`}
            />
            {tableError && (
              <p id="table-error" className="text-red-400 text-xs mt-2 font-bold animate-pulse" role="alert">
                Please enter your table number or code to proceed.
              </p>
            )}
          </div>

          {/* Cart Items with Swipe-to-Delete */}
          <div className="space-y-3 mb-8" role="list" aria-label="Cart items">
            {cart.map((line, idx) => (
              <CartItem
                key={`${line.item.id}-${idx}`}
                item={line.item}
                quantity={line.quantity}
                onIncrement={() => addToCart(line.item)}
                onDecrement={() => removeFromCart(line.item.id)}
                onRemove={() => {
                  // Remove all instances of this item
                  for (let i = 0; i < line.quantity; i++) {
                    removeFromCart(line.item.id);
                  }
                }}
              />
            ))}
          </div>

          {/* Order Summary */}
          <div className="border-t border-border pt-4 mb-6 space-y-2">
            <div className="flex justify-between text-muted text-sm">
              <span>Subtotal</span>
              <span aria-label={`Subtotal: €${totalAmount.toFixed(2)}`}>€{totalAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-2xl font-bold text-foreground">
              <span>Total</span>
              <span aria-label={`Total: €${totalAmount.toFixed(2)}`}>€{totalAmount.toFixed(2)}</span>
            </div>
          </div>

          {/* Payment Buttons */}
          <div>
            <h3 className="font-bold text-muted text-xs uppercase tracking-wider mb-3">Confirm & Pay</h3>
            <div className="grid grid-cols-2 gap-3 pb-6">
              <button
                onClick={() => validateAndProceed('cash')}
                disabled={!manualTableRef.trim()}
                className={`min-h-[48px] py-4 rounded-xl border border-border font-bold transition flex items-center justify-center gap-2 bg-surface-highlight text-muted hover:bg-black/10 active:scale-95 touch-target ${!manualTableRef.trim() ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                aria-label="Pay with cash"
              >
                💶 Cash
              </button>
              <button
                onClick={() => validateAndProceed('digital')}
                disabled={!paymentProvider || !manualTableRef.trim()}
                className={`min-h-[48px] py-4 rounded-xl font-bold shadow-lg transition flex items-center justify-center gap-2 touch-target ${paymentProvider && manualTableRef.trim()
                  ? `${paymentProvider.color} text-white active:scale-95`
                  : 'bg-gray-500/20 text-gray-500 cursor-not-allowed'
                  }`}
                aria-label={paymentProvider ? `Pay with ${paymentProvider.name}` : 'Digital payment not available'}
              >
                {paymentProvider ? (
                  <>
                    {paymentProvider.icon} {paymentProvider.name}
                  </>
                ) : (
                  'No Digital Pay'
                )}
              </button>
            </div>
          </div>
        </BottomSheet>
      </main>
    </PullToRefresh>
  );
};

export default ClientMenu;
