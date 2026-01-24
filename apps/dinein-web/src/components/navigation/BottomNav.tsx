import { motion } from 'framer-motion';
import { Home, Search, ShoppingBag, User } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useHaptics } from '@/hooks/useHaptics';
import { cn } from '@/lib/utils';

const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Search, label: 'Explore', path: '/explore' },
    { icon: ShoppingBag, label: 'Orders', path: '/orders' },
    { icon: User, label: 'Profile', path: '/profile' },
];

export function BottomNav() {
    const location = useLocation();
    const navigate = useNavigate();
    const { trigger } = useHaptics();

    const handleNavigation = (path: string) => {
        if (location.pathname !== path) {
            trigger('light');
            navigate(path);
        }
    };

    return (
        <motion.nav
            className="fixed bottom-0 left-0 right-0 z-50 pb-safe"
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        >
            {/* Gradient fade at the bottom for safety */}
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white/90 to-transparent dark:from-slate-950/90 pointer-events-none" />

            <div className="relative mx-4 mb-4">
                <div className="glass-depth-1 backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border border-white/40 dark:border-white/10 shadow-lg rounded-3xl overflow-hidden">
                    <div className="flex justify-around items-center px-2 py-3">
                        {navItems.map(({ icon: Icon, label, path }) => {
                            const isActive = location.pathname === path;
                            return (
                                <button
                                    key={path}
                                    onClick={() => handleNavigation(path)}
                                    className="flex flex-col items-center gap-1 min-w-[64px] py-1 cursor-pointer focus:outline-none touch-manipulation group"
                                    aria-current={isActive ? 'page' : undefined}
                                    role="link"
                                >
                                    <div className="relative">
                                        {isActive && (
                                            <motion.div
                                                layoutId="nav-pill"
                                                className="absolute inset-0 bg-primary/10 dark:bg-primary/20 rounded-2xl -m-1.5"
                                                initial={false}
                                                transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                                            />
                                        )}
                                        <motion.div
                                            animate={{
                                                scale: isActive ? 1.1 : 1,
                                                y: isActive ? -2 : 0
                                            }}
                                            whileTap={{ scale: 0.9 }}
                                            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                                            className={cn(
                                                "p-1.5 rounded-xl transition-all duration-300 relative z-10",
                                                isActive
                                                    ? "text-primary"
                                                    : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300"
                                            )}
                                        >
                                            <Icon
                                                size={24}
                                                strokeWidth={isActive ? 2.5 : 2}
                                                className={cn("transition-all duration-300", isActive && "drop-shadow-md")}
                                            />
                                        </motion.div>
                                    </div>
                                    <span
                                        className={cn(
                                            "text-[10px] font-semibold transition-all duration-300",
                                            isActive
                                                ? "text-primary translate-y-0 opacity-100"
                                                : "text-slate-400 translate-y-1 opacity-0 h-0 w-0 overflow-hidden"
                                        )}
                                    >
                                        {label}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </motion.nav>
    );
}
