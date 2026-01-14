import React from 'react';
import { Skeleton } from './Loading';

interface PageSkeletonProps {
    /**
     * Layout type: 'default' | 'list' | 'grid' | 'detail'
     * @default 'default'
     */
    variant?: 'default' | 'list' | 'grid' | 'detail';
    /**
     * Whether to show a back button placeholder
     */
    showBack?: boolean;
}

export const PageSkeleton: React.FC<PageSkeletonProps> = ({
    variant = 'default',
    showBack = false
}) => {
    return (
        <div className="p-6 pb-24 space-y-6 animate-fade-in pt-safe-top">
            {/* Header Section */}
            <header className="space-y-2">
                {showBack && <Skeleton className="h-8 w-8 rounded-full mb-2" />}
                <Skeleton className="h-10 w-48 rounded-lg" />
                <Skeleton className="h-4 w-64 rounded-md opacity-60" />
            </header>

            {/* Content Section based on variant */}
            <div className="space-y-4">

                {variant === 'list' && (
                    <div className="space-y-4 stagger-children">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="flex gap-4 p-4 rounded-2xl bg-surface/50 border border-white/5 h-24 items-center">
                                <Skeleton className="h-16 w-16 rounded-xl" />
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-5 w-3/4" />
                                    <Skeleton className="h-3 w-1/2" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {variant === 'grid' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="rounded-3xl overflow-hidden aspect-[4/3] bg-surface/50 border border-white/5 relative">
                                <Skeleton className="absolute inset-0 w-full h-full" />
                                <div className="absolute bottom-4 left-4 right-4 space-y-2">
                                    <Skeleton className="h-6 w-2/3" />
                                    <Skeleton className="h-3 w-1/2" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {variant === 'detail' && (
                    <div className="space-y-6 animate-fade-in">
                        <div className="aspect-video w-full rounded-3xl overflow-hidden relative bg-surface/50">
                            <Skeleton className="absolute inset-0 w-full h-full" />
                        </div>
                        <div className="space-y-4">
                            <Skeleton className="h-8 w-3/4" />
                            <div className="flex gap-2">
                                <Skeleton className="h-6 w-20 rounded-full" />
                                <Skeleton className="h-6 w-20 rounded-full" />
                            </div>
                            <Skeleton className="h-24 w-full rounded-2xl" />
                        </div>
                    </div>
                )}

                {variant === 'default' && (
                    <div className="space-y-6">
                        <Skeleton className="h-32 w-full rounded-2xl" />
                        <Skeleton className="h-16 w-full rounded-xl" />
                        <Skeleton className="h-64 w-full rounded-2xl" />
                    </div>
                )}

            </div>
        </div>
    );
};
