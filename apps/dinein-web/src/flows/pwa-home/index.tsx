import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { VenueDetails } from '@/features/explore/components/VenueDetails';
import { BottomNav, TabId } from '@/shared/components/BottomNav';
import { QRScannerModal } from '@/shared/components/QRScannerModal';
import { NotificationsPanel } from '@/shared/components/NotificationsPanel';
import { StatusHeader } from '@/components/layout/StatusHeader';

import { CartScreen } from '@/features/orders/components/CartScreen';
import { CheckoutScreen } from '@/components/screens/CheckoutScreen';
import { OrderTrackingScreen } from '@/components/screens/OrderTrackingScreen';
import { useOfflineCart } from '@/hooks/useOfflineCart';
import { orders } from '@/shared/services/orders';

export default function PWAHomeFlow() {
    const navigate = useNavigate();
    const location = useLocation();
    const [activeTab, setActiveTab] = useState<TabId>('home');
    const [selectedVenue, setSelectedVenue] = useState<any>(null);
    const [showQRScanner, setShowQRScanner] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [showCart, setShowCart] = useState(false);
    const [showCheckout, setShowCheckout] = useState(false);
    const [showTracking, setShowTracking] = useState(false);

    // Mock active order for tracking demo
    const [activeOrder, setActiveOrder] = useState<any>(null);

    const { items: cartItems, clearCart } = useOfflineCart();

    // Sync Active Tab with URL
    useEffect(() => {
        const path = location.pathname;
        if (path === '/' || path === '/home') setActiveTab('home');
        else if (path.startsWith('/explore')) setActiveTab('discover');
        else if (path.startsWith('/orders')) setActiveTab('orders'); // Assuming orders tab exists later
        else if (path.startsWith('/profile')) setActiveTab('profile');
    }, [location.pathname]);

    const handleTabChange = (tab: TabId) => {
        setActiveTab(tab);
        if (tab === 'home') navigate('/');
        else if (tab === 'discover') navigate('/explore');
        else if (tab === 'orders') navigate('/orders');
        else if (tab === 'profile') navigate('/profile');
    };

    const handleQRScan = (venueSlug: string, tableCode: string) => {
        window.location.href = `/m/${venueSlug}/${tableCode}`;
    };

    return (
        <div className="max-w-md mx-auto bg-white dark:bg-slate-950 min-h-screen relative overflow-hidden">
            <StatusHeader
                showLocation={true}
                className="fixed top-0 left-0 right-0 z-40 transition-opacity duration-300"
                notificationCount={3} // Mock for now
                onNotificationClick={() => setShowNotifications(true)}
                style={{ opacity: selectedVenue ? 0 : 1, pointerEvents: selectedVenue ? 'none' : 'auto' }}
            />

            {/* Main Content - Add top padding for header */}
            <div className={`pt-14 transition-all duration-500 ${selectedVenue ? 'scale-95 opacity-50' : ''}`}>
                {/* TEMP: Design System Verification - Only show on Home for now or keep generic? 
                    Keep it here for now or maybe move to Home component? 
                    Let's keep it here but maybe conditionally render?
                    Actually, it takes space. Let's Remove it from Layout and put it in HomeScreen if needed.
                    Or just keep it as part of layout for demo purity.
                */}

                <Outlet context={{ setSelectedVenue }} />

            </div>

            {/* Details Overlay with Shared Element Transition */}
            <AnimatePresence>
                {selectedVenue && (
                    <VenueDetails
                        venue={selectedVenue}
                        onBack={() => setSelectedVenue(null)}
                    />
                )}
            </AnimatePresence>

            {/* Bottom Navigation */}
            <div className={`transition-transform duration-300 ${selectedVenue ? 'translate-y-full' : 'translate-y-0'}`}>
                <BottomNav
                    activeTab={activeTab}
                    onTabChange={handleTabChange}
                    cartCount={cartItems.length}
                    onCartClick={() => setShowCart(true)}
                />
            </div>

            {/* Cart Screen Overlay */}
            {showCart && (
                <div className="fixed inset-0 z-50">
                    <CartScreen
                        onBack={() => setShowCart(false)}
                        onCheckout={() => {
                            setShowCart(false);
                            setShowCheckout(true);
                        }}
                    />
                </div>
            )}

            {/* Checkout Screen Overlay */}
            {showCheckout && (
                <div className="fixed inset-0 z-50">
                    <CheckoutScreen
                        items={cartItems}
                        venueName="DineIn Orders"
                        onBack={() => setShowCheckout(false)}
                        onPlaceOrder={async (details) => {
                            try {
                                const order = await orders.createOrder({
                                    venue_id: 'dinein-delivery', // hardcoded for PWA/Delivery mode
                                    // table_code: undefined, 
                                    items: cartItems.map(i => ({
                                        name: i.name,
                                        quantity: i.quantity,
                                        price: i.price,
                                    })),
                                    total: cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0),
                                    payment_method: details.paymentMethod,
                                    notes: details.notes
                                });

                                // Create mock active order state from real response
                                setActiveOrder({
                                    orderNumber: parseInt(order?.order_code || '0000'),
                                    items: [...cartItems],
                                    total: cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0),
                                    status: 'pending',
                                    createdAt: new Date()
                                });

                                clearCart();
                                setShowCheckout(false);
                                setShowTracking(true);
                            } catch (e) {
                                console.error('Failed to place order', e);
                                alert('Failed to place order');
                            }
                        }}
                    />
                </div>
            )}

            {/* Tracking Screen Overlay */}
            {showTracking && activeOrder && (
                <div className="fixed inset-0 z-50 bg-white">
                    <OrderTrackingScreen
                        orderId="mock-id"
                        orderNumber={activeOrder.orderNumber}
                        venueName="DineIn Delivery"
                        items={activeOrder.items}
                        total={activeOrder.total}
                        status={activeOrder.status}
                        createdAt={activeOrder.createdAt}
                        onGoHome={() => setShowTracking(false)}
                        onNewOrder={() => setShowTracking(false)}
                    />
                </div>
            )}

            {/* QR Scanner Modal */}
            <QRScannerModal
                isOpen={showQRScanner}
                onClose={() => setShowQRScanner(false)}
                onScan={handleQRScan}
            />

            {/* Notifications Panel */}
            <NotificationsPanel
                isOpen={showNotifications}
                onClose={() => setShowNotifications(false)}
            />
        </div>
    );
}
