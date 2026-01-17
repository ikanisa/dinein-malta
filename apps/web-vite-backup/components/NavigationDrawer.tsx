/**
 * Navigation Drawer Component
 * Slide-in drawer for app navigation with smooth animations
 */

import React, { useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { hapticButton, hapticSelection } from '../utils/haptics';

interface NavigationDrawerProps {
    isOpen: boolean;
    onClose: () => void;
}

interface NavItem {
    icon: React.ReactNode;
    label: string;
    path: string;
    isActive?: boolean;
}

export const NavigationDrawer: React.FC<NavigationDrawerProps> = ({ isOpen, onClose }) => {
    const navigate = useNavigate();
    const location = useLocation();

    // Close on escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    // Lock body scroll when open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    const handleNavigation = useCallback((path: string) => {
        hapticSelection();
        onClose();
        setTimeout(() => navigate(path), 150);
    }, [navigate, onClose]);

    const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        if (info.offset.x < -50 || info.velocity.x < -500) {
            onClose();
        }
    };

    const navItems: NavItem[] = [
        {
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
            ),
            label: 'Home',
            path: '/',
            isActive: location.pathname === '/',
        },
        {
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
            ),
            label: 'Settings',
            path: '/settings',
            isActive: location.pathname === '/settings',
        },
        {
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 20h9" />
                    <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                </svg>
            ),
            label: 'Register Your Bar',
            path: '/bar/onboard',
            isActive: location.pathname === '/bar/onboard',
        },
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
                        onClick={() => {
                            hapticButton();
                            onClose();
                        }}
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: '-100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '-100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        drag="x"
                        dragConstraints={{ left: 0, right: 0 }}
                        dragElastic={0.1}
                        onDragEnd={handleDragEnd}
                        className="fixed top-0 left-0 bottom-0 w-[280px] max-w-[80vw] bg-surface-base/95 backdrop-blur-xl border-r border-white/10 z-[101] shadow-2xl"
                        style={{ paddingTop: 'var(--safe-top, 0px)', paddingBottom: 'var(--safe-bottom, 0px)' }}
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-white/5">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                                    D
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-foreground">DineIn</h2>
                                    <p className="text-xs text-muted">Order & pay from your phone</p>
                                </div>
                            </div>
                        </div>

                        {/* Navigation Items */}
                        <nav className="p-4 space-y-1">
                            {navItems.map((item) => (
                                <button
                                    key={item.path}
                                    onClick={() => handleNavigation(item.path)}
                                    className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all active:scale-[0.98] touch-target ${item.isActive
                                            ? 'bg-primary-500/20 text-primary-400'
                                            : 'text-muted hover:bg-white/5 hover:text-foreground'
                                        }`}
                                >
                                    <span className="w-6 h-6">{item.icon}</span>
                                    <span className="font-medium">{item.label}</span>
                                </button>
                            ))}
                        </nav>

                        {/* Footer */}
                        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/5" style={{ marginBottom: 'var(--safe-bottom, 0px)' }}>
                            <p className="text-xs text-muted text-center">
                                Made with ❤️ for better dining
                            </p>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default NavigationDrawer;
