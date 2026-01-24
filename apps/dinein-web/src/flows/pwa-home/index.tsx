import { useState, useEffect } from 'react';
import { HomeScreen } from './HomeScreen';
import { VenueDiscovery } from './VenueDiscovery';
import { Reservations } from './Reservations';
import { SettingsScreen } from './SettingsScreen';
import { BottomNav, TabId } from '@/shared/components/BottomNav';
import { QRScannerModal } from '@/shared/components/QRScannerModal';
import { NotificationsPanel } from '@/shared/components/NotificationsPanel';
import { StatusHeader } from '@/components/layout/StatusHeader';

export default function PWAHomeFlow() {
    const [activeTab, setActiveTab] = useState<TabId>('home');
    const [showQRScanner, setShowQRScanner] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [selectedCountry, setSelectedCountry] = useState<string>(
        () => localStorage.getItem('dinein_country_code') || 'MT'
    );
    const [cartCount] = useState(0);

    // Sync country changes
    useEffect(() => {
        const handleCountryChange = () => {
            setSelectedCountry(localStorage.getItem('dinein_country_code') || 'MT');
        };
        window.addEventListener('country-change', handleCountryChange);
        return () => window.removeEventListener('country-change', handleCountryChange);
    }, []);

    const handleQRScan = (venueSlug: string, tableCode: string) => {
        window.location.href = `/m/${venueSlug}/${tableCode}`;
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'home':
                return <HomeScreen />;
            case 'discover':
                return <VenueDiscovery />;
            case 'reservations':
                return <Reservations />;
            case 'profile':
                return (
                    <SettingsScreen
                        selectedCountry={selectedCountry}
                        onCountryChange={(code) => {
                            setSelectedCountry(code);
                            localStorage.setItem('dinein_country_code', code);
                        }}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <div className="max-w-md mx-auto bg-white min-h-screen relative">
            <StatusHeader
                showLocation={true}
                className="fixed top-0 left-0 right-0 z-40"
                notificationCount={3} // Mock for now
                onNotificationClick={() => setShowNotifications(true)}
            />

            {/* Main Content - Add top padding for header */}
            <div className="pt-14">
                {renderContent()}
            </div>

            {/* Bottom Navigation */}
            <BottomNav
                activeTab={activeTab}
                onTabChange={setActiveTab}
                cartCount={cartCount}
                onCartClick={() => {
                    console.log('Open cart');
                }}
            />

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
