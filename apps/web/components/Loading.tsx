import React from 'react';
import { GlassCard } from './GlassCard';

// Updated to be visible in light mode (bg-gray-200) and dark mode (bg-white/10)
export const Skeleton = ({ className = "" }: { className?: string }) => (
  <div className={`bg-gray-200 dark:bg-white/10 animate-pulse rounded ${className}`} />
);

export const Spinner = ({ className = "w-5 h-5", color = "border-white" }: { className?: string, color?: string }) => (
  <div className={`border-2 border-transparent ${color} border-t-transparent rounded-full animate-spin ${className}`} style={{ borderTopColor: 'currentColor' }} />
);

// High-Fidelity Skeleton matching ClientHome NearbyVenueCard exactly
export const CardSkeleton = () => (
  <div className="w-full mb-6 glass-panel rounded-3xl border-0 shadow-lg bg-surface overflow-hidden">
     {/* Image Placeholder matching aspect-[4/3] */}
     <div className="aspect-[4/3] w-full relative bg-gray-300 dark:bg-white/5 animate-pulse">
        
        {/* Top Right Badge (Rating/Verified) */}
        <div className="absolute top-4 right-4 flex gap-2">
             <div className="w-16 h-6 bg-black/10 dark:bg-white/10 rounded-full" />
             <div className="w-12 h-6 bg-black/10 dark:bg-white/10 rounded-full" />
        </div>

        {/* Bottom Text Overlay Placeholder */}
        <div className="absolute bottom-0 left-0 right-0 p-5 w-full space-y-3">
            {/* Title Line */}
            <div className="w-3/4 h-8 bg-black/10 dark:bg-white/10 rounded-lg" />
            
            {/* Metadata Line (Category • Price • Dist) */}
            <div className="flex gap-2 items-center">
                <div className="w-16 h-4 bg-black/5 dark:bg-white/5 rounded" />
                <div className="w-1 h-1 bg-black/5 dark:bg-white/5 rounded-full" />
                <div className="w-8 h-4 bg-black/5 dark:bg-white/5 rounded" />
                <div className="w-1 h-1 bg-black/5 dark:bg-white/5 rounded-full" />
                <div className="w-12 h-4 bg-black/5 dark:bg-white/5 rounded" />
            </div>
        </div>
     </div>

     {/* Action Bar Placeholder */}
     <div className="p-3 flex gap-2 bg-surface-highlight/20">
         <div className="flex-[2] h-12 bg-gray-200 dark:bg-white/5 rounded-xl animate-pulse" />
         <div className="flex-1 h-12 bg-gray-200 dark:bg-white/5 rounded-xl animate-pulse" />
         <div className="flex-1 h-12 bg-gray-200 dark:bg-white/5 rounded-xl animate-pulse" />
     </div>
  </div>
);

export const VenueListSkeleton = () => (
  <GlassCard className="bg-surface border-border">
      <div className="flex justify-between items-start mb-2">
          <Skeleton className="w-40 h-6 rounded-md" /> {/* Title */}
          <Skeleton className="w-6 h-6 rounded-full" /> {/* Fav Icon */}
      </div>
      <Skeleton className="w-2/3 h-3 rounded-md mb-4" /> {/* Address */}
      <div className="flex items-center gap-2">
          <Skeleton className="w-16 h-6 rounded-md" /> {/* Rating Badge */}
          <Skeleton className="w-1 h-1 rounded-full" /> {/* Dot */}
          <Skeleton className="w-20 h-4 rounded-md" /> {/* Category */}
      </div>
  </GlassCard>
);

export const MenuListSkeleton = () => (
  <div className="space-y-4">
      {[1, 2, 3].map(i => (
          <GlassCard key={i} className="flex gap-4 p-3 bg-surface border-0 shadow-sm">
              <Skeleton className="w-28 h-28 rounded-lg flex-shrink-0" />
              <div className="flex-1 space-y-3 py-1 flex flex-col justify-between">
                  <div>
                    <Skeleton className="w-2/3 h-5 mb-2" />
                    <Skeleton className="w-full h-3" />
                  </div>
                  <div className="flex justify-between items-end">
                      <Skeleton className="w-12 h-6" />
                      <Skeleton className="w-8 h-8 rounded-full" />
                  </div>
              </div>
          </GlassCard>
      ))}
  </div>
);
