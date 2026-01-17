import React, { useState, useEffect, lazy, Suspense } from 'react';
import { HashRouter as Router, Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { UserType } from './types';
import { AnimatePresence, motion } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// Lazy load routes for code splitting for better performance

// Type definitions for PWA install prompt
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
  prompt(): Promise<void>;
}

// Extend Navigator for iOS standalone detection
interface NavigatorStandalone extends Navigator {
  standalone?: boolean;
}

const ClientMenu = lazy(() => import('./pages/ClientMenu'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const ClientOrderStatus = lazy(() => import('./pages/ClientOrderStatus'));
const ClientLanding = lazy(() => import('./pages/ClientLanding'));
// ClientQRScanner removed - QR codes should link directly to menu
// ClientProfile removed - functionality merged into SettingsPage
// DeveloperSwitchboard removed - dev-only route
const VendorLogin = lazy(() => import('./pages/VendorLogin'));
const VendorDashboard = lazy(() => import('./pages/VendorDashboard'));
const LiveDashboard = lazy(() => import('./pages/vendor/LiveDashboard'));
const MenuManagement = lazy(() => import('./pages/vendor/MenuManagement'));
const HistoryAnalytics = lazy(() => import('./pages/vendor/HistoryAnalytics'));
const VendorSettings = lazy(() => import('./pages/vendor/VendorSettings'));
const BarOnboarding = lazy(() => import('./pages/BarOnboarding'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AdminUsers = lazy(() => import('./pages/AdminUsers'));
const AdminLogin = lazy(() => import('./pages/AdminLogin'));
const AdminVendors = lazy(() => import('./pages/AdminVendors'));
const AdminOrders = lazy(() => import('./pages/AdminOrders'));
const AdminSystem = lazy(() => import('./pages/AdminSystem'));
import { ThemeProvider } from './context/ThemeContext';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { RequireAuth } from './components/RequireAuth';
import { GlassCard } from './components/GlassCard';
import { SuspenseFallback } from './components/SuspenseFallback';
import { ErrorBoundary } from './components/ErrorBoundary';
import { UpdatePrompt } from './components/UpdatePrompt';
import { SkipLink } from './components/AccessibleSkipLink';
import { initQueueProcessor } from './services/offlineQueue';
import { errorTracker } from './services/errorTracking';
import { analytics } from './services/analytics';
import { initWebVitals } from './services/webVitals';
import { preloadCriticalRoutes } from './utils/routePreload';
import { useAnimationsReady } from './hooks/useAnimationsReady';

// Initialize offline queue processor
initQueueProcessor();

// Initialize error tracking and analytics
if (import.meta.env.PROD) {
  errorTracker.init();
  analytics.init();
  initWebVitals();
}

// Preload critical routes after initial render (uses requestIdleCallback)
preloadCriticalRoutes();

// Configure React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

// Legacy vibrate function (for backward compatibility)
// --- COMPONENTS ---

const OfflineIndicator = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Process queued requests when back online
      import('./services/offlineQueue').then(({ processQueue }) => {
        processQueue().then(({ success, failed }) => {
          if (success > 0 || failed > 0) {
            console.log(`Processed ${success} queued requests, ${failed} failed`);
          }
        });
      });
      import('./services/orderService').then(({ processQueuedOrders }) => {
        processQueuedOrders().then(({ success, failed }) => {
          if (success > 0 || failed > 0) {
            console.log(`Synced ${success} queued orders, ${failed} failed`);
          }
        });
      });
    };
    const handleOffline = () => {
      setIsOnline(false);
    };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Listen for background sync messages from service worker
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'SYNC_QUEUE') {
        import('./services/offlineQueue').then(({ processQueue }) => {
          processQueue();
        });
      }
      if (event.data?.type === 'SYNC_ORDER' || event.data?.type === 'SYNC_QUEUE') {
        // Process queued orders when back online
        import('./services/orderService').then(({ processQueuedOrders }) => {
          processQueuedOrders().then(({ success, failed }) => {
            if (success > 0 || failed > 0) {
              console.log(`Synced ${success} queued orders, ${failed} failed`);
            }
          });
        });
      }
    };
    navigator.serviceWorker?.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      navigator.serviceWorker?.removeEventListener('message', handleMessage);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] bg-red-600 text-white text-xs font-bold text-center py-2 pt-safe-top animate-pulse">
      ⚠️ You are currently offline. Orders will sync when online.
    </div>
  );
};

const InstallPrompt = () => {
  const [show, setShow] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    // 1. Robust iOS Check (handles iPads requesting desktop sites)
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

    // 2. Check if already standalone (installed)
    const nav = window.navigator as NavigatorStandalone;
    const isStandalone = nav.standalone === true ||
      window.matchMedia('(display-mode: standalone)').matches;

    if (isStandalone) return undefined;

    if (isIosDevice) {
      setIsIOS(true);
      // Show iOS prompt after a short delay if not previously dismissed
      if (!localStorage.getItem('pwa-prompt-dismissed')) {
        setTimeout(() => setShow(true), 3000);
      }
      return undefined;
    } else {
      // Android/Desktop standard mechanism
      const handler = (e: Event) => {
        const promptEvent = e as BeforeInstallPromptEvent;
        // Only intercept if we haven't dismissed the prompt before
        if (localStorage.getItem('pwa-prompt-dismissed')) {
          // Don't preventDefault - let browser handle it naturally
          return;
        }
        e.preventDefault();
        setDeferredPrompt(promptEvent);
        setShow(true);
      };
      window.addEventListener('beforeinstallprompt', handler);
      return () => window.removeEventListener('beforeinstallprompt', handler);
    }
  }, []);

  const handleInstall = async () => {
    if (isIOS) {
      // Just dismiss, we can't programmatically install on iOS.
      setShow(false);
      localStorage.setItem('pwa-prompt-dismissed', 'true');
    } else if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        localStorage.setItem('pwa-prompt-dismissed', 'true');
      }
      setDeferredPrompt(null);
      setShow(false);
    }
  };

  const handleDismiss = () => {
    setShow(false);
    localStorage.setItem('pwa-prompt-dismissed', 'true');
  };

  if (!show) return null;

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      className="fixed bottom-0 left-0 right-0 z-40 p-4 pb-safe-bottom pointer-events-none"
    >
      <GlassCard className="bg-gradient-to-r from-primary-500 to-secondary-500 border-white/20 shadow-xl pointer-events-auto">
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <h3 className="font-bold text-white text-sm mb-1">
              {isIOS ? 'Install DineIn' : 'Install App'}
            </h3>
            <p className="text-white/90 text-xs mb-3">
              {isIOS
                ? 'Tap the share button, then &ldquo;Add to Home Screen&rdquo;'
                : 'Install for a faster, app-like experience'
              }
            </p>
            {isIOS && (
              <div className="flex items-center gap-2 text-white/80 text-xs">
                <span>Share</span>
                <span>→</span>
                <span>&ldquo;Add to Home Screen&rdquo;</span>
              </div>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <button
              onClick={handleDismiss}
              className="px-3 py-1.5 text-xs font-medium text-white/80 hover:text-white transition-colors touch-target"
            >
              Later
            </button>
            {!isIOS && (
              <button
                onClick={handleInstall}
                className="px-4 py-2 text-xs font-bold bg-white text-ink rounded-lg hover:bg-white/90 transition-colors touch-target"
              >
                Install
              </button>
            )}
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
};

const DevButton = () => {
  const navigate = useNavigate();
  const location = useLocation();
  if (location.pathname === '/dev') return null;
  return (
    <button
      onClick={() => { navigate('/dev'); }}
      className="fixed top-4 right-4 z-[9999] bg-primary-500/90 backdrop-blur-md border border-white/20 text-white font-bold text-xs px-3 py-1.5 rounded-full hover:bg-primary-400 transition-colors shadow-lg pointer-events-auto touch-target"
      style={{ marginTop: 'var(--safe-top, 0px)' }}
    >
      DEV
    </button>
  );
};

const AnimatedRoutes = () => {
  const location = useLocation();
  const animationsReady = useAnimationsReady(150); // Defer animations 150ms after first paint

  // Routes content - reused for both animated and non-animated render
  const routesContent = (
    <Suspense fallback={<SuspenseFallback />}>
      <Routes location={location}>
        {/* Public Client Routes - Simplified to 3 core routes */}
        <Route path="/" element={<ClientLanding />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/bar/onboard" element={<BarOnboarding />} />
        <Route path="/order/:id" element={<ClientOrderStatus />} />
        {/* QR codes should link directly to /v/:venueId/t/:tableCode */}
        <Route path="/v/:venueId" element={<ClientMenu />} />
        <Route path="/v/:venueId/t/:tableCode" element={<ClientMenu />} />
        {/* Legacy route redirects */}
        <Route path="/scan" element={<ClientLanding />} />
        <Route path="/profile" element={<Navigate to="/settings" replace />} />
        <Route path="/menu/:venueId" element={<ClientMenu />} />
        <Route path="/menu/:venueId/t/:tableCode" element={<ClientMenu />} />

        {/* Manager Routes (Private) - Bar/Restaurant Managers */}
        <Route path="/manager/login" element={<VendorLogin />} />
        <Route
          path="/manager/live"
          element={
            <RequireAuth requiredRole={UserType.MANAGER}>
              <LiveDashboard />
            </RequireAuth>
          }
        />
        <Route
          path="/manager/menu"
          element={
            <RequireAuth requiredRole={UserType.MANAGER}>
              <MenuManagement />
            </RequireAuth>
          }
        />
        <Route
          path="/manager/history"
          element={
            <RequireAuth requiredRole={UserType.MANAGER}>
              <HistoryAnalytics />
            </RequireAuth>
          }
        />
        <Route
          path="/manager/settings"
          element={
            <RequireAuth requiredRole={UserType.MANAGER}>
              <VendorSettings />
            </RequireAuth>
          }
        />
        <Route
          path="/manager/dashboard"
          element={
            <RequireAuth requiredRole={UserType.MANAGER}>
              <Navigate to="/manager/live" replace />
            </RequireAuth>
          }
        />
        <Route
          path="/manager/dashboard/:tab"
          element={
            <RequireAuth requiredRole={UserType.MANAGER}>
              <VendorDashboard />
            </RequireAuth>
          }
        />

        {/* Admin Routes (Private) */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin/dashboard"
          element={
            <RequireAuth requiredRole={UserType.ADMIN}>
              <AdminDashboard />
            </RequireAuth>
          }
        />
        <Route
          path="/admin/vendors"
          element={
            <RequireAuth requiredRole={UserType.ADMIN}>
              <AdminVendors />
            </RequireAuth>
          }
        />
        <Route
          path="/admin/orders"
          element={
            <RequireAuth requiredRole={UserType.ADMIN}>
              <AdminOrders />
            </RequireAuth>
          }
        />
        <Route
          path="/admin/system"
          element={
            <RequireAuth requiredRole={UserType.ADMIN}>
              <AdminSystem />
            </RequireAuth>
          }
        />
        <Route
          path="/admin/users"
          element={
            <RequireAuth requiredRole={UserType.ADMIN}>
              <AdminUsers />
            </RequireAuth>
          }
        />

        {/* Legacy routes - redirect to new structure */}
        <Route path="/vendor-login" element={<Navigate to="/manager/login" replace />} />
        <Route path="/business" element={<Navigate to="/manager/login" replace />} />
        <Route path="/staff/login" element={<Navigate to="/manager/login" replace />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/vendor-dashboard" element={<RequireAuth requiredRole={UserType.MANAGER}><VendorDashboard /></RequireAuth>} />
        <Route path="/vendor-dashboard/:tab" element={<RequireAuth requiredRole={UserType.MANAGER}><VendorDashboard /></RequireAuth>} />
        <Route path="/admin-dashboard" element={<RequireAuth requiredRole={UserType.ADMIN}><AdminDashboard /></RequireAuth>} />
        <Route path="/admin-vendors" element={<RequireAuth requiredRole={UserType.ADMIN}><AdminVendors /></RequireAuth>} />
        <Route path="/admin-orders" element={<RequireAuth requiredRole={UserType.ADMIN}><AdminOrders /></RequireAuth>} />
        <Route path="/admin-system" element={<RequireAuth requiredRole={UserType.ADMIN}><AdminSystem /></RequireAuth>} />
        <Route path="/admin-users" element={<RequireAuth requiredRole={UserType.ADMIN}><AdminUsers /></RequireAuth>} />

        {/* Dev route removed - DeveloperSwitchboard deleted */}
      </Routes>
    </Suspense>
  );

  // Initial render: Use CSS transition for instant paint, no framer-motion overhead
  if (!animationsReady) {
    return (
      <div
        className="min-h-full animate-fade-in"
        style={{ animation: 'fadeIn 0.15s ease-out' }}
      >
        {routesContent}
      </div>
    );
  }

  // After first paint: Use framer-motion for smooth route transitions
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -10 }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
        className="min-h-full"
      >
        {routesContent}
      </motion.div>
    </AnimatePresence>
  );
};

const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();

  // Routes that should be full bleed (no top safe area padding)
  // These pages manage their own safe area padding for hero images
  const isFullBleed =
    location.pathname === '/' ||
    location.pathname.startsWith('/v/') ||
    location.pathname.startsWith('/order/') ||
    location.pathname === '/bar/onboard';

  return (
    <div className="min-h-screen flex flex-col bg-background" style={{ paddingTop: isFullBleed ? '0px' : 'var(--safe-top, 0px)' }}>
      <SkipLink />
      <OfflineIndicator />
      <Toaster position="top-right" />
      <main
        id="main-content"
        className="flex-1 overflow-y-auto"
        style={{
          paddingBottom: 'var(--safe-bottom, 0px)',
          WebkitOverflowScrolling: 'touch'
        }}
        role="main"
      >
        {children}
      </main>

      <InstallPrompt />
      <UpdatePrompt />
      <DevButton />
    </div>
  );
};

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <CartProvider>
            <Router>
              <ErrorBoundary>
                <Layout>
                  <AnimatedRoutes />
                </Layout>
              </ErrorBoundary>
            </Router>
          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
