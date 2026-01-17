import React, { useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { VendorNavTabs } from '../components/vendor/VendorNavTabs';
import { VendorOrdersTab } from '../components/vendor/VendorOrdersTab';
import { VendorMenuTab } from '../components/vendor/VendorMenuTab';
import { VendorMenuEditorSheet } from '../components/vendor/VendorMenuEditorSheet';
import { VendorTablesTab } from '../components/vendor/VendorTablesTab';
import { VendorReservationsTab } from '../components/vendor/VendorReservationsTab';
import { VendorSettingsTab } from '../components/vendor/VendorSettingsTab';
import { useVendorDashboardData } from '../hooks/useVendorDashboardData';
import { useVendorMenuManager } from '../hooks/useVendorMenuManager';
import {
    updateOrderStatus,
    updatePaymentStatus, updateVenue, updateTableStatus
} from '../services/databaseService';
import { OrderStatus, Venue, PaymentStatus, Table } from '../types';
import { toast } from 'react-hot-toast';

// --- MAIN DASHBOARD ---

const VendorDashboard = () => {
    const { tab = 'orders' } = useParams<{ tab: string }>();
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const {
        venue,
        setVenue,
        orders,
        setOrders,
        tables,
        reservations,
        qrCodes,
        loading,
        refreshData
    } = useVendorDashboardData({ tab });

    // UI State
    const {
        menuModalOpen,
        editingItem,
        setEditingItem,
        openNewItem,
        openEditItem,
        closeMenuModal,
        saveMenuItem,
        toggleItemAvailability,
        filteredMenuItems,
        isProcessingMenu,
        handleFileUpload,
        aiImageLoading,
        aiImagePrompt,
        setAiImagePrompt,
        handleAiImageAction,
        parsedItems,
        generatingImages,
        generateImagesForImport,
        confirmImport,
        isImporting,
        menuSearch,
        setMenuSearch,
        menuFilterCategory,
        setMenuFilterCategory,
        menuFilterStatus,
        setMenuFilterStatus,
        menuFilterTag,
        setMenuFilterTag,
        menuCategories,
        menuTags
    } = useVendorMenuManager({ venue, setVenue });

    const updateOrder = async (id: string, status: OrderStatus) => {
        const promise = updateOrderStatus(id, status);
        toast.promise(promise, {
            loading: 'Updating order...',
            success: `Order ${status.toLowerCase()}!`,
            error: 'Failed to update'
        });
        await promise;
        setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
    };

    const updatePayment = async (id: string) => {
        await updatePaymentStatus(id, PaymentStatus.PAID);
        toast.success('Payment marked as received');
        setOrders(prev => prev.map(o => o.id === id ? { ...o, paymentStatus: PaymentStatus.PAID } : o));
    };

    const handleToggleTable = async (t: Table) => {
        await updateTableStatus(t.id, !t.active);
        refreshData();
    };

    const handleSmartImport = () => {
        fileInputRef.current?.click();
    };

    const handleSaveVenue = async () => {
        if (!venue) return;
        await updateVenue(venue);
        toast.success('Venue settings saved');
    };

    const handleVenueChange = (nextVenue: Venue) => {
        setVenue(nextVenue);
    };

    const handleTabNavigate = (nextTab: string) => {
        navigate(`/vendor-dashboard/${nextTab}`);
    };

    // Loading skeleton for vendor dashboard
    const VendorSkeleton = () => (
        <div className="min-h-screen bg-background pt-safe-top pb-32 flex flex-col animate-fade-in">
            <div className="bg-surface border-b border-border px-6 py-4">
                <div className="h-6 w-40 shimmer-enhanced rounded mb-2" />
                <div className="h-3 w-16 shimmer-enhanced rounded" />
            </div>
            <div className="flex gap-2 p-4 overflow-x-auto">
                {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="h-10 w-20 shimmer-enhanced rounded-lg flex-shrink-0" />
                ))}
            </div>
            <div className="flex-1 p-4 space-y-4">
                {[1, 2, 3].map(i => (
                    <div key={i} className="h-24 shimmer-enhanced rounded-xl" />
                ))}
            </div>
        </div>
    );

    if (!venue) {
        if (loading) {
            return <VendorSkeleton />;
        }
        // Import EmptyState dynamically to avoid circular deps
        const EmptyState = React.lazy(() => import('../components/ui/EmptyState'));
        return (
            <div className="min-h-screen flex items-center justify-center p-6 bg-background animate-fade-in">
                <React.Suspense fallback={<VendorSkeleton />}>
                    <EmptyState
                        icon="🏪"
                        title="Loading Vendor Portal"
                        description="Please wait while we fetch your venue data..."
                        size="lg"
                    />
                </React.Suspense>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background pt-safe-top pb-32 flex flex-col transition-colors duration-500">
            <div className="bg-surface border-b border-border px-6 py-4">
                <h1 className="text-xl font-bold text-foreground">{venue.name}</h1>
                <p className="text-xs text-green-500">● Live</p>
            </div>

            <VendorNavTabs activeTab={tab} onNavigate={handleTabNavigate} />

            <div id="vendor-scroll" className="flex-1 overflow-y-auto">
                {tab === 'orders' && (
                    <VendorOrdersTab
                        orders={orders}
                        onRefresh={refreshData}
                        onUpdateOrder={updateOrder}
                        onUpdatePayment={updatePayment}
                    />
                )}

                {tab === 'menu' && (
                    <VendorMenuTab
                        menuItems={filteredMenuItems}
                        isProcessingMenu={isProcessingMenu}
                        fileInputRef={fileInputRef}
                        onManualAdd={openNewItem}
                        onSmartImport={handleSmartImport}
                        onFileChange={handleFileUpload}
                        onEditItem={openEditItem}
                        onToggleItemAvailability={toggleItemAvailability}
                        searchValue={menuSearch}
                        onSearchChange={setMenuSearch}
                        categories={menuCategories}
                        activeCategory={menuFilterCategory}
                        onCategoryChange={setMenuFilterCategory}
                        statusFilter={menuFilterStatus}
                        onStatusFilterChange={setMenuFilterStatus}
                        tags={menuTags}
                        activeTag={menuFilterTag}
                        onTagChange={setMenuFilterTag}
                        parsedItems={parsedItems}
                        generatingImages={generatingImages}
                        onGenerateImages={generateImagesForImport}
                        onConfirmImport={confirmImport}
                        isImporting={isImporting}
                    />
                )}

                {/* Tables and Settings Tabs content wrapped in p-4 to maintain padding logic inside scroll area */}
                {(tab === 'tables' || tab === 'reservations' || tab === 'settings') && (
                    <div className="p-4 space-y-6 pb-24">
                        {/* Content for these tabs is identical to original, just ensuring wrapper */}
                        {tab === 'tables' && (
                            <VendorTablesTab tables={tables} qrCodes={qrCodes} onToggleTable={handleToggleTable} />
                        )}

                        {tab === 'reservations' && (
                            <VendorReservationsTab reservations={reservations} />
                        )}

                        {tab === 'settings' && (
                            <VendorSettingsTab
                                venue={venue}
                                onVenueChange={handleVenueChange}
                                onSave={handleSaveVenue}
                            />
                        )}
                    </div>
                )}
            </div>

            {/* --- MENU MODAL (Edit) --- */}
            <VendorMenuEditorSheet
                isOpen={menuModalOpen}
                title={editingItem.id?.startsWith('new') ? 'New Item' : 'Edit Item'}
                editingItem={editingItem}
                onChange={setEditingItem}
                onClose={closeMenuModal}
                onSave={saveMenuItem}
                onGenerateImage={handleAiImageAction}
                isGeneratingImage={aiImageLoading}
                aiImagePrompt={aiImagePrompt}
                onAiPromptChange={setAiImagePrompt}
            />
        </div>
    );
};

export default VendorDashboard;
