import { Suspense, lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { PWAInstallPrompt } from './components/PWAInstallPrompt'
import { ErrorBoundary } from './components/ErrorBoundary'
import { LoadingScreen } from './components/LoadingScreen'
import { OnboardingView } from './views/OnboardingView'
import { CartView } from './views/CartView'

// Lazy load the flows
const QREntryFlow = lazy(() => import('./flows/qr-entry'))
const PWAHomeFlow = lazy(() => import('./flows/pwa-home'))
const VendorPortalFlow = lazy(() => import('./flows/vendor-portal'))
const AdminPortalFlow = lazy(() => import('./flows/admin-portal'))

function App() {
    return (
        <ErrorBoundary>
            <Suspense fallback={<LoadingScreen />}>
                <Routes>
                    <Route path="/onboarding" element={<OnboardingView />} />
                    <Route path="/cart" element={<CartView />} />

                    {/* Existing flows mapped to routes */}
                    <Route path="/m/*" element={<QREntryFlow />} />
                    <Route path="/vendor/*" element={<VendorPortalFlow />} />
                    <Route path="/admin/*" element={<AdminPortalFlow />} />

                    {/* Chat route - assuming it maps to PWAHomeFlow for now, or new ChatView */}
                    <Route path="/chat" element={<PWAHomeFlow />} />

                    {/* Default route */}
                    <Route path="/" element={<Navigate to="/onboarding" replace />} />
                </Routes>
            </Suspense>
            <PWAInstallPrompt />
        </ErrorBoundary>
    )
}

export default App
