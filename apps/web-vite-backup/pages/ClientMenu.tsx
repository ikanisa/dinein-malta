/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState, useRef, useMemo } from 'react';
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
import { Order, OrderStatus, MenuItem } from '../types';
import { useCart } from '../context/CartContext';
import { supabase } from '../services/supabase';
import { useAICategorization } from '../hooks/useAICategorization';
import { CategoryBadges } from '../components/venues/CategoryBadges';

const EmptyState = React.lazy(() => import('../components/ui/EmptyState'));

const ClientMenu = () => {
  const { venueId, tableCode } = useParams();
  const navigate = useNavigate();
  const { cart, addToCart, removeFromCart, clearCart, totalAmount, totalItems, isFavorite, favorites } = useCart();


  // Use optimized menu hook
  const { venue, menu: allMenuItems, categories, isLoading: menuLoading, error: menuError, refetch } = useMenu(venueId, tableCode);

  // AI Categorization
  const { categories: aiCategories, isCalculating: aiLoading } = useAICategorization(venue || undefined);

  const availableItems = allMenuItems.filter(i => i.available !== false);

  // Dynamic Grouping Logic (AI vs Legacy)
  const { groupedItems, displayCategories } = useMemo(() => {
    // If we have AI grouping, use it
    if (aiCategories?.menu_grouping && Object.keys(aiCategories.menu_grouping).length > 0) {
      const groups: Record<string, MenuItem[]> = {};
      const cats = new Set<string>();

      availableItems.forEach(item => {
        // Get smart category or fallback to 'Other'
        const smartCat = aiCategories.menu_grouping?.[item.id]?.smart_category || 'Other';

        if (!groups[smartCat]) groups[smartCat] = [];
        groups[smartCat].push(item);
        cats.add(smartCat);
      });

      // Simple alphabetical sort for now, ensuring 'Other' is last
      const sortedCats = Array.from(cats).sort((a, b) => {
        if (a === 'Other') return 1;
        if (b === 'Other') return -1;
        return a.localeCompare(b);
      });

      return { groupedItems: groups, displayCategories: sortedCats };
    }

    // Fallback to legacy categories
    const groups: Record<string, MenuItem[]> = {};
    categories.forEach(cat => {
      groups[cat] = availableItems.filter(i => i.category === cat);
    });
    return { groupedItems: groups, displayCategories: categories };
  }, [aiCategories, categories, availableItems]);

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

  // Scroll Spy Logic
  useEffect(() => {
    // 1. Category Scroll Spy
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Find which category this section belongs to
          const catId = entry.target.id.replace('category-', '').replace(/-/g, ' ');
          // We need to match case insensitive back to format
          const matchedCat = displayCategories.find(c => c.toLowerCase() === catId);
          if (matchedCat) {
            setActiveCategory(matchedCat);

            // Also scroll the tab into view
            const tab = document.querySelector(`button[role="tab"][aria-selected="true"]`);
            if (tab) {
              tab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
            }
          }
        }
      });
    }, { rootMargin: '-15% 0px -70% 0px', threshold: 0 });

    displayCategories.forEach(cat => {
      const el = document.getElementById(`category-${cat.toLowerCase().replace(/\s+/g, '-')}`);
      if (el) observer.observe(el);
    });

    // 2. Sticky Logo Visibility
    // We observe the Hero section. When it leaves viewport, show logo in header.
    const heroObserver = new IntersectionObserver((entries) => {
      const logo = document.getElementById('sticky-header-logo');
      if (!logo) return;

      entries.forEach(entry => {
        if (!entry.isIntersecting) {
          // Hero is gone, show logo in sticky header
          logo.setAttribute('data-visible', 'true');
        } else {
          // Hero is visible, hide logo in sticky header
          logo.setAttribute('data-visible', 'false');
        }
      });
    }, { rootMargin: '-100px 0px 0px 0px', threshold: 0 });

    const hero = document.getElementById('venue-hero');
    if (hero) heroObserver.observe(hero);

    return () => {
      observer.disconnect();
      heroObserver.disconnect();
    };
  }, [displayCategories]);

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
  }, [currentOrder?.id, venue?.id, currentOrder]);


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

  // Apply filters: category and favorites
  // filteredItems removed as it was unused and recalculated in render loop

  // Determine payment availability dynamically from venue data
  // Returns all available payment providers for the venue
  const getPaymentProviders = () => {
    const providers = [];

    // MOMO (Rwanda) - Display number for user to dial
    if (venue.momoNumber) {
      providers.push({
        type: 'momo',
        name: 'MTN MoMo',
        color: 'bg-yellow-500 shadow-yellow-500/30',
        icon: '📱',
        // MOMO uses USSD codes which aren't web-linkable
        // We'll show the number for the user to dial
        handle: venue.momoNumber,
        isDialable: true  // Flag to show "Dial to pay" instead of "Open"
      });
    }

    // Revolut (Malta/Europe)
    if (venue.revolutHandle) {
      providers.push({
        type: 'revolut',
        name: 'Revolut',
        color: 'bg-secondary-500 shadow-secondary-500/30',
        icon: 'R',
        linkPrefix: 'https://revolut.me/',
        handle: venue.revolutHandle,
        isDialable: false
      });
    }

    return providers;
  };

  const paymentProviders = getPaymentProviders();
  // Primary provider for backward compatibility
  const paymentProvider = paymentProviders.find(p => !p.isDialable) || paymentProviders[0] || null;

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
        <div id="venue-hero" className="h-[40vh] relative w-full overflow-hidden" style={{ minHeight: '300px', aspectRatio: '16 / 9' }}>
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

            {/* AI Smart Categories */}
            <CategoryBadges categories={aiCategories} isLoading={aiLoading} />

            {/* Fallback Legacy Tags (only if AI is null/loading and we want to show something, or duplicate?) 
                Actually CategoryBadges handles loading. Let's hide legacy tags if we have AI, or merge? 
                The hook falls back to legacy tags if AI fails. So we can just rely on CategoryBadges. 
            */}
            {(!aiCategories && !aiLoading && venue.tags && venue.tags.length > 0) && (
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

        {/* Sticky Category Bar with Floating Logo */}
        <nav className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-white/5 py-2 transition-all duration-300 shadow-sm" role="navigation" aria-label="Menu categories">
          <div className="flex items-center">
            {/* Animated Tiny Logo in Header */}
            <div className="w-0 overflow-hidden transition-all duration-300 opacity-0 data-[visible=true]:w-12 data-[visible=true]:opacity-100 ml-4 flex-shrink-0" id="sticky-header-logo">
              <img
                src={venue.logoUrl || venue.imageUrl || 'https://picsum.photos/100'}
                alt="Venue Logo"
                className="w-8 h-8 rounded-full border border-white/20"
              />
            </div>

            <div
              ref={categoryScrollRef}
              className="flex px-4 gap-2 overflow-x-auto no-scrollbar scroll-smooth w-full items-center"
              role="tablist"
              aria-label="Filter menu by category"
            >
              {displayCategories.map(cat => (
                <button
                  key={cat}
                  onClick={() => {
                    setActiveCategory(cat);
                    const el = document.getElementById(`category-${cat.toLowerCase().replace(/\s+/g, '-')}`);
                    if (el) {
                      const y = el.getBoundingClientRect().top + window.scrollY - 140; // Offset for header
                      window.scrollTo({ top: y, behavior: 'smooth' });
                    }
                  }}
                  role="tab"
                  aria-selected={activeCategory === cat}
                  className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all flex-shrink-0 border ${activeCategory === cat
                    ? 'bg-foreground text-background border-foreground shadow-lg scale-105'
                    : 'bg-white/5 text-muted border-white/10 hover:bg-white/10'
                    }`}
                >
                  {cat}
                  {/* Subtle indicator for smart categories */}
                  {aiCategories?.menu_grouping && <span className="ml-1 text-[10px] opacity-70">✨</span>}
                </button>
              ))}
            </div>
          </div>
        </nav>

        <div className="pb-32 space-y-8 pt-6">
          {displayCategories.map(category => {
            // Filter items for this category using pre-computed groups
            const categoryItems = groupedItems[category] || [];
            if (categoryItems.length === 0) return null;
            if (showFavoritesOnly && !categoryItems.some(i => isFavorite(i.id))) return null;

            const displayItems = showFavoritesOnly
              ? categoryItems.filter(i => isFavorite(i.id))
              : categoryItems;

            if (displayItems.length === 0) return null;

            return (
              <section
                key={category}
                id={`category-${category.toLowerCase().replace(/\s+/g, '-')}`}
                className="scroll-mt-36 px-4"
              >
                <div className="flex items-center gap-3 mb-4">
                  <h2 className="text-xl font-bold text-foreground tracking-tight">{category}</h2>
                  <div className="h-px bg-gradient-to-r from-border to-transparent flex-1" />
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {displayItems.map(item => (
                    <GlassCard
                      key={item.id}
                      className="flex gap-4 p-3 overflow-hidden active:scale-[0.99] transition-transform duration-200 border-white/10 hover:border-white/20 shadow-sm"
                      role="article"
                    >
                      <div className="w-24 h-24 relative rounded-xl overflow-hidden flex-shrink-0 bg-surface-highlight shadow-inner">
                        <OptimizedImage
                          src={item.imageUrl || ''}
                          alt={item.name}
                          aspectRatio="1/1"
                          className="w-full h-full object-cover"
                          width={96}
                          height={96}
                        />
                        {isFavorite(item.id) && (
                          <div className="absolute top-1 right-1 bg-black/60 backdrop-blur-md rounded-full p-1">
                            <span className="text-xs">⭐</span>
                          </div>
                        )}
                      </div>

                      <div className="flex-1 flex flex-col justify-between min-w-0">
                        <div>
                          <div className="flex justify-between items-start gap-2">
                            <h3 className="font-bold text-base text-foreground leading-snug truncate pr-2">
                              {item.name}
                            </h3>
                          </div>
                        </div>
                        {item.description && (
                          <p className="text-xs text-muted mt-1 line-clamp-2 leading-relaxed opacity-90">
                            {item.description}
                          </p>
                        )}
                        {/* AI Menu Tags */}
                        {aiCategories?.menu_grouping?.[item.id]?.dietary_tags && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {aiCategories.menu_grouping[item.id].dietary_tags?.map(tag => (
                              <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded bg-green-500/10 text-green-600 border border-green-500/20 font-medium">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}


                        <div className="flex justify-between items-center mt-3">
                          <span className="font-bold text-base text-foreground">
                            €{item.price.toFixed(2)}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              addToCart(item);
                              import('../utils/haptics').then(h => h.hapticSuccess());
                            }}
                            className="w-8 h-8 rounded-full bg-foreground text-background flex items-center justify-center font-bold shadow-lg active:scale-90 transition-transform"
                            aria-label={`Add ${item.name}`}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </GlassCard>
                  ))}
                </div>
              </section>
            );
          })}

          {availableItems.length === 0 && (
            <div className="py-10 text-center text-muted">
              <EmptyState icon="🍽️" title="Menu Empty" description="This venue has no items available right now." />
            </div>
          )}
        </div>

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
            <div className="flex flex-col gap-3 pb-6">
              {/* Cash option - always available */}
              <button
                onClick={() => validateAndProceed('cash')}
                disabled={!manualTableRef.trim()}
                className={`min-h-[48px] py-4 rounded-xl border border-border font-bold transition flex items-center justify-center gap-2 bg-surface-highlight text-muted hover:bg-black/10 active:scale-95 touch-target ${!manualTableRef.trim() ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                aria-label="Pay with cash"
              >
                💶 Pay with Cash
              </button>

              {/* Digital payment providers */}
              {paymentProviders.map((provider) => (
                provider.isDialable ? (
                  // MOMO - opens tel: link
                  <a
                    key={provider.type}
                    href={`tel:${provider.handle}`}
                    onClick={() => {
                      if (!manualTableRef.trim()) return;
                      validateAndProceed('digital');
                    }}
                    className={`min-h-[48px] py-4 rounded-xl font-bold shadow-lg transition flex items-center justify-center gap-2 touch-target ${manualTableRef.trim()
                      ? `${provider.color} text-white active:scale-95`
                      : 'bg-gray-500/20 text-gray-500 pointer-events-none'
                      }`}
                    aria-label={`Pay with ${provider.name}`}
                  >
                    {provider.icon} {provider.name} ({provider.handle})
                  </a>
                ) : (
                  // Revolut / other web-based providers
                  <button
                    key={provider.type}
                    onClick={() => validateAndProceed('digital')}
                    disabled={!manualTableRef.trim()}
                    className={`min-h-[48px] py-4 rounded-xl font-bold shadow-lg transition flex items-center justify-center gap-2 touch-target ${manualTableRef.trim()
                      ? `${provider.color} text-white active:scale-95`
                      : 'bg-gray-500/20 text-gray-500 cursor-not-allowed'
                      }`}
                    aria-label={`Pay with ${provider.name}`}
                  >
                    {provider.icon} {provider.name}
                  </button>
                )
              ))}

              {/* Fallback if no digital payments */}
              {paymentProviders.length === 0 && (
                <div className="text-center text-muted text-xs py-2">
                  Only cash payment available at this venue
                </div>
              )}
            </div>
          </div>
        </BottomSheet>
      </main>
    </PullToRefresh >
  );
};

export default ClientMenu;
