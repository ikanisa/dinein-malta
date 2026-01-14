import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';

export interface ToastProps {
    /** Unique ID */
    id: string;
    /** Toast type */
    type?: 'success' | 'error' | 'warning' | 'info';
    /** Toast title */
    title?: string;
    /** Toast message */
    message: string;
    /** Duration in ms (0 = persistent) */
    duration?: number;
    /** Callback when toast should be dismissed */
    onDismiss?: (id: string) => void;
    /** Action button */
    action?: {
        label: string;
        onClick: () => void;
    };
}

const typeConfig = {
    success: {
        bgClass: 'bg-success-bg border-success/30',
        textClass: 'text-success',
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
        ),
    },
    error: {
        bgClass: 'bg-error-bg border-error/30',
        textClass: 'text-error',
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
        ),
    },
    warning: {
        bgClass: 'bg-warning-bg border-warning/30',
        textClass: 'text-warning',
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
        ),
    },
    info: {
        bgClass: 'bg-info-bg border-info/30',
        textClass: 'text-info',
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
    },
};

export const Toast: React.FC<ToastProps> = ({
    id,
    type = 'info',
    title,
    message,
    onDismiss,
    action,
}) => {
    const config = typeConfig[type];

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: -16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.95 }}
            transition={{
                type: 'spring',
                damping: 25,
                stiffness: 300,
            }}
            role="alert"
            aria-live="polite"
            className={clsx(
                'flex items-start gap-3 p-4 rounded-xl border backdrop-blur-lg shadow-glass',
                'min-w-[280px] max-w-[400px]',
                config.bgClass
            )}
        >
            {/* Icon */}
            <div className={clsx('flex-shrink-0 mt-0.5', config.textClass)}>
                {config.icon}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                {title && (
                    <p className="font-semibold text-foreground text-sm mb-0.5">{title}</p>
                )}
                <p className="text-sm text-muted">{message}</p>

                {action && (
                    <button
                        onClick={action.onClick}
                        className={clsx(
                            'mt-2 text-sm font-medium underline underline-offset-2',
                            config.textClass
                        )}
                    >
                        {action.label}
                    </button>
                )}
            </div>

            {/* Dismiss button */}
            {onDismiss && (
                <button
                    onClick={() => onDismiss(id)}
                    className="flex-shrink-0 p-1 rounded-full hover:bg-surface-highlight transition-colors text-muted hover:text-foreground"
                    aria-label="Dismiss"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            )}
        </motion.div>
    );
};

// Toast Container for positioning
export interface ToastContainerProps {
    toasts: ToastProps[];
    position?: 'top-center' | 'top-right' | 'bottom-center' | 'bottom-right';
}

const positionClasses = {
    'top-center': 'top-4 left-1/2 -translate-x-1/2 flex-col',
    'top-right': 'top-4 right-4 flex-col',
    'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2 flex-col-reverse',
    'bottom-right': 'bottom-4 right-4 flex-col-reverse',
};

export const ToastContainer: React.FC<ToastContainerProps> = ({
    toasts,
    position = 'top-center',
}) => {
    return (
        <div
            className={clsx(
                'fixed z-toast flex gap-2 pointer-events-none',
                positionClasses[position]
            )}
            aria-live="polite"
        >
            <AnimatePresence mode="popLayout">
                {toasts.map((toast) => (
                    <div key={toast.id} className="pointer-events-auto">
                        <Toast {...toast} />
                    </div>
                ))}
            </AnimatePresence>
        </div>
    );
};

export default Toast;
