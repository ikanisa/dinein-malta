import { Suspense, lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { PWAInstallPrompt } from './components/PWAInstallPrompt'
import { ErrorBoundary } from './components/ErrorBoundary'
import { ClientLayout } from './layouts/ClientLayout'
import { VendorLayout } from './layouts/VendorLayout'
import { AdminLayout } from './layouts/AdminLayout'
import { AppShellSkeleton } from './components/layout/AppShellSkeleton'
import { ThemeProvider } from './components/auth/ThemeProvider'

import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { LoginScreen } from './components/screens/auth/LoginScreen'
import { RegisterScreen } from './components/screens/auth/RegisterScreen'

// Lazy load the flows
const QREntryFlow = lazy(() => import('./flows/qr-entry'))
const PWAHomeFlow = lazy(() => import('./flows/pwa-home'))
const VendorPortalFlow = lazy(() => import('./flows/vendor-portal'))
const AdminPortalFlow = lazy(() => import('./flows/admin-portal'))
const ChatScreenFlow = lazy(() => import('./flows/ai-waiter'))
const ArchitectureFlow = lazy(() => import('./flows/architecture'))

// Lazy load feature components
const HomeScreen = lazy(() => import('./features/home/components/HomeScreen').then(m => ({ default: m.HomeScreen })))
const VenueDiscovery = lazy(() => import('./features/explore/components/VenueDiscovery').then(m => ({ default: m.VenueDiscovery })))
const SettingsScreen = lazy(() => import('./features/profile/components/SettingsScreen').then(m => ({ default: m.SettingsScreen })))
// const OrdersScreen = lazy(() => import('./features/orders/components/OrdersScreen')) // TODO: Implement

function App() {
    return (
        <ThemeProvider defaultTheme="system" storageKey="dinein-ui-theme">
            <ErrorBoundary>
                <Suspense fallback={<AppShellSkeleton />}>
                    <Routes>
                        {/* Public/QR Routes */}
                        <Route path="/m/*" element={<QREntryFlow />} />

                        {/* Chat Route */}
                        <Route path="/chat" element={<ChatScreenFlow />} />
                        <Route path="/architecture" element={<ArchitectureFlow />} />

                        {/* Authentication Flows */}
                        <Route path="/login" element={<LoginScreen />} />
                        <Route path="/register" element={<RegisterScreen />} />

                        {/* Client PWA Routes (Wrapped in Bottom Navigation & Auth Protection) */}
                        <Route element={<ProtectedRoute allowedRoles={['client', 'admin', 'vendor']} />}>
                            <Route element={<ClientLayout />}>
                                <Route element={<PWAHomeFlow />}>
                                    <Route path="/" element={<HomeScreen />} />
                                    <Route path="/explore" element={<VenueDiscovery />} />
                                    <Route path="/orders" element={<div className="p-4 pt-20">Orders Coming Soon</div>} />
                                    <Route path="/profile" element={<SettingsScreen />} />
                                </Route>
                            </Route>
                        </Route>

                        {/* Vendor Portal - Protected */}
                        {/* Vendor Portal - Protected */}
                        <Route element={<ProtectedRoute allowedRoles={['vendor']} />}>
                            <Route path="/vendor" element={<VendorLayout />}>
                                <Route path="*" element={<VendorPortalFlow />} />
                            </Route>
                        </Route>

                        {/* Admin Portal - Protected */}
                        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                            <Route path="/admin" element={<AdminLayout />}>
                                <Route path="*" element={<AdminPortalFlow />} />
                            </Route>
                        </Route>

                        {/* Fallback */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </Suspense>
                <PWAInstallPrompt />
            </ErrorBoundary>
        </ThemeProvider>
    )
}

export default App
