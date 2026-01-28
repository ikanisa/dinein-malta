import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { VenueLayout } from './layouts/VenueLayout'
import Home from './pages/Home'
import VenueMenu from './pages/VenueMenu'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import OrderStatus from './pages/OrderStatus'
import Settings from './pages/Settings'
import UIPlanDemo from './pages/UIPlanDemo'
import { Toaster } from 'sonner'
import { useA2HS, ErrorBoundary, IOSInstallSheet } from '@dinein/ui'
import { useEffect } from 'react'
import { toast } from 'sonner'
import { Download } from 'lucide-react'
import { SessionProvider } from './context/SessionContext'
import OfflineBanner from './components/OfflineBanner'

function App() {
    const {
        isReady,
        install,
        isIOSReady,
        showIOSSheet,
        openIOSSheet,
        closeIOSSheet
    } = useA2HS()

    // Show native install prompt (Chrome/Edge/etc)
    useEffect(() => {
        if (isReady) {
            toast('Install DineIn for a better experience', {
                action: { label: 'Install', onClick: install },
                icon: <Download className="h-4 w-4" />,
                duration: 10000,
            })
        }
    }, [isReady, install])

    // Show iOS install instructions
    useEffect(() => {
        if (isIOSReady) {
            openIOSSheet()
        }
    }, [isIOSReady, openIOSSheet])

    return (
        <ErrorBoundary>
            <SessionProvider>
                <BrowserRouter>
                    <Toaster position="bottom-center" />
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/home" element={<Navigate to="/" replace />} />
                        <Route path="/settings" element={<Settings />} />
                        <Route path="/ui-plan-demo" element={<UIPlanDemo />} />

                        <Route path="/v/:slug" element={<VenueLayout />}>
                            <Route index element={<VenueMenu />} />
                            <Route path="cart" element={<Cart />} />
                            <Route path="checkout" element={<Checkout />} />
                            <Route path="orders/:orderId" element={<OrderStatus />} />
                            {/* Settings can also be accessed from venue context */}
                            <Route path="settings" element={<Settings />} />
                        </Route>

                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>

                    {/* iOS Safari install sheet */}
                    <IOSInstallSheet
                        isOpen={showIOSSheet}
                        onClose={closeIOSSheet}
                        appName="DineIn"
                    />

                    {/* Offline indicator */}
                    <OfflineBanner />
                </BrowserRouter>
            </SessionProvider>
        </ErrorBoundary>
    )
}

export default App

