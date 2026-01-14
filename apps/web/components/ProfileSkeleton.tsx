import React from 'react';
import { GlassCard } from './GlassCard';
import { Skeleton } from './Loading';

/**
 * ProfileSkeleton - Loading skeleton for ClientProfile page
 * Matches the structure of the profile page with avatar, settings, and favorites
 */
export const ProfileSkeleton: React.FC = () => {
    return (
        <div className="p-6 pb-24 space-y-6 animate-fade-in">
            {/* Header */}
            <header className="mb-6">
                <Skeleton className="h-9 w-28 mb-2" />
                <Skeleton className="h-4 w-48" />
            </header>

            {/* Profile Card */}
            <GlassCard className="flex items-center gap-4">
                <Skeleton className="w-16 h-16 rounded-full" variant="circular" />
                <div className="flex-1 space-y-2">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-6 w-32" />
                </div>
            </GlassCard>

            {/* Settings Section */}
            <section>
                <Skeleton className="h-6 w-20 mb-4" />
                <GlassCard className="space-y-4">
                    <div className="flex justify-between items-center">
                        <Skeleton className="h-5 w-36" />
                        <Skeleton className="w-12 h-6 rounded-full" />
                    </div>
                    <div className="flex justify-between items-center border-t border-border pt-4">
                        <Skeleton className="h-5 w-28" />
                        <Skeleton className="w-12 h-6 rounded-full" />
                    </div>
                </GlassCard>
            </section>

            {/* Favorites Section */}
            <section>
                <Skeleton className="h-6 w-32 mb-4" />
                <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                        <GlassCard key={i} className="flex justify-between items-center py-3">
                            <Skeleton className="h-5 w-40" />
                            <Skeleton className="h-4 w-4" />
                        </GlassCard>
                    ))}
                </div>
            </section>

            {/* History Section */}
            <section>
                <Skeleton className="h-6 w-20 mb-4" />
                <GlassCard className="flex items-center gap-3">
                    <Skeleton className="w-8 h-8 rounded-lg" variant="rectangular" />
                    <div className="flex-1 space-y-1">
                        <Skeleton className="h-5 w-28" />
                        <Skeleton className="h-3 w-40" />
                    </div>
                </GlassCard>
            </section>
        </div>
    );
};

export default ProfileSkeleton;
