import { cn } from "@/lib/utils"

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'card' | 'text' | 'avatar' | 'price'
}

function Skeleton({
    className,
    variant = 'default',
    ...props
}: SkeletonProps) {

    const variantStyles = {
        default: "rounded-xl",
        card: "rounded-3xl glass-depth-1",
        text: "h-4 w-3/4 rounded-full",
        avatar: "h-12 w-12 rounded-full",
        price: "h-6 w-20 rounded-lg"
    }

    return (
        <div
            className={cn(
                "skeleton-shimmer bg-slate-200/50 dark:bg-slate-800/50 overflow-hidden relative",
                variantStyles[variant],
                className
            )}
            {...props}
        >
            {/* Shimmer overlay handled by global CSS animation classes */}
        </div>
    )
}

export { Skeleton }
