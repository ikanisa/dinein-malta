import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GlassCard } from '../components/GlassCard';
import { ProfileSkeleton } from '../components/ProfileSkeleton';
import { getMyProfile, updateMyProfile } from '../services/databaseService';
import { getOrderById } from '../services/databaseService';
import { User, Order, OrderStatus } from '../types';
import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';
import { MenuItem } from '../types';

const SettingsPage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [orderHistory, setOrderHistory] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { favorites, removeFavorite } = useCart();

  useEffect(() => {
    const loadData = async () => {
      try {
        const u = await getMyProfile();
        setUser(u);
        
        // Load order history from localStorage
        const stored = localStorage.getItem('my_orders_ids');
        if (stored) {
          try {
            const orderIds: string[] = JSON.parse(stored);
            const orders = await Promise.all(
              orderIds.slice(0, 20).map(id => getOrderById(id).catch(() => null))
            );
            const validOrders = orders.filter((o): o is Order => o !== null);
            setOrderHistory(validOrders.sort((a, b) => b.timestamp - a.timestamp));
          } catch (error) {
            console.warn('Failed to load order history', error);
          }
        }
      } catch (error) {
        console.error('Failed to load profile:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const toggleNotify = async () => {
    if (user) {
      const updated = await updateMyProfile({ notificationsEnabled: !user.notificationsEnabled });
      setUser(updated);
    }
  };

  const updateName = async (name: string) => {
    if (user) {
      setUser({ ...user, name });
    }
  };

  const saveName = async () => {
    if (user) {
      await updateMyProfile({ name: user.name });
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined });
    }
  };

  if (isLoading || !user) {
    return <ProfileSkeleton />;
  }

  return (
    <div className="min-h-screen pb-24 bg-background animate-fade-in pt-safe-top">
      {/* Header */}
      <div className="sticky top-0 z-40 px-6 pt-12 pb-4 bg-glass border-b border-glassBorder backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-surface-highlight flex items-center justify-center text-foreground active:scale-95 transition-transform"
            aria-label="Go back"
          >
            ←
          </button>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* User Profile Section */}
        <GlassCard className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-secondary-500 to-primary-500 flex items-center justify-center text-2xl font-bold text-white">
            {user.name ? user.name.charAt(0).toUpperCase() : '?'}
          </div>
          <div className="flex-1">
            <label className="text-xs text-muted block mb-1">Display Name</label>
            <input
              type="text"
              value={user.name || ''}
              onChange={e => updateName(e.target.value)}
              onBlur={saveName}
              className="bg-transparent border-b border-border w-full focus:outline-none focus:border-secondary-500 py-1 font-bold text-foreground"
              placeholder="Your name"
            />
          </div>
        </GlassCard>

        {/* Order History Section */}
        <section>
          <h2 className="text-lg font-bold mb-4 text-foreground">ORDER HISTORY</h2>
          {orderHistory.length === 0 ? (
            <GlassCard className="p-6 text-center">
              <p className="text-muted text-sm">No orders yet. Start ordering to see your history here.</p>
            </GlassCard>
          ) : (
            <div className="space-y-3">
              {orderHistory.map(order => (
                <GlassCard
                  key={order.id}
                  onClick={() => navigate(`/order/${order.id}`)}
                  className="flex justify-between items-center p-4 cursor-pointer active:scale-95 transition-transform"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-foreground">Order {order.orderCode}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        order.status === OrderStatus.SERVED 
                          ? 'bg-green-500/20 text-green-600'
                          : order.status === OrderStatus.CANCELLED
                          ? 'bg-red-500/20 text-red-600'
                          : 'bg-yellow-500/20 text-yellow-600'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                    <div className="text-xs text-muted">{formatDate(order.timestamp)}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-foreground">€{order.totalAmount.toFixed(2)}</div>
                    <div className="text-xs text-muted">{order.items.length} item{order.items.length !== 1 ? 's' : ''}</div>
                  </div>
                </GlassCard>
              ))}
            </div>
          )}
        </section>

        {/* Preferences Section */}
        <section>
          <h2 className="text-lg font-bold mb-4 text-foreground">PREFERENCES</h2>
          <GlassCard className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <span className="block font-medium text-foreground">🌱 Dietary Restrictions</span>
                <span className="text-xs text-muted">Filter menu items by dietary needs</span>
              </div>
              <button
                onClick={() => {/* TODO: Implement dietary filters modal */}}
                className="text-sm text-primary-600 font-medium"
              >
                Edit
              </button>
            </div>
            
            <div className="border-t border-border pt-4 flex justify-between items-center">
              <span className="font-medium text-foreground">🌐 Language</span>
              <select
                defaultValue="en"
                className="bg-surface-highlight border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-secondary-500"
              >
                <option value="en">English</option>
                <option value="mt">Maltese</option>
              </select>
            </div>

            <div className="border-t border-border pt-4 flex justify-between items-center">
              <span className="font-medium text-foreground">{theme === 'dark' ? '🌑' : '☀️'} Dark Mode</span>
              <button
                onClick={toggleTheme}
                className={`w-12 h-6 rounded-full p-1 transition-colors ${theme === 'dark' ? 'bg-secondary-500' : 'bg-gray-400'}`}
                aria-label="Toggle dark mode"
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${theme === 'dark' ? 'translate-x-6' : ''}`} />
              </button>
            </div>

            <div className="border-t border-border pt-4 flex justify-between items-center">
              <span className="font-medium text-foreground">🔔 Push Notifications</span>
              <button
                onClick={toggleNotify}
                className={`w-12 h-6 rounded-full p-1 transition-colors ${user.notificationsEnabled ? 'bg-green-500' : 'bg-gray-600'}`}
                aria-label="Toggle notifications"
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${user.notificationsEnabled ? 'translate-x-6' : ''}`} />
              </button>
            </div>
          </GlassCard>
        </section>

        {/* Saved Favorites Section */}
        <section>
          <h2 className="text-lg font-bold mb-4 text-foreground">SAVED FAVORITES ({favorites.length})</h2>
          {favorites.length === 0 ? (
            <GlassCard className="p-6 text-center">
              <p className="text-muted text-sm">No favorites yet. Tap the star icon on menu items to save them.</p>
            </GlassCard>
          ) : (
            <div className="space-y-2">
              {favorites.map((item: MenuItem) => (
                <GlassCard
                  key={item.id}
                  className="flex justify-between items-center p-3"
                >
                  <div className="flex-1">
                    <div className="font-bold text-foreground">{item.name}</div>
                    {item.description && (
                      <div className="text-xs text-muted line-clamp-1">{item.description}</div>
                    )}
                  </div>
                  <button
                    onClick={() => removeFavorite(item.id)}
                    className="ml-4 text-2xl active:scale-90 transition-transform"
                    aria-label={`Remove ${item.name} from favorites`}
                  >
                    ❤️
                  </button>
                </GlassCard>
              ))}
            </div>
          )}
        </section>

        {/* About Section */}
        <section>
          <h2 className="text-lg font-bold mb-4 text-foreground">ABOUT</h2>
          <GlassCard className="space-y-3">
            <button
              onClick={() => {/* TODO: Open Terms of Service */}}
              className="w-full text-left py-3 border-b border-border text-foreground hover:text-primary-600 transition-colors"
            >
              Terms of Service
            </button>
            <button
              onClick={() => {/* TODO: Open Privacy Policy */}}
              className="w-full text-left py-3 border-b border-border text-foreground hover:text-primary-600 transition-colors"
            >
              Privacy Policy
            </button>
            <div className="pt-3 text-xs text-muted text-center">
              App Version 2.0
            </div>
          </GlassCard>
        </section>
      </div>
    </div>
  );
};

export default SettingsPage;
