import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { cn } from '../../lib/utils';
import { spring } from '../../lib/motion';

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
    id: string;
    message: string;
    variant?: ToastVariant;
    duration?: number;
}

interface ToastItemProps {
    toast: Toast;
    onDismiss: (id: string) => void;
}

const icons: Record<ToastVariant, React.ElementType> = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info,
};

const variantStyles: Record<ToastVariant, string> = {
    success: 'bg-success/10 border-success/20 text-success',
    error: 'bg-destructive/10 border-destructive/20 text-destructive',
    warning: 'bg-warning/10 border-warning/20 text-warning',
    info: 'bg-info/10 border-info/20 text-info',
};

function ToastItem({ toast, onDismiss }: ToastItemProps) {
    const { id, message, variant = 'info', duration = 4000 } = toast;
    const Icon = icons[variant];

    React.useEffect(() => {
        if (duration > 0) {
            const timer = setTimeout(() => onDismiss(id), duration);
            return () => clearTimeout(timer);
        }
    }, [id, duration, onDismiss]);

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={spring.default}
            className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-md shadow-lg',
                'bg-surface/95 border-border',
                variantStyles[variant]
            )}
        >
            <Icon className="h-5 w-5 flex-shrink-0" />
            <p className="text-sm font-medium flex-1 text-foreground">{message}</p>
            <button
                onClick={() => onDismiss(id)}
                className="p-1 rounded-lg hover:bg-muted/50 transition-colors"
                aria-label="Dismiss"
            >
                <X className="h-4 w-4 text-muted-foreground" />
            </button>
        </motion.div>
    );
}

interface ToastContainerProps {
    toasts: Toast[];
    onDismiss: (id: string) => void;
    position?: 'top' | 'bottom';
    className?: string;
}

/**
 * Toast Container
 * Renders a stack of toast notifications.
 * Use with useToast hook for state management.
 */
export function ToastContainer({
    toasts,
    onDismiss,
    position = 'bottom',
    className,
}: ToastContainerProps) {
    return (
        <div
            className={cn(
                'fixed left-4 right-4 z-[200] flex flex-col gap-2 pointer-events-none max-w-md mx-auto',
                position === 'top' ? 'top-4' : 'bottom-24',
                className
            )}
        >
            <AnimatePresence mode="popLayout">
                {toasts.map((toast) => (
                    <div key={toast.id} className="pointer-events-auto">
                        <ToastItem toast={toast} onDismiss={onDismiss} />
                    </div>
                ))}
            </AnimatePresence>
        </div>
    );
}

// Toast context and hook for easy usage
interface ToastContextValue {
    toasts: Toast[];
    addToast: (toast: Omit<Toast, 'id'>) => void;
    dismissToast: (id: string) => void;
}

const ToastContext = React.createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = React.useState<Toast[]>([]);

    const addToast = React.useCallback((toast: Omit<Toast, 'id'>) => {
        const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
        setToasts((prev) => [...prev, { ...toast, id }]);
    }, []);

    const dismissToast = React.useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ toasts, addToast, dismissToast }}>
            {children}
            <ToastContainer toasts={toasts} onDismiss={dismissToast} />
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = React.useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }

    const toast = React.useMemo(() => ({
        success: (message: string) => context.addToast({ message, variant: 'success' }),
        error: (message: string) => context.addToast({ message, variant: 'error' }),
        warning: (message: string) => context.addToast({ message, variant: 'warning' }),
        info: (message: string) => context.addToast({ message, variant: 'info' }),
        dismiss: context.dismissToast,
    }), [context]);

    return toast;
}
