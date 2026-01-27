import * as React from "react"
import { cn } from "../../lib/utils"

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, ...props }, ref) => {
        return (
            <input
                type={type}
                className={cn(
                    "flex h-12 w-full rounded-xl border border-input/60 bg-white/50 dark:bg-slate-900/50 px-4 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20 focus-visible:border-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 backdrop-blur-sm transition-all duration-200 shadow-sm hover:bg-white/80 dark:hover:bg-slate-900/80 focus:bg-white dark:focus:bg-slate-900",
                    className
                )}
                aria-invalid={props["aria-invalid"]}
                // Explicitly allow aria-describedby but handled by props
                ref={ref}
                {...props}
            />
        )
    }
)
Input.displayName = "Input"

export { Input }
