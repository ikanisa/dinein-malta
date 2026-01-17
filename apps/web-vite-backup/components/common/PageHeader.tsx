/**
 * PageHeader Component
 * Reusable fixed header with glass effect, navigation buttons, and title
 * 
 * Features:
 * - Fixed position with safe area support
 * - Glass morphism background
 * - Left/right action slots
 * - Optional title (centered or left-aligned)
 * - Touch-optimized buttons (44px min)
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { hapticButton, hapticSelection } from '@/utils/haptics';

interface PageHeaderProps {
    /** Title displayed in the header (optional) */
    title?: string;
    /** Whether to center the title (default: true when no left action) */
    centerTitle?: boolean;
    /** Left action button config */
    leftAction?: 'menu' | 'back' | 'home' | React.ReactNode;
    /** Right action button config or custom element */
    rightAction?: 'settings' | 'home' | 'close' | React.ReactNode;
    /** Callback when menu button is clicked */
    onMenuClick?: () => void;
    /** Custom class for the header container */
    className?: string;
    /** Whether the header is transparent (no background) */
    transparent?: boolean;
    /** Whether the header is over dark content (inverts colors) */
    inverted?: boolean;
}

const IconButton: React.FC<{
    onClick: () => void;
    'aria-label': string;
    inverted?: boolean;
    children: React.ReactNode;
}> = ({ onClick, 'aria-label': ariaLabel, inverted, children }) => (
    <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => {
            hapticButton();
            onClick();
        }}
        className={clsx(
            'w-11 h-11 flex items-center justify-center rounded-xl transition-all touch-target',
            inverted
                ? 'bg-black/40 backdrop-blur-md text-white border border-white/10 hover:bg-black/50'
                : 'bg-white/5 hover:bg-white/10 active:scale-95'
        )}
        aria-label={ariaLabel}
    >
        {children}
    </motion.button>
);

// Icon components
const MenuIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="4" x2="20" y1="12" y2="12" />
        <line x1="4" x2="20" y1="6" y2="6" />
        <line x1="4" x2="20" y1="18" y2="18" />
    </svg>
);

const BackIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m12 19-7-7 7-7" />
        <path d="M19 12H5" />
    </svg>
);

const HomeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
);

const SettingsIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
);

const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 6 6 18" />
        <path d="m6 6 12 12" />
    </svg>
);

export const PageHeader: React.FC<PageHeaderProps> = ({
    title,
    centerTitle = true,
    leftAction = 'menu',
    rightAction,
    onMenuClick,
    className,
    transparent = false,
    inverted = false,
}) => {
    const navigate = useNavigate();

    const renderLeftAction = () => {
        if (React.isValidElement(leftAction)) {
            return leftAction;
        }

        switch (leftAction) {
            case 'menu':
                return (
                    <IconButton
                        onClick={onMenuClick || (() => { })}
                        aria-label="Open menu"
                        inverted={inverted}
                    >
                        <MenuIcon />
                    </IconButton>
                );
            case 'back':
                return (
                    <IconButton
                        onClick={() => navigate(-1)}
                        aria-label="Go back"
                        inverted={inverted}
                    >
                        <BackIcon />
                    </IconButton>
                );
            case 'home':
                return (
                    <IconButton
                        onClick={() => navigate('/')}
                        aria-label="Go home"
                        inverted={inverted}
                    >
                        <HomeIcon />
                    </IconButton>
                );
            default:
                return <div className="w-11" />; // Spacer
        }
    };

    const renderRightAction = () => {
        if (!rightAction) {
            return <div className="w-11" />; // Spacer for centering
        }

        if (React.isValidElement(rightAction)) {
            return rightAction;
        }

        switch (rightAction) {
            case 'settings':
                return (
                    <IconButton
                        onClick={() => {
                            hapticSelection();
                            navigate('/settings');
                        }}
                        aria-label="Settings"
                        inverted={inverted}
                    >
                        <SettingsIcon />
                    </IconButton>
                );
            case 'home':
                return (
                    <IconButton
                        onClick={() => {
                            hapticButton();
                            navigate('/');
                        }}
                        aria-label="Home"
                        inverted={inverted}
                    >
                        <HomeIcon />
                    </IconButton>
                );
            case 'close':
                return (
                    <IconButton
                        onClick={() => navigate(-1)}
                        aria-label="Close"
                        inverted={inverted}
                    >
                        <CloseIcon />
                    </IconButton>
                );
            default:
                return <div className="w-11" />;
        }
    };

    return (
        <header
            className={clsx(
                'fixed top-0 left-0 right-0 z-50',
                !transparent && 'backdrop-blur-xl bg-background/80 border-b border-white/5',
                className
            )}
            style={{ paddingTop: 'var(--safe-top, 0px)' }}
        >
            <div className="flex items-center justify-between px-4 py-3 max-w-md mx-auto">
                {renderLeftAction()}

                {title && (
                    <motion.h1
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={clsx(
                            'font-bold',
                            centerTitle ? 'text-xl text-center flex-1' : 'text-lg',
                            inverted ? 'text-white' : 'text-foreground'
                        )}
                    >
                        {title}
                    </motion.h1>
                )}

                {!title && centerTitle && (
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                            hapticButton();
                            window.location.reload();
                        }}
                        className="text-xl font-bold bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent"
                    >
                        DineIn
                    </motion.button>
                )}

                {renderRightAction()}
            </div>
        </header>
    );
};

PageHeader.displayName = 'PageHeader';

export default PageHeader;
