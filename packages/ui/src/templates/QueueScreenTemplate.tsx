import * as React from 'react';
import { ArrowLeft } from 'lucide-react';
import { cn } from '../lib/utils';
import { Skeleton } from '../components/ui/Skeleton';
import { DraggableBottomSheet } from '../components/ui/DraggableBottomSheet';

export interface QueueTab {
    id: string;
    label: string;
    count?: number;
}

export interface QueueScreenTemplateProps {
    /** Page title */
    title: string;
    /** Back button handler */
    onBack?: () => void;
    /** Right header action */
    rightAction?: React.ReactNode;
    /** Tab options */
    tabs: QueueTab[];
    /** Active tab ID */
    activeTab: string;
    /** Tab change handler */
    onTabChange: (tabId: string) => void;
    /** Queue items */
    children: React.ReactNode;
    /** Loading state */
    loading?: boolean;
    /** Empty state content */
    emptyState?: React.ReactNode;
    /** Whether queue is empty */
    isEmpty?: boolean;
    /** Detail sheet open state */
    detailOpen?: boolean;
    /** Detail sheet close handler */
    onDetailClose?: () => void;
    /** Detail sheet content */
    detailContent?: React.ReactNode;
    /** Detail sheet title */
    detailTitle?: string;
    /** Additional className for content */
    className?: string;
}

/**
 * QueueScreenTemplate
 * Template: tabs + list + detail sheet (for venue dashboard KDS-style views).
 * Perfect for order queues, claims lists, etc.
 */
export function QueueScreenTemplate({
    title,
    onBack,
    rightAction,
    tabs,
    activeTab,
    onTabChange,
    children,
    loading = false,
    emptyState,
    isEmpty = false,
    detailOpen = false,
    onDetailClose,
    detailContent,
    detailTitle,
    className,
}: QueueScreenTemplateProps) {
    return (
        <div className="flex flex-col min-h-screen bg-background">
            {/* Header */}
            <header className="flex-shrink-0 sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
                <div className="flex items-center justify-between h-14 px-4">
                    <div className="flex-shrink-0 w-10">
                        {onBack && (
                            <button
                                onClick={onBack}
                                className="p-2 -ml-2 rounded-xl hover:bg-muted/50 transition-colors"
                                aria-label="Go back"
                            >
                                <ArrowLeft className="h-5 w-5" />
                            </button>
                        )}
                    </div>

                    <h1 className="flex-1 text-center font-semibold text-foreground truncate px-2">
                        {title}
                    </h1>

                    <div className="flex-shrink-0 w-10 flex justify-end">
                        {rightAction}
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex px-4 pb-3 gap-2 overflow-x-auto scrollbar-hide">
                    {tabs.map((tab) => {
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => onTabChange(tab.id)}
                                className={cn(
                                    'flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap',
                                    'transition-all duration-200 active:scale-95',
                                    isActive
                                        ? 'bg-primary text-primary-foreground shadow-sm'
                                        : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                                )}
                            >
                                <span>{tab.label}</span>
                                {tab.count !== undefined && tab.count > 0 && (
                                    <span
                                        className={cn(
                                            'min-w-[20px] h-5 flex items-center justify-center rounded-full text-xs font-bold',
                                            isActive
                                                ? 'bg-primary-foreground/20 text-primary-foreground'
                                                : 'bg-muted-foreground/20 text-muted-foreground'
                                        )}
                                    >
                                        {tab.count > 99 ? '99+' : tab.count}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </header>

            {/* Queue content */}
            <main className={cn('flex-1 overflow-y-auto pb-20', className)}>
                {loading ? (
                    <div className="p-4 space-y-3">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <Skeleton key={i} className="h-24 rounded-xl" />
                        ))}
                    </div>
                ) : isEmpty && emptyState ? (
                    <div className="flex items-center justify-center min-h-[50vh] p-4">
                        {emptyState}
                    </div>
                ) : (
                    children
                )}
            </main>

            {/* Detail sheet */}
            {detailContent && (
                <DraggableBottomSheet
                    isOpen={detailOpen}
                    onClose={onDetailClose || (() => { })}
                    snapPoints={[0.6, 0.9]}
                >
                    <div className="p-4">
                        {detailTitle && (
                            <h2 className="font-semibold text-lg mb-4">{detailTitle}</h2>
                        )}
                        {detailContent}
                    </div>
                </DraggableBottomSheet>
            )}
        </div>
    );
}
