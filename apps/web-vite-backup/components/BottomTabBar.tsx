/**
 * BottomTabBar Component
 * Mobile-first bottom navigation for client-facing pages
 * Provides quick access to primary actions with touch-friendly design
 */

import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { hapticSelection } from '../utils/haptics';

interface TabItem {
    icon: React.ReactNode;
    activeIcon?: React.ReactNode;
    label: string;
    path: string;
    badge?: number;
}

interface BottomTabBarProps {
    /** Override default tabs */
    tabs?: TabItem[];
    /** Cart item count for badge */
    cartCount?: number;
    /** Current venue ID for menu navigation */
    venueId?: string;
    /** Whether to show the tab bar */
    visible?: boolean;
}

// Default home icon
const HomeIcon = ({ active }: { active: boolean }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill={active ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
);

// Settings/Profile icon
const SettingsIcon = ({ active }: { active: boolean }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill={active ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <circle cx="12" cy="12" r="3" />
        <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
);

export const BottomTabBar: React.FC<BottomTabBarProps> = ({
    tabs,
    cartCount = 0, // Kept for prop compatibility but unused in logic
    // venueId, // Unused
    visible = true,

}) => {
    const navigate = useNavigate();
    const location = useLocation();

    // Default tabs for client experience
    const defaultTabs: TabItem[] = [
        {
            icon: <HomeIcon active={false} />,
            activeIcon: <HomeIcon active={true} />,
            label: 'Home',
            path: '/',
        },
        {
            icon: <SettingsIcon active={false} />,
            activeIcon: <SettingsIcon active={true} />,
            label: 'Settings',
            path: '/settings',
            badge: cartCount > 0 ? cartCount : undefined // Show badge on Settings if there are cart items
        },
    ];

    const activeTabs = tabs || defaultTabs;

    const isActive = (path: string) => {
        if (path === '/') {
            return location.pathname === '/' || location.pathname === '';
        }
        return location.pathname.startsWith(path.split('#')[0]);
    };

    const handleTabPress = (tab: TabItem) => {
        hapticSelection();

        // Handle hash navigation for cart
        if (tab.path.includes('#cart')) {
            // Scroll to cart or toggle cart modal
            const cartElement = document.getElementById('cart');
            if (cartElement) {
                cartElement.scrollIntoView({ behavior: 'smooth' });
            } else {
                navigate(tab.path.split('#')[0]);
            }
        } else {
            navigate(tab.path);
        }
    };

    if (!visible) return null;

    return (
        <nav
            className="fixed bottom-0 left-0 right-0 z-50"
            role="navigation"
            aria-label="Main navigation"
            style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
        >
            {/* Glass background */}
            <div className="absolute inset-0 bg-glass/95 backdrop-blur-xl border-t border-white/10 shadow-lg" />

            {/* Tab items */}
            <div className="relative flex justify-around items-center px-2 py-2">
                {activeTabs.map((tab) => {
                    const active = isActive(tab.path);
                    return (
                        <motion.button
                            key={tab.path + tab.label}
                            onClick={() => handleTabPress(tab)}
                            whileTap={{ scale: 0.9 }}
                            className={`relative flex flex-col items-center justify-center min-w-[64px] min-h-[48px] px-3 py-2 rounded-xl transition-colors ${active
                                ? 'text-primary-500'
                                : 'text-muted hover:text-foreground'
                                }`}
                            aria-label={tab.label}
                            aria-current={active ? 'page' : undefined}
                        >
                            {/* Icon */}
                            <span className="relative">
                                {active ? tab.activeIcon || tab.icon : tab.icon}

                                {/* Badge */}
                                {tab.badge !== undefined && tab.badge > 0 && (
                                    <motion.span
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center bg-primary-500 text-white text-[10px] font-bold rounded-full px-1"
                                    >
                                        {tab.badge > 99 ? '99+' : tab.badge}
                                    </motion.span>
                                )}
                            </span>

                            {/* Label */}
                            <span className={`text-[10px] font-medium mt-1 ${active ? 'text-primary-500' : ''}`}>
                                {tab.label}
                            </span>

                            {/* Active indicator */}
                            {active && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute -bottom-1 w-1 h-1 bg-primary-500 rounded-full"
                                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                />
                            )}
                        </motion.button>
                    );
                })}
            </div>
        </nav>
    );
};

export default BottomTabBar;
