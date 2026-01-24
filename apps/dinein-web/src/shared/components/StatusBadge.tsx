import { CheckCircle, Clock, Loader, XCircle } from 'lucide-react';

export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled';

interface StatusBadgeProps {
    status: OrderStatus;
    size?: 'sm' | 'md';
}

const STATUS_CONFIG: Record<OrderStatus, { bg: string; text: string; icon?: React.ElementType }> = {
    pending: { bg: 'bg-amber-100', text: 'text-amber-700', icon: Clock },
    confirmed: { bg: 'bg-blue-100', text: 'text-blue-700', icon: CheckCircle },
    preparing: { bg: 'bg-orange-100', text: 'text-orange-700', icon: Loader },
    ready: { bg: 'bg-emerald-100', text: 'text-emerald-700', icon: CheckCircle },
    completed: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle },
    cancelled: { bg: 'bg-red-100', text: 'text-red-700', icon: XCircle },
};

export function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
    const config = STATUS_CONFIG[status];
    const Icon = config.icon;

    return (
        <span className={`inline-flex items-center gap-1.5 ${config.bg} ${config.text} rounded-full font-semibold ${size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm'
            }`}>
            {Icon && <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />}
            {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
    );
}
