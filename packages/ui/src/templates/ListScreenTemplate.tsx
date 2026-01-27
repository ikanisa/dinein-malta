import * as React from 'react';
import { ArrowLeft, Search, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { Skeleton } from '../components/ui/Skeleton';

export interface ListScreenTemplateProps {
    /** Page title */
    title: string;
    /** Back button handler (if provided, shows back arrow) */
    onBack?: () => void;
    /** Right header action */
    rightAction?: React.ReactNode;
    /** Search placeholder */
    searchPlaceholder?: string;
    /** Search value */
    searchValue?: string;
    /** Search change handler */
    onSearchChange?: (value: string) => void;
    /** Hide search bar */
    hideSearch?: boolean;
    /** Content loading state */
    loading?: boolean;
    /** Empty state content */
    emptyState?: React.ReactNode;
    /** Whether list is empty */
    isEmpty?: boolean;
    /** List items */
    children: React.ReactNode;
    /** Additional className for content area */
    className?: string;
}

/**
 * ListScreenTemplate
 * Template: header + search + scrollable list.
 * Standardizes list-based screens across the app.
 */
export function ListScreenTemplate({
    title,
    onBack,
    rightAction,
    searchPlaceholder = 'Search...',
    searchValue = '',
    onSearchChange,
    hideSearch = false,
    loading = false,
    emptyState,
    isEmpty = false,
    children,
    className,
}: ListScreenTemplateProps) {
    const showSearch = !hideSearch && onSearchChange;

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

                {/* Search bar */}
                {showSearch && (
                    <div className="px-4 pb-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder={searchPlaceholder}
                                value={searchValue}
                                onChange={(e) => onSearchChange(e.target.value)}
                                className={cn(
                                    'w-full h-10 pl-10 pr-10 rounded-xl',
                                    'bg-muted/50 border border-border',
                                    'text-sm placeholder:text-muted-foreground',
                                    'focus:outline-none focus:ring-2 focus:ring-primary/50'
                                )}
                            />
                            {searchValue && (
                                <button
                                    onClick={() => onSearchChange('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-muted transition-colors"
                                    aria-label="Clear search"
                                >
                                    <X className="h-4 w-4 text-muted-foreground" />
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </header>

            {/* Content */}
            <main className={cn('flex-1 overflow-y-auto pb-20', className)}>
                {loading ? (
                    <div className="p-4 space-y-3">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <Skeleton key={i} className="h-16 rounded-xl" />
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
        </div>
    );
}
