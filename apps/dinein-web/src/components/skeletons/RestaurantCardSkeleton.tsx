import { Skeleton } from "../ui/Skeleton";

export function RestaurantCardSkeleton() {
    return (
        <div className="space-y-3">
            <Skeleton className="h-48 w-full rounded-2xl" />
            <div className="space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
            </div>
        </div>
    );
}

export function RestaurantListSkeleton() {
    return (
        <div className="space-y-6">
            {[1, 2, 3].map((i) => (
                <RestaurantCardSkeleton key={i} />
            ))}
        </div>
    );
}
