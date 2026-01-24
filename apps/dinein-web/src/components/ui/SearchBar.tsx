import * as React from "react"
import { Search, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Input } from "./Input"
import { Button } from "./Button"

interface SearchBarProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
    value: string
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    onClear?: () => void
}

const SearchBar = React.forwardRef<HTMLInputElement, SearchBarProps>(
    ({ className, value, onChange, onClear, ...props }, ref) => {
        return (
            <div className={cn("relative flex-1", className)}>
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <Input
                    ref={ref}
                    value={value}
                    onChange={onChange}
                    className="pl-9 pr-8 bg-white/60 dark:bg-slate-800/60 border-white/40 dark:border-slate-700/50 shadow-sm"
                    {...props}
                />
                {value && (
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClear}
                        className="absolute right-1 top-1/2 -translate-y-1/2 w-7 h-7 hover:bg-black/5 dark:hover:bg-white/10 rounded-full"
                    >
                        <X className="w-3 h-3 text-muted-foreground" />
                    </Button>
                )}
            </div>
        )
    }
)
SearchBar.displayName = "SearchBar"

export { SearchBar }
