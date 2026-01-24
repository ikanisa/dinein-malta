import { Suspense, lazy } from 'react'
import { PWAInstallPrompt } from './components/PWAInstallPrompt'
import { ErrorBoundary } from './components/ErrorBoundary'

// Lazy load the flows
const QREntryFlow = lazy(() => import('./flows/qr-entry'))
const PWAHomeFlow = lazy(() => import('./flows/pwa-home'))
const VendorPortalFlow = lazy(() => import('./flows/vendor-portal'))
const AdminPortalFlow = lazy(() => import('./flows/admin-portal'))

function App() {
    // Simple router based on URL
    const path = window.location.pathname;
    const isQREntry = path.startsWith('/m/');
    const isVendor = path.startsWith('/vendor');
    const isAdmin = path.startsWith('/admin');

    const renderFlow = () => {
        if (isQREntry) return <QREntryFlow />;
        if (isVendor) return <VendorPortalFlow />;
        if (isAdmin) return <AdminPortalFlow />;
        return <PWAHomeFlow />;
    };

    return (
        <ErrorBoundary>
            <Suspense fallback={
                <div className="min-h-screen bg-slate-50 flex flex-col pb-safe">
                    {/* App Shell Skeleton */}
                    <div className="h-14 bg-white/80 backdrop-blur-md border-b border-indigo-100 flex items-center px-4 sticky top-0 z-10 w-full justify-between">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 animate-pulse" />
                        <div className="h-6 w-24 bg-indigo-50 rounded-lg animate-pulse" />
                        <div className="w-8 h-8 rounded-full bg-indigo-50 animate-pulse" />
                    </div>

                    <div className="p-4 space-y-6 flex-1">
                        {/* Hero Skeleton */}
                        <div className="h-48 w-full rounded-3xl bg-indigo-50/50 animate-pulse border border-indigo-100" />

                        {/* Horizontal Scroll Skeleton */}
                        <div className="space-y-3">
                            <div className="h-5 w-32 bg-slate-100 rounded animate-pulse" />
                            <div className="flex gap-4 overflow-hidden">
                                <div className="h-32 w-28 rounded-2xl bg-slate-50 border border-slate-100 animate-pulse shrink-0" />
                                <div className="h-32 w-28 rounded-2xl bg-slate-50 border border-slate-100 animate-pulse shrink-0" />
                                <div className="h-32 w-28 rounded-2xl bg-slate-50 border border-slate-100 animate-pulse shrink-0" />
                            </div>
                        </div>

                        {/* List Skeleton */}
                        <div className="space-y-4">
                            <div className="h-5 w-40 bg-slate-100 rounded animate-pulse" />
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="h-24 w-full rounded-2xl bg-white border border-slate-100 animate-pulse" />
                            ))}
                        </div>
                    </div>

                    {/* Bottom Nav Skeleton */}
                    <div className="h-[80px] bg-white border-t border-indigo-100 fixed bottom-0 left-0 right-0 flex items-center justify-around px-4 pb-safe">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="w-10 h-10 rounded-full bg-slate-50 animate-pulse" />
                        ))}
                    </div>
                </div>
            }>
                {renderFlow()}
            </Suspense>
            <PWAInstallPrompt />
        </ErrorBoundary>
    )
}

export default App
