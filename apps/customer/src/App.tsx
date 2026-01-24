import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { VenueLayout } from './layouts/VenueLayout'
import Home from './pages/Home'
import VenueMenu from './pages/VenueMenu'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import OrderStatus from './pages/OrderStatus'
import Settings from './pages/Settings'
import { Toaster } from 'sonner'
import { useA2HS, ErrorBoundary } from '@dinein/ui'
import { useEffect } from 'react'
import { toast } from 'sonner'
import { Download } from 'lucide-react'

function App() {
    const { isReady, install } = useA2HS()

    useEffect(() => {
        if (isReady) {
            toast('Install DineIn for a better experience', {
                action: { label: 'Install', onClick: install },
                icon: <Download className="h-4 w-4" />,
                duration: 10000,
            })
        }
    }, [isReady, install])

    return (
        <ErrorBoundary>
            <BrowserRouter>
                <Toaster position="bottom-center" />
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/home" element={<Navigate to="/" replace />} />
                    <Route path="/settings" element={<Settings />} />

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
            </BrowserRouter>
        </ErrorBoundary>
    )
}

export default App

