import { Skeleton } from "../ui/Skeleton";

export function MenuItemSkeleton() {
    return (
        <div className="flex gap-4 p-4 border rounded-2xl border-slate-100 items-start">
            <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-1/2" />
            </div>
            <Skeleton className="h-24 w-24 rounded-xl shrink-0" />
        </div>
    );
}

export function MenuCategorySkeleton() {
    return (
        <div className="space-y-4">
            <Skeleton className="h-8 w-40" />
            <div className="grid gap-4">
                {[1, 2, 3, 4].map((i) => (
                    <MenuItemSkeleton key={i} />
                ))}
            </div>
        </div>
    );
}
