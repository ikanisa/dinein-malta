import { CheckCircle, Clock, XCircle } from 'lucide-react';
import type { OrderStatus } from '@dinein/core';

interface StatusBadgeProps {
    status: OrderStatus;
    size?: 'sm' | 'md';
}

const STATUS_CONFIG: Record<OrderStatus, { bg: string; text: string; icon?: React.ElementType }> = {
    placed: { bg: 'bg-blue-100', text: 'text-blue-700', icon: Clock },
    received: { bg: 'bg-amber-100', text: 'text-amber-700', icon: Clock },
    served: { bg: 'bg-emerald-100', text: 'text-emerald-700', icon: CheckCircle },
    cancelled: { bg: 'bg-red-100', text: 'text-red-700', icon: XCircle },
};

const STATUS_LABELS: Record<OrderStatus, string> = {
    placed: 'Placed',
    received: 'Received',
    served: 'Served',
    cancelled: 'Cancelled',
};

export function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
    const config = STATUS_CONFIG[status];
    const Icon = config.icon;
    const label = STATUS_LABELS[status];

    return (
        <span className={`inline-flex items-center gap-1.5 ${config.bg} ${config.text} rounded-full font-semibold ${size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm'
            }`}>
            {Icon && <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />}
            {label}
        </span>
    );
}

// Re-export OrderStatus for convenience
export type { OrderStatus };
