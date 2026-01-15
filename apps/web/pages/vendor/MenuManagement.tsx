import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVendorDashboardData } from '../../hooks/useVendorDashboardData';
import { useVendorMenuManager } from '../../hooks/useVendorMenuManager';
import { MenuItemRow } from '../../components/vendor/menu/MenuItemRow';
import { BulkActions } from '../../components/vendor/menu/BulkActions';
import { VendorMenuEditorSheet } from '../../components/vendor/VendorMenuEditorSheet';
import { toast } from 'react-hot-toast';
import { Spinner } from '../../components/Loading';
import { updateVenueMenu, getVenueById } from '../../services/databaseService';
import { supabase } from '../../services/supabase';
import { MenuItem } from '../../types';

const MenuManagement: React.FC = () => {
  const navigate = useNavigate();
  const {
    venue,
    setVenue,
    loading: venueLoading,
  } = useVendorDashboardData({ tab: 'menu' });

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
    menuSearch,
    setMenuSearch,
    menuFilterCategory,
    setMenuFilterCategory,
    menuFilterStatus,
    setMenuFilterStatus,
    menuCategories,
    handleAiImageAction,
    aiImageLoading,
    aiImagePrompt,
    setAiImagePrompt,
  } = useVendorMenuManager({ venue, setVenue });

  const [salesStats, setSalesStats] = useState<Record<string, number>>({});
  const [loadingSales, setLoadingSales] = useState(false);

  // Fetch sales statistics for today
  React.useEffect(() => {
    if (!venue?.id) return;

    const fetchSalesStats = async () => {
      setLoadingSales(true);
      try {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        const { data, error } = await supabase
          .from('order_items')
          .select('name_snapshot, qty, orders!inner(created_at, vendor_id)')
          .eq('orders.vendor_id', venue.id)
          .gte('orders.created_at', todayStart.toISOString());

        if (error) throw error;

        const stats: Record<string, number> = {};
        data?.forEach((item: any) => {
          const name = item.name_snapshot;
          stats[name] = (stats[name] || 0) + (item.qty || 1);
        });

        setSalesStats(stats);
      } catch (error) {
        console.error('Failed to fetch sales stats:', error);
      } finally {
        setLoadingSales(false);
      }
    };

    fetchSalesStats();
  }, [venue?.id]);

  const handleDisableAllSpecials = async () => {
    if (!venue) return;
    const specialItems = venue.menu.filter((item) =>
      item.tags?.includes('special') || item.tags?.includes('Special')
    );
    const updatedMenu = venue.menu.map((item) =>
      specialItems.some((si) => si.id === item.id) ? { ...item, available: false } : item
    );
    await updateVenueMenu(venue.id, updatedMenu);
    const updatedVenue = await getVenueById(venue.id);
    if (updatedVenue) setVenue(updatedVenue);
    toast.success('All specials disabled');
  };

  const handleEnableAllItems = async () => {
    if (!venue) return;
    const updatedMenu = venue.menu.map((item) => ({ ...item, available: true }));
    await updateVenueMenu(venue.id, updatedMenu);
    const updatedVenue = await getVenueById(venue.id);
    if (updatedVenue) setVenue(updatedVenue);
    toast.success('All items enabled');
  };

  const handleToggleAvailability = (item: MenuItem) => {
    // Optimistic update
    if (venue) {
      const updatedMenu = venue.menu.map((i) =>
        i.id === item.id ? { ...i, available: !i.available } : i
      );
      setVenue({ ...venue, menu: updatedMenu });
    }
    // Call the actual toggle function
    toggleItemAvailability({} as any, item);
  };

  if (venueLoading || !venue) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Spinner className="w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-safe-top pb-32 flex flex-col">
      {/* Header */}
      <div className="bg-surface border-b border-border px-6 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <button
              onClick={() => navigate('/vendor/live')}
              className="text-muted hover:text-foreground transition-colors mb-2"
              aria-label="Back to live dashboard"
            >
              ← Back to Live
            </button>
            <h1 className="text-xl font-bold text-foreground">Menu Management</h1>
          </div>
          <button
            onClick={openNewItem}
            className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-semibold transition-colors touch-target"
            aria-label="Add new menu item"
          >
            + Add Item
          </button>
        </div>

        {/* Search and Filters */}
        <div className="space-y-3">
          <input
            type="search"
            value={menuSearch}
            onChange={(e) => setMenuSearch(e.target.value)}
            placeholder="Search menu items..."
            className="w-full rounded-xl border border-border bg-surface-highlight px-4 py-2 text-sm text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500"
          />
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {menuCategories.map((category) => (
              <button
                key={category}
                onClick={() => setMenuFilterCategory(category)}
                className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold border transition ${
                  menuFilterCategory === category
                    ? 'bg-primary-500 text-white border-primary-500'
                    : 'bg-surface-highlight text-muted border-border hover:text-foreground'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            {['all', 'active', 'hidden'].map((status) => (
              <button
                key={status}
                onClick={() => setMenuFilterStatus(status as any)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold border transition ${
                  menuFilterStatus === status
                    ? 'bg-secondary-500 text-white border-secondary-500'
                    : 'bg-surface-highlight text-muted border-border hover:text-foreground'
                }`}
              >
                {status === 'all' ? 'All' : status === 'active' ? 'Active' : 'Hidden'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Bulk Actions */}
        <BulkActions
          onDisableAllSpecials={handleDisableAllSpecials}
          onEnableAllItems={handleEnableAllItems}
        />

        {/* Menu Items */}
        {loadingSales && (
          <div className="text-center text-muted py-4">
            <Spinner className="w-4 h-4 inline-block mr-2" />
            Loading sales data...
          </div>
        )}
        <div className="space-y-3">
          {filteredMenuItems.length === 0 ? (
            <div className="text-center text-muted py-16">
              <div className="text-4xl mb-2">🍽️</div>
              <p>No menu items found</p>
            </div>
          ) : (
            filteredMenuItems.map((item) => (
              <MenuItemRow
                key={item.id}
                item={item}
                salesCount={salesStats[item.name] || 0}
                onToggleAvailability={handleToggleAvailability}
                onEdit={openEditItem}
              />
            ))
          )}
        </div>
      </div>

      {/* Menu Editor Modal */}
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

export default MenuManagement;
