import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { VendorDashboard } from './VendorDashboard';
import { OrdersScreen } from './OrdersScreen';
import { MenuManagement } from './MenuManagement';
import { TableManagement } from './TableManagement';
import { VendorSettings } from './VendorSettings';
import { RingAlertOverlay } from './RingAlertOverlay';
import { useWaiterRings } from '../../hooks/useWaiterRings';
import { VendorLogin } from './VendorLogin';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function VendorPortalFlow() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const { newRingReceived, clearNewRing, acknowledgeRing } = useWaiterRings();

    if (!isAuthenticated) {
        return (
            <VendorLogin
                onLogin={() => setIsAuthenticated(true)}
                onBack={() => window.location.href = '/'}
            />
        );
    }

    return (
        <>
            <Routes>
                <Route element={<DashboardLayout type="vendor" userName="Staff Member" onLogout={() => setIsAuthenticated(false)} />}>
                    <Route index element={<VendorDashboard />} />
                    <Route path="orders" element={<OrdersScreen />} />
                    <Route path="menu" element={<MenuManagement />} />
                    <Route path="tables" element={<TableManagement />} />
                    <Route path="settings" element={<VendorSettings />} />
                    <Route path="*" element={<Navigate to="." replace />} />
                </Route>
            </Routes>

            {/* Ring Alert Overlay - Shows when new ring arrives */}
            {newRingReceived && (
                <RingAlertOverlay
                    ring={newRingReceived}
                    onAcknowledge={() => acknowledgeRing(newRingReceived.id)}
                    onDismiss={clearNewRing}
                />
            )}
        </>
    );
}
