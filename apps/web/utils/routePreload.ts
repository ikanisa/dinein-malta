/**
 * Route Preloading Utility
 * Preloads critical routes for faster navigation
 */

// Route module factories for preloading
const routeModules = {
    // Client routes
    // home: () => import('../pages/ClientHome'), // No dedicated home page component
    // explore: () => import('../pages/ClientExplore'), // Component doesn't exist yet
    menu: () => import('../pages/ClientMenu'),
    // ClientProfile removed - functionality merged into SettingsPage
    settings: () => import('../pages/SettingsPage'),
    orderStatus: () => import('../pages/ClientOrderStatus'),

    // Vendor routes
    vendorLogin: () => import('../pages/VendorLogin'),
    vendorDashboard: () => import('../pages/VendorDashboard'),

    // Admin routes
    adminLogin: () => import('../pages/AdminLogin'),
    adminDashboard: () => import('../pages/AdminDashboard'),
    adminVendors: () => import('../pages/AdminVendors'),
    adminOrders: () => import('../pages/AdminOrders'),
    adminUsers: () => import('../pages/AdminUsers'),
    adminSystem: () => import('../pages/AdminSystem'),
};

type RouteName = keyof typeof routeModules;

// Track preloaded routes to avoid duplicate fetches
const preloadedRoutes = new Set<RouteName>();

/**
 * Preload a specific route module
 */
export const preloadRoute = (route: RouteName): Promise<void> => {
    if (preloadedRoutes.has(route)) {
        return Promise.resolve();
    }

    preloadedRoutes.add(route);

    return routeModules[route]()
        .then(() => {
            if (import.meta.env.DEV) {
                console.log(`[Preload] Route "${route}" preloaded`);
            }
        })
        .catch((err) => {
            preloadedRoutes.delete(route);
            console.warn(`[Preload] Failed to preload "${route}":`, err);
        });
};

/**
 * Preload multiple routes in parallel
 */
export const preloadRoutes = (routes: RouteName[]): Promise<void[]> => {
    return Promise.all(routes.map(preloadRoute));
};

/**
 * Preload critical client routes after initial render
 * Should be called in App.tsx after the app is interactive
 */
export const preloadCriticalRoutes = (): void => {
    // Use requestIdleCallback for non-blocking preload
    const preload = () => {
        preloadRoutes(['menu', 'settings']);
    };

    if ('requestIdleCallback' in window) {
        requestIdleCallback(preload, { timeout: 2000 });
    } else {
        setTimeout(preload, 1000);
    }
};

/**
 * Preload vendor routes (for authenticated vendors)
 */
export const preloadVendorRoutes = (): void => {
    const preload = () => {
        preloadRoutes(['vendorDashboard']);
    };

    if ('requestIdleCallback' in window) {
        requestIdleCallback(preload, { timeout: 3000 });
    } else {
        setTimeout(preload, 2000);
    }
};

/**
 * Preload admin routes (for authenticated admins)
 */
export const preloadAdminRoutes = (): void => {
    const preload = () => {
        preloadRoutes(['adminDashboard', 'adminVendors', 'adminOrders']);
    };

    if ('requestIdleCallback' in window) {
        requestIdleCallback(preload, { timeout: 3000 });
    } else {
        setTimeout(preload, 2000);
    }
};

/**
 * Hook to preload route on hover/focus
 * Usage: <Link {...preloadOnHover('explore')} to="/explore">Explore</Link>
 */
export const preloadOnHover = (route: RouteName) => ({
    onMouseEnter: () => preloadRoute(route),
    onFocus: () => preloadRoute(route),
    onTouchStart: () => preloadRoute(route),
});

/**
 * Preload route based on visibility (IntersectionObserver)
 */
export const preloadWhenVisible = (
    element: HTMLElement | null,
    route: RouteName
): (() => void) | undefined => {
    if (!element || typeof IntersectionObserver === 'undefined') {
        return undefined;
    }

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    preloadRoute(route);
                    observer.disconnect();
                }
            });
        },
        { rootMargin: '100px' }
    );

    observer.observe(element);

    return () => observer.disconnect();
};
