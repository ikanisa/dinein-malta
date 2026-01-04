import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
// Lazy load routes for code splitting and better performance
import { lazy, Suspense } from 'react';

const ClientHome = lazy(() => import('./pages/ClientHome'));
const ClientMenu = lazy(() => import('./pages/ClientMenu'));
const ClientExplore = lazy(() => import('./pages/ClientExplore'));
const ClientProfile = lazy(() => import('./pages/ClientProfile'));
const VendorLogin = lazy(() => import('./pages/VendorLogin'));
const VendorOnboarding = lazy(() => import('./pages/VendorOnboarding'));
const VendorDashboard = lazy(() => import('./pages/VendorDashboard'));
const DeveloperSwitchboard = lazy(() => import('./pages/DeveloperSwitchboard'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AdminUsers = lazy(() => import('./pages/AdminUsers'));
const AdminLogin = lazy(() => import('./pages/AdminLogin'));
const AdminVendors = lazy(() => import('./pages/AdminVendors'));
const AdminOrders = lazy(() => import('./pages/AdminOrders'));
const AdminSystem = lazy(() => import('./pages/AdminSystem'));
import { supabase } from './services/supabase';
import { ThemeProvider } from './context/ThemeContext';
import { CartProvider, useCart } from './context/CartContext';
import { GlassCard } from './components/GlassCard';
import { ErrorBoundary } from './components/ErrorBoundary';
import { UpdatePrompt } from './components/UpdatePrompt';
import { SkipLink } from './components/AccessibleSkipLink';
import { hapticButton, hapticSuccess, hapticWarning } from './utils/haptics';
import { initQueueProcessor } from './services/offlineQueue';
import { errorTracker } from './services/errorTracking';
import { analytics } from './services/analytics';
import { initWebVitals } from './services/webVitals';

// Initialize offline queue processor
initQueueProcessor();

// Initialize error tracking and analytics
if (import.meta.env.PROD) {
  errorTracker.init();
  analytics.init();
  initWebVitals();
}

// Legacy vibrate function (for backward compatibility)
const vibrate = () => {
    hapticButton();
};

// --- COMPONENTS ---

const OfflineIndicator = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      hapticSuccess();
      // Process queued requests when back online
      import('./services/offlineQueue').then(({ processQueue }) => {
        processQueue().then(({ success, failed }) => {
          if (success > 0 || failed > 0) {
            console.log(`Processed ${success} queued requests, ${failed} failed`);
          }
        });
      });
    };
    const handleOffline = () => {
      setIsOnline(false);
      hapticWarning();
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
            if (success > 0) {
              console.log(`Synced ${success} queued orders`);
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
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    // 1. Robust iOS Check (handles iPads requesting desktop sites)
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent) || 
                       (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    
    // 2. Check if already standalone (installed)
    const isStandalone = ('standalone' in window.navigator && (window.navigator as any).standalone) || 
                         window.matchMedia('(display-mode: standalone)').matches;

    if (isStandalone) return;

    if (isIosDevice) {
      setIsIOS(true);
      // Show iOS prompt after a short delay if not previously dismissed
      if (!localStorage.getItem('pwa-prompt-dismissed')) {
        setTimeout(() => setShow(true), 3000);
      }
    } else {
      // Android/Desktop standard mechanism
      const handler = (e: any) => {
        e.preventDefault();
        setDeferredPrompt(e);
        if (!localStorage.getItem('pwa-prompt-dismissed')) {
          setShow(true);
        }
      };
      window.addEventListener('beforeinstallprompt', handler);
      return () => window.removeEventListener('beforeinstallprompt', handler);
    }
  }, []);

  const handleInstall = () => {
    if (isIOS) {
        // Just dismiss, we can't programmatically install on iOS.
        setShow(false);
        localStorage.setItem('pwa-prompt-dismissed', 'true');
    } else if (deferredPrompt) {
      hapticButton();
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
          hapticSuccess();
          localStorage.setItem('pwa-prompt-dismissed', 'true');
        }
        setDeferredPrompt(null);
        setShow(false);
      });
    }
  };

  const handleDismiss = () => {
    hapticButton();
    setShow(false);
    localStorage.setItem('pwa-prompt-dismissed', 'true');
  };

  if (!show) return null;

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      className="fixed bottom-0 left-0 right-0 z-50 p-4 pb-safe-bottom"
    >
      <GlassCard className="bg-gradient-to-r from-blue-600 to-purple-600 border-blue-400/50 shadow-xl">
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <h3 className="font-bold text-white text-sm mb-1">
              {isIOS ? 'Install DineIn' : 'Install App'}
            </h3>
            <p className="text-white/90 text-xs mb-3">
              {isIOS 
                ? 'Tap the share button, then "Add to Home Screen"'
                : 'Install for a faster, app-like experience'
              }
            </p>
            {isIOS && (
              <div className="flex items-center gap-2 text-white/80 text-xs">
                <span>Share</span>
                <span>→</span>
                <span>"Add to Home Screen"</span>
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
                className="px-4 py-2 text-xs font-bold bg-white text-blue-600 rounded-lg hover:bg-white/90 transition-colors touch-target"
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
      onClick={() => { hapticButton(); navigate('/dev'); }}
      className="fixed top-safe right-4 z-[70] bg-black/40 backdrop-blur-md border border-white/10 text-white/30 hover:text-white text-[10px] px-2 py-1 rounded-full hover:bg-black/60 transition-colors mt-2 touch-target"
    >
      DEV
    </button>
  );
};

const AnimatedRoutes = () => {
  const location = useLocation();
  
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
        <Suspense fallback={
          <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <div className="text-muted">Loading...</div>
            </div>
          </div>
        }>
          <Routes location={location}>
              {/* Client Routes */}
              <Route path="/" element={<ClientHome />} />
              <Route path="/explore" element={<ClientExplore />} />
              <Route path="/profile" element={<ClientProfile />} />
              <Route path="/menu/:venueId" element={<ClientMenu />} />
              <Route path="/v/:venueId/t/:tableId" element={<ClientMenu />} />

              {/* Vendor Routes */}
              <Route path="/business" element={<VendorLogin />} />
              <Route path="/vendor-login" element={<VendorLogin />} />
              <Route path="/vendor-onboarding" element={<VendorOnboarding />} />
              <Route path="/vendor-dashboard" element={<VendorDashboard />} />
              <Route path="/vendor-dashboard/:tab" element={<VendorDashboard />} />

              {/* Admin Routes */}
              <Route path="/admin-login" element={<AdminLogin />} />
              <Route path="/admin-dashboard" element={<AdminDashboard />} />
              <Route path="/admin-vendors" element={<AdminVendors />} />
              <Route path="/admin-orders" element={<AdminOrders />} />
              <Route path="/admin-system" element={<AdminSystem />} />
              <Route path="/admin-users" element={<AdminUsers />} />

              {/* Dev */}
              <Route path="/dev" element={<DeveloperSwitchboard />} />
          </Routes>
        </Suspense>
      </motion.div>
    </AnimatePresence>
  );
};

const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { totalItems } = useCart();

  // Bottom Navigation
  const NavBtn = ({ icon, label, path, badge }: { icon: string; label: string; path: string; badge?: number }) => {
    const isActive = location.pathname === path || (path === '/' && location.pathname === '/');
    return (
      <button
        onClick={() => {
          if (location.pathname !== path) {
            hapticButton();
            navigate(path);
          }
        }}
        className={`
          flex flex-col items-center justify-center gap-1 flex-1 py-2 touch-target
          ${isActive ? 'text-blue-500' : 'text-muted'}
          transition-colors
        `}
      >
        <div className="relative">
          <span className="text-xl">{icon}</span>
          {badge && badge > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
              {badge > 9 ? '9+' : badge}
            </span>
          )}
        </div>
        <span className="text-[10px] font-medium">{label}</span>
      </button>
    );
  };

  // Only show bottom nav on client routes
  const showBottomNav = !location.pathname.startsWith('/vendor') && 
                       !location.pathname.startsWith('/admin') && 
                       !location.pathname.startsWith('/dev');

  return (
    <div className="min-h-screen flex flex-col bg-background" style={{ paddingTop: 'var(--safe-area-top, 0px)' }}>
      <SkipLink />
      <OfflineIndicator />
      <main
        id="main-content"
        className="flex-1 overflow-y-auto"
        style={{ 
          paddingBottom: showBottomNav ? 'calc(60px + var(--safe-area-bottom, 0px))' : 'var(--safe-area-bottom, 0px)',
          WebkitOverflowScrolling: 'touch'
        }}
        role="main"
      >
        {children}
      </main>
      
      {showBottomNav && (
        <nav 
          className="fixed bottom-0 left-0 right-0 bg-surface/80 backdrop-blur-xl border-t border-border z-40"
          style={{ paddingBottom: 'var(--safe-area-bottom, 0px)' }}
        >
          <div className="flex items-center">
            <NavBtn icon="🏠" label="Home" path="/" />
            <NavBtn icon="🔍" label="Explore" path="/explore" />
            <NavBtn icon="🛒" label="Cart" path="/menu" badge={totalItems} />
            <NavBtn icon="👤" label="Profile" path="/profile" />
          </div>
        </nav>
      )}
      
      <InstallPrompt />
      <UpdatePrompt />
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <CartProvider>
        <Router>
            <ErrorBoundary>
                <Layout>
                    <AnimatedRoutes />
                </Layout>
            </ErrorBoundary>
        </Router>
      </CartProvider>
    </ThemeProvider>
  );
}
