import * as React from 'react';
import { cn } from '../../lib/utils';

export interface AppShellProps {
    /** Header content (navigation, title, etc.) */
    header?: React.ReactNode;
    /** Main content area */
    children: React.ReactNode;
    /** Bottom navigation component */
    bottomNav?: React.ReactNode;
    /** Whether content should scroll independently */
    scrollable?: boolean;
    /** Add safe area padding for notched devices */
    safeArea?: boolean;
    /** Additional className for main content area */
    className?: string;
    /** Additional className for outer wrapper */
    wrapperClassName?: string;
}

/**
 * AppShell
 * Layout wrapper component with slots for header, content, and bottom nav.
 * Provides consistent page structure across the app.
 */
export function AppShell({
    header,
    children,
    bottomNav,
    scrollable = true,
    safeArea = true,
    className,
    wrapperClassName,
}: AppShellProps) {
    return (
        <div
            className={cn(
                'min-h-screen bg-background flex flex-col',
                safeArea && 'pt-safe-top',
                wrapperClassName
            )}
        >
            {/* Header */}
            {header && (
                <header className="flex-shrink-0 sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
                    {header}
                </header>
            )}

            {/* Main content */}
            <main
                className={cn(
                    'flex-1',
                    scrollable && 'overflow-y-auto',
                    bottomNav && 'pb-20', // Space for bottom nav
                    safeArea && bottomNav && 'pb-safe-bottom',
                    className
                )}
            >
                {children}
            </main>

            {/* Bottom navigation */}
            {bottomNav}
        </div>
    );
}

export interface AppShellHeaderProps {
    /** Page title */
    title?: string;
    /** Left action (back button, menu, etc.) */
    leftAction?: React.ReactNode;
    /** Right action(s) */
    rightAction?: React.ReactNode;
    /** Transparent/overlay mode */
    transparent?: boolean;
    /** Additional className */
    className?: string;
}

/**
 * AppShellHeader
 * Standard header component for use with AppShell.
 */
export function AppShellHeader({
    title,
    leftAction,
    rightAction,
    transparent = false,
    className,
}: AppShellHeaderProps) {
    return (
        <div
            className={cn(
                'flex items-center justify-between h-14 px-4',
                transparent && 'bg-transparent',
                className
            )}
        >
            <div className="flex-shrink-0 w-12">
                {leftAction}
            </div>

            {title && (
                <h1 className="flex-1 text-center font-semibold text-foreground truncate px-2">
                    {title}
                </h1>
            )}

            <div className="flex-shrink-0 w-12 flex justify-end">
                {rightAction}
            </div>
        </div>
    );
}
