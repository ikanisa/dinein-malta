import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
    shimmer?: boolean;
}

export const Skeleton = ({ className, shimmer = true, ...props }: SkeletonProps) => {
    return (
        <div
            className={cn(
                "bg-slate-200/60 rounded-xl",
                shimmer ? "skeleton-shimmer" : "animate-pulse",
                className
            )}
            {...props}
        />
    );
}

export const CardSkeleton = () => (
    <div className="glass-card p-4 space-y-4">
        <Skeleton className="h-48 w-full rounded-2xl" />
        <div className="space-y-2">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
        </div>
    </div>
);

export const MenuItemSkeleton = () => (
    <div className="glass-card p-3 flex gap-4">
        <Skeleton className="h-20 w-20 rounded-2xl shrink-0" />
        <div className="flex-1 space-y-2 py-1">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-5 w-1/3 mt-2" />
        </div>
    </div>
);
