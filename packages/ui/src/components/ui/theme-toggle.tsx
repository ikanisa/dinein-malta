import { Moon, Sun } from "lucide-react"
import { Button } from "./Button"
import { motion, AnimatePresence } from "framer-motion"
import { useTheme } from "../theme/ThemeProvider"

export function ThemeToggle() {
    const { setTheme, theme } = useTheme()

    const cycleTheme = () => {
        if (theme === 'candlelight') setTheme('bistro')
        else setTheme('candlelight')
    }

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={cycleTheme}
            aria-label="Toggle theme"
            className="rounded-full w-10 h-10 bg-white/10 backdrop-blur-md border border-white/20 dark:border-white/10 hover:bg-white/20 dark:hover:bg-white/10 relative overflow-hidden"
        >
            <AnimatePresence mode="wait" initial={false}>
                <motion.div
                    key={theme}
                    initial={{ y: -20, opacity: 0, rotate: -90 }}
                    animate={{ y: 0, opacity: 1, rotate: 0 }}
                    exit={{ y: 20, opacity: 0, rotate: 90 }}
                    transition={{ duration: 0.2 }}
                    className="absolute inset-0 flex items-center justify-center"
                >
                    {theme === 'bistro' && <Sun className="h-[1.2rem] w-[1.2rem]" />}
                    {theme === 'candlelight' && <Moon className="h-[1.2rem] w-[1.2rem]" />}
                </motion.div>
            </AnimatePresence>
            <span className="sr-only">Toggle theme</span>
        </Button>
    )
}
