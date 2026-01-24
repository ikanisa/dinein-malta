import { Skeleton } from "../ui/Skeleton"

export function AppShellSkeleton() {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col pb-safe">
            {/* Header Skeleton */}
            <div className="h-14 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-indigo-100 dark:border-slate-800 flex items-center px-4 sticky top-0 z-10 w-full justify-between">
                <Skeleton variant="avatar" className="w-8 h-8 rounded-full" />
                <div className="flex flex-col items-center gap-1">
                    <Skeleton variant="text" className="h-4 w-24" />
                    <Skeleton variant="text" className="h-3 w-16 opacity-70" />
                </div>
                <Skeleton variant="avatar" className="w-8 h-8 rounded-full" />
            </div>

            {/* Content Skeleton - Simulate a feed or list */}
            <div className="flex-1 p-4 space-y-6 pt-safe-top pb-[100px]">
                {/* Hero Card */}
                <Skeleton variant="card" className="w-full h-48 rounded-3xl" />

                {/* Section Title */}
                <div className="flex justify-between items-center">
                    <Skeleton variant="text" className="h-6 w-32" />
                    <Skeleton variant="text" className="h-4 w-12" />
                </div>

                {/* Horizontal Scroll List */}
                <div className="flex gap-4 overflow-hidden">
                    <Skeleton variant="card" className="w-40 h-48 flex-shrink-0" />
                    <Skeleton variant="card" className="w-40 h-48 flex-shrink-0" />
                    <Skeleton variant="card" className="w-40 h-48 flex-shrink-0" />
                </div>

                {/* Vertical List */}
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="flex gap-4 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50">
                            <Skeleton variant="card" className="w-20 h-20 rounded-xl" />
                            <div className="flex-1 space-y-2 py-1">
                                <Skeleton variant="text" className="h-5 w-3/4" />
                                <Skeleton variant="text" className="h-4 w-full opacity-60" />
                                <Skeleton variant="price" className="h-5 w-16 mt-2" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Bottom Nav Skeleton */}
            <div className="fixed bottom-0 left-0 right-0 z-50 pb-safe">
                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white/90 to-transparent dark:from-slate-950/90 pointer-events-none" />
                <div className="relative mx-4 mb-4">
                    <div className="h-[72px] bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/40 dark:border-white/10 shadow-lg rounded-3xl flex justify-around items-center px-2">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="flex flex-col items-center gap-1">
                                <Skeleton className="w-6 h-6 rounded-lg opacity-40" />
                                <Skeleton className="w-8 h-2 rounded-full opacity-30" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
