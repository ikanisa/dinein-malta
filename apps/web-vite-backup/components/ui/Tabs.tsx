import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';

export interface TabItem {
    id: string;
    label: string;
    icon?: React.ReactNode;
}

export interface TabsProps {
    /** Array of tab items */
    tabs: TabItem[];
    /** Currently active tab ID (controlled mode) */
    activeTab?: string;
    /** Default active tab ID (uncontrolled mode) */
    defaultTab?: string;
    /** Callback when tab changes */
    onChange?: (tabId: string) => void;
    /** Visual variant */
    variant?: 'default' | 'pills' | 'underline';
    /** Size variant */
    size?: 'sm' | 'md' | 'lg';
    /** Additional class name */
    className?: string;
    /** Full width tabs */
    fullWidth?: boolean;
}

const sizeClasses = {
    sm: 'text-xs py-1.5 px-3',
    md: 'text-sm py-2 px-4',
    lg: 'text-base py-2.5 px-5',
};

export const Tabs: React.FC<TabsProps> = ({
    tabs,
    activeTab: controlledActiveTab,
    defaultTab,
    onChange,
    variant = 'default',
    size = 'md',
    className,
    fullWidth = true,
}) => {
    const [internalActiveTab, setInternalActiveTab] = useState(
        defaultTab || tabs[0]?.id
    );
    const tabRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
    const containerRef = useRef<HTMLDivElement>(null);
    const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

    const activeTab = controlledActiveTab ?? internalActiveTab;

    // Update indicator position when active tab changes
    useEffect(() => {
        const activeTabElement = tabRefs.current.get(activeTab);
        const container = containerRef.current;

        if (activeTabElement && container) {
            const containerRect = container.getBoundingClientRect();
            const tabRect = activeTabElement.getBoundingClientRect();

            setIndicatorStyle({
                left: tabRect.left - containerRect.left,
                width: tabRect.width,
            });
        }
    }, [activeTab, tabs]);

    const handleTabClick = (tabId: string) => {
        if (controlledActiveTab === undefined) {
            setInternalActiveTab(tabId);
        }
        onChange?.(tabId);
    };

    const getContainerClasses = () => {
        switch (variant) {
            case 'pills':
                return 'p-1 bg-surface-highlight rounded-xl border border-border';
            case 'underline':
                return 'border-b border-border';
            default:
                return 'p-1 bg-surface-highlight rounded-xl border border-border backdrop-blur-md';
        }
    };

    const getTabClasses = (isActive: boolean) => {
        const base = clsx(
            'relative font-semibold transition-all duration-normal',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
            'touch-manipulation min-h-touch',
            sizeClasses[size],
            fullWidth && 'flex-1'
        );

        switch (variant) {
            case 'pills':
                return clsx(
                    base,
                    'rounded-lg',
                    isActive
                        ? 'bg-primary-500 text-white shadow-md'
                        : 'text-muted hover:text-foreground'
                );
            case 'underline':
                return clsx(
                    base,
                    'pb-3',
                    isActive
                        ? 'text-foreground'
                        : 'text-muted hover:text-foreground'
                );
            default:
                return clsx(
                    base,
                    'rounded-lg',
                    isActive
                        ? 'bg-foreground text-background shadow-md'
                        : 'text-muted hover:text-foreground hover:bg-surface-highlight/50'
                );
        }
    };

    return (
        <div
            ref={containerRef}
            className={clsx('relative flex', getContainerClasses(), className)}
            role="tablist"
        >
            {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                    <button
                        key={tab.id}
                        ref={(el) => {
                            if (el) tabRefs.current.set(tab.id, el);
                        }}
                        role="tab"
                        aria-selected={isActive}
                        aria-controls={`tabpanel-${tab.id}`}
                        onClick={() => handleTabClick(tab.id)}
                        className={getTabClasses(isActive)}
                    >
                        {tab.icon && <span className="mr-2">{tab.icon}</span>}
                        {tab.label}
                    </button>
                );
            })}

            {/* Animated underline for underline variant */}
            {variant === 'underline' && (
                <motion.div
                    className="absolute bottom-0 h-0.5 bg-primary-500 rounded-full"
                    initial={false}
                    animate={{
                        left: indicatorStyle.left,
                        width: indicatorStyle.width,
                    }}
                    transition={{
                        type: 'spring',
                        stiffness: 500,
                        damping: 30,
                    }}
                />
            )}
        </div>
    );
};

export interface TabPanelProps {
    /** Tab ID this panel belongs to */
    tabId: string;
    /** Currently active tab ID */
    activeTab: string;
    /** Panel content */
    children: React.ReactNode;
    /** Additional class name */
    className?: string;
}

export const TabPanel: React.FC<TabPanelProps> = ({
    tabId,
    activeTab,
    children,
    className,
}) => {
    if (tabId !== activeTab) return null;

    return (
        <motion.div
            id={`tabpanel-${tabId}`}
            role="tabpanel"
            aria-labelledby={tabId}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className={className}
        >
            {children}
        </motion.div>
    );
};

export default Tabs;
