import { LayoutDashboard, ShoppingBag, UtensilsCrossed, Grid3x3, Settings } from 'lucide-react';
import type { VendorTab } from './index';

interface VendorNavProps {
    activeTab: VendorTab;
    onTabChange: (tab: VendorTab) => void;
}

const tabs = [
    { id: 'dashboard' as VendorTab, icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'orders' as VendorTab, icon: ShoppingBag, label: 'Orders' },
    { id: 'menu' as VendorTab, icon: UtensilsCrossed, label: 'Menu' },
    { id: 'tables' as VendorTab, icon: Grid3x3, label: 'Tables' },
    { id: 'settings' as VendorTab, icon: Settings, label: 'Settings' },
];

export function VendorNav({ activeTab, onTabChange }: VendorNavProps) {
    return (
        <nav className="bottom-nav">
            <div className="flex justify-around items-center w-full max-w-md mx-auto">
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.id;
                    const Icon = tab.icon;

                    return (
                        <button
                            key={tab.id}
                            onClick={() => onTabChange(tab.id)}
                            className={`nav-item ${isActive ? 'nav-item-active' : 'nav-item-inactive'}`}
                        >
                            <Icon
                                className="nav-icon"
                                strokeWidth={isActive ? 2.5 : 2}
                            />
                            <span className="nav-label">
                                {tab.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </nav>
    );
}
