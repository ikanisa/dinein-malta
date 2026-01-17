import React from 'react';
import { motion } from 'framer-motion';

interface VendorNavTabsProps {
  activeTab: string;
  onNavigate: (tab: string) => void;
}

const tabs = [
  { key: 'orders', label: 'Orders', icon: '🔔' },
  { key: 'menu', label: 'Menu', icon: '🍔' },
  { key: 'tables', label: 'Tables', icon: '🏁' },
  { key: 'reservations', label: 'Bookings', icon: '📅' },
  { key: 'settings', label: 'Settings', icon: '⚙️' },
];

export const VendorNavTabs: React.FC<VendorNavTabsProps> = ({ activeTab, onNavigate }) => {
  return (
    <div className="flex bg-glass backdrop-blur-lg border-b border-glassBorder sticky top-0 z-40 overflow-x-auto no-scrollbar shadow-sm">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        return (
          <button
            key={tab.key}
            onClick={() => onNavigate(tab.key)}
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-all relative
        ${isActive ? 'text-primary-600' : 'text-muted hover:text-foreground'}`}
          >
            <span className="text-lg block mb-1">{tab.icon}</span>
            <span className="relative z-10">{tab.label}</span>
            {isActive && (
              <motion.div
                layoutId="activeTabIndicator"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500"
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
};
