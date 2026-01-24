import { useState } from 'react';
import { VendorDashboard } from './VendorDashboard';
import { OrdersScreen } from './OrdersScreen';
import { MenuManagement } from './MenuManagement';
import { TableManagement } from './TableManagement';
import { VendorSettings } from './VendorSettings';
import { VendorNav } from './VendorNav';
import { RingAlertOverlay } from './RingAlertOverlay';
import { useWaiterRings } from '../../hooks/useWaiterRings';

export type VendorTab = 'dashboard' | 'orders' | 'menu' | 'tables' | 'settings';

export default function VendorPortalFlow() {
    const [activeTab, setActiveTab] = useState<VendorTab>('dashboard');
    const { newRingReceived, clearNewRing, acknowledgeRing } = useWaiterRings();

    const renderScreen = () => {
        switch (activeTab) {
            case 'dashboard':
                return <VendorDashboard />;
            case 'orders':
                return <OrdersScreen />;
            case 'menu':
                return <MenuManagement />;
            case 'tables':
                return <TableManagement />;
            case 'settings':
                return <VendorSettings />;
            default:
                return <VendorDashboard />;
        }
    };

    return (
        <div className="min-h-screen bg-slate-50">
            {renderScreen()}
            <VendorNav activeTab={activeTab} onTabChange={setActiveTab} />

            {/* Ring Alert Overlay - Shows when new ring arrives */}
            {newRingReceived && (
                <RingAlertOverlay
                    ring={newRingReceived}
                    onAcknowledge={() => acknowledgeRing(newRingReceived.id)}
                    onDismiss={clearNewRing}
                />
            )}
        </div>
    );
}
