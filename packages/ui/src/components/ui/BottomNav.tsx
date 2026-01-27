import * as React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Settings } from 'lucide-react';
import { cn } from '../../lib/utils';
import { GlassCard } from './GlassCard';

export interface NavTab {
    id: string;
    label: string;
    icon: React.ElementType;
    href?: string;
}

export interface BottomNavProps {
    /** Array of navigation tabs */
    tabs: NavTab[];
    /** Active tab ID (controlled) */
    activeTab?: string;
    /** Callback when tab changes (controlled mode) */
    onTabChange?: (tabId: string) => void;
    /** Use Link navigation (router mode) vs callback mode */
    useRouter?: boolean;
    /** Show glass effect */
    glass?: boolean;
    /** Additional className */
    className?: string;
}

/**
 * BottomNav
 * Unified bottom navigation component.
 * Supports 2-tab (customer) and multi-tab (venue/admin) configurations.
 * 
 * Per STARTER RULES: Customer bottom nav = EXACTLY 2 items (Home + Settings)
 */
export function BottomNav({
    tabs,
    activeTab,
    onTabChange,
    useRouter = true,
    glass = true,
    className,
}: BottomNavProps) {
    const location = useLocation();

    // Determine active tab from router or prop
    const currentActiveTab = activeTab || tabs.find(tab =>
        tab.href && location.pathname.startsWith(tab.href)
    )?.id || tabs[0]?.id;

    const handleTabClick = (tab: NavTab) => {
        if (!useRouter && onTabChange) {
            onTabChange(tab.id);
        }
    };

    const NavWrapper = glass ? GlassCard : 'div';
    const navWrapperProps = glass ? { depth: '2' as const } : {};

    return (
        <nav
            className={cn(
                'fixed bottom-0 left-0 right-0 z-[100]',
                className
            )}
            role="navigation"
            aria-label="Main navigation"
        >
            {/* Gradient fade for content behind */}
            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background via-background/80 to-transparent -z-10 pointer-events-none" />

            <div className="max-w-md mx-auto px-4 pb-safe pt-3">
                <NavWrapper
                    {...navWrapperProps}
                    className={cn(
                        'flex items-center px-2 py-2',
                        tabs.length === 2 ? 'justify-around' : 'justify-between',
                        glass ? 'rounded-[2rem]' : 'rounded-2xl border border-border bg-surface'
                    )}
                >
                    {tabs.map((tab) => {
                        const isActive = currentActiveTab === tab.id;
                        const Icon = tab.icon;

                        const tabContent = (
                            <div
                                className={cn(
                                    'relative flex flex-col items-center gap-1 px-4 py-2',
                                    'transition-all duration-200 active:scale-90'
                                )}
                            >
                                <div
                                    className={cn(
                                        'p-2 rounded-xl transition-all duration-300',
                                        isActive
                                            ? 'bg-primary shadow-md shadow-primary/30 -translate-y-1'
                                            : 'hover:bg-muted/50'
                                    )}
                                >
                                    <Icon
                                        className={cn(
                                            'w-5 h-5 transition-colors duration-300',
                                            isActive ? 'text-primary-foreground' : 'text-muted-foreground'
                                        )}
                                        strokeWidth={isActive ? 2.5 : 2}
                                    />
                                </div>
                                <span
                                    className={cn(
                                        'text-[10px] font-bold transition-all duration-300',
                                        isActive
                                            ? 'text-primary -translate-y-0.5'
                                            : 'text-muted-foreground opacity-80'
                                    )}
                                >
                                    {tab.label}
                                </span>
                                {isActive && (
                                    <div className="absolute -bottom-1 w-1 h-1 rounded-full bg-primary" />
                                )}
                            </div>
                        );

                        if (useRouter && tab.href) {
                            return (
                                <Link
                                    key={tab.id}
                                    to={tab.href}
                                    aria-label={`Navigate to ${tab.label}`}
                                    aria-current={isActive ? 'page' : undefined}
                                    data-testid={`nav-${tab.id}`}
                                >
                                    {tabContent}
                                </Link>
                            );
                        }

                        return (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => handleTabClick(tab)}
                                aria-label={`Navigate to ${tab.label}`}
                                aria-pressed={isActive}
                                data-testid={`nav-${tab.id}`}
                            >
                                {tabContent}
                            </button>
                        );
                    })}
                </NavWrapper>
            </div>
        </nav>
    );
}

// Pre-configured variants for common use cases

export interface CustomerBottomNavProps {
    /** Venue slug for contextual navigation */
    venueSlug?: string;
    /** Additional className */
    className?: string;
}

/**
 * CustomerBottomNav
 * 2-tab navigation for customer app (Home + Settings).
 * Per STARTER RULES: Customer bottom nav = EXACTLY 2 items.
 */
export function CustomerBottomNav({ venueSlug, className }: CustomerBottomNavProps) {
    const homeHref = venueSlug ? `/v/${venueSlug}` : '/';
    const settingsHref = venueSlug ? `/v/${venueSlug}/settings` : '/settings';

    const tabs: NavTab[] = [
        { id: 'home', label: 'Home', icon: Home, href: homeHref },
        { id: 'settings', label: 'Settings', icon: Settings, href: settingsHref },
    ];

    return <BottomNav tabs={tabs} className={className} />;
}
