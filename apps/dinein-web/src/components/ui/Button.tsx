import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { useHaptics } from "@/hooks/useHaptics"

const buttonVariants = cva(
    "inline-flex items-center justify-center whitespace-nowrap rounded-2xl text-sm font-semibold ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none",
    {
        variants: {
            variant: {
                default: "btn-primary", // mapped from index.css
                destructive:
                    "bg-red-500 text-destructive-foreground hover:bg-red-500/90",
                outline:
                    "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
                secondary:
                    "btn-secondary", // mapped from index.css
                ghost: "hover:bg-accent hover:text-accent-foreground",
                link: "text-primary underline-offset-4 hover:underline",
                coral: "btn-coral text-white", // Custom variant
                glass: "bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 shadow-sm", // Glass variant
            },
            size: {
                default: "h-11 px-6 py-2", // Min 44px
                sm: "h-9 rounded-xl px-3",
                lg: "h-14 rounded-2xl px-10 text-base",
                icon: "h-11 w-11",
            },
            fullWidth: {
                true: "w-full",
            }
        },
        defaultVariants: {
            variant: "default",
            size: "default",
            fullWidth: false,
        },
    }
)

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
    asChild?: boolean
    loading?: boolean
    // Allow broader props for motion compatibility if needed, though HTMLButtonElement covers most
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, fullWidth, asChild = false, loading = false, onClick, children, ...props }, ref) => {
        // If asChild is true, we use Slash (Radix), otherwise we use motion.button
        // Note: asChild with motion is complex, we prioritize asChild behavior if present, losing motion on that specific element wrapper
        // but typically we want motion. If asChild is essential (e.g. TooltipTrigger), we skip motion for safety or wrap it.
        // For this design system, we prioritize Motion for standard buttons.

        const { trigger } = useHaptics()

        // Intercept click for haptics
        const handleClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
            if (!props.disabled && !loading) {
                trigger('light')
                onClick?.(e)
            }
        }

        if (asChild) {
            return (
                <Slot
                    className={cn(buttonVariants({ variant, size, fullWidth, className }))}
                    ref={ref}
                    onClick={handleClick}
                    {...props}
                >
                    {children}
                </Slot>
            )
        }

        return (
            // @ts-expect-error - Dynamic component typing with motion is tricky
            <motion.button
                className={cn(buttonVariants({ variant, size, fullWidth, className }))}
                ref={ref}
                onClick={handleClick}
                disabled={props.disabled || loading}
                aria-disabled={props.disabled || loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                {...props}
            >
                {loading && (
                    <span className="absolute inset-0 flex items-center justify-center">
                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    </span>
                )}
                <span className={cn(loading && "invisible", "flex items-center justify-center gap-2")}>
                    {children}
                </span>
            </motion.button>
        )
    }
)
Button.displayName = "Button"

export { Button, buttonVariants }
