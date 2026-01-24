import { useEffect } from 'react';
import { Clock, CheckCircle2, ChefHat, Bell, RotateCcw, Home, Sparkles, Receipt } from 'lucide-react';

import { type OrderStatus } from '@/shared/components/StatusBadge';

interface OrderItem {
    name: string;
    quantity: number;
    price: number;
}

interface OrderTrackingProps {
    orderId: string;
    orderNumber: number;
    venueName: string;
    tableCode: string;
    items: OrderItem[];
    total: number;
    status: OrderStatus;
    createdAt: Date;
    estimatedMinutes?: number;
    onGoHome: () => void;
    onNewOrder: () => void;
}

interface TrackingStep {
    label: string;
    time: string;
    status: 'pending' | 'active' | 'completed';
}

function getTrackingSteps(status: OrderStatus, createdAt: Date): TrackingStep[] {
    const formatTime = (date: Date) => date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const baseTime = createdAt;
    const confirmTime = new Date(baseTime.getTime() + 1 * 60000); // +1 min
    const prepTime = new Date(baseTime.getTime() + 3 * 60000); // +3 min
    const readyTime = new Date(baseTime.getTime() + 15 * 60000); // +15 min

    const steps: {
        label: string;
        time: Date;
        activeStatuses: OrderStatus[];
        completedStatuses: OrderStatus[];
    }[] = [
            {
                label: 'Order Placed',
                time: baseTime,
                activeStatuses: ['pending'],
                completedStatuses: ['confirmed', 'preparing', 'ready', 'completed']
            },
            {
                label: 'Confirmed',
                time: confirmTime,
                activeStatuses: ['confirmed'],
                completedStatuses: ['preparing', 'ready', 'completed']
            },
            {
                label: 'Preparing',
                time: prepTime,
                activeStatuses: ['preparing'],
                completedStatuses: ['ready', 'completed']
            },
            {
                label: 'Ready',
                time: readyTime,
                activeStatuses: ['ready'],
                completedStatuses: ['completed']
            },
        ];

    return steps.map(step => {
        let stepStatus: 'pending' | 'active' | 'completed' = 'pending';
        if (step.completedStatuses.includes(status)) {
            stepStatus = 'completed';
        } else if (step.activeStatuses.includes(status)) {
            stepStatus = 'active';
        }

        return {
            label: step.label,
            time: formatTime(step.time),
            status: stepStatus,
        };
    });
}

const STATUS_CONFIG: Record<OrderStatus, { title: string; subtitle: string; icon: React.ElementType; theme: 'indigo' | 'emerald' | 'rose' | 'slate' }> = {
    pending: { title: 'Order Received', subtitle: 'Waiting for confirmation...', icon: Clock, theme: 'slate' },
    confirmed: { title: 'Cooking Soon', subtitle: 'Kitchen received your order', icon: CheckCircle2, theme: 'indigo' },
    preparing: { title: 'Preparing', subtitle: 'Chefs are working their magic', icon: ChefHat, theme: 'indigo' },
    ready: { title: 'Ready for Pickup', subtitle: 'Grab it at the counter!', icon: Bell, theme: 'emerald' },
    completed: { title: 'Enjoy!', subtitle: 'Have a wonderful meal', icon: Sparkles, theme: 'emerald' },
    cancelled: { title: 'Cancelled', subtitle: 'This order was cancelled', icon: Clock, theme: 'rose' },
};

export function OrderTracking({
    orderId: _orderId,
    orderNumber,
    venueName,
    tableCode,
    items,
    total,
    status,
    createdAt,
    estimatedMinutes = 20,
    onGoHome,
    onNewOrder,
}: OrderTrackingProps) {
    const steps = getTrackingSteps(status, createdAt);
    const config = STATUS_CONFIG[status];
    const Icon = config.icon;

    useEffect(() => {
        // Realtime subscription placeholder
    }, []);

    const isComplete = status === 'completed' || status === 'cancelled';

    // Dynamic styles based on status
    const isActive = status === 'confirmed' || status === 'preparing';
    const isReady = status === 'ready';

    // Gradient backgrounds for specific states
    let heroBgClass = "bg-white border-slate-200/60";
    let heroTextClass = "text-slate-900";
    let heroSubtextClass = "text-slate-500";
    let heroIconBgClass = "bg-slate-100 text-slate-600";

    if (isActive) {
        heroBgClass = "bg-gradient-to-br from-indigo-600 via-indigo-500 to-purple-600 shadow-xl shadow-indigo-500/20 border-indigo-400/20 text-white";
        heroTextClass = "text-white";
        heroSubtextClass = "text-indigo-100";
        heroIconBgClass = "bg-white/20 backdrop-blur-md text-white border border-white/20";
    } else if (isReady) {
        heroBgClass = "bg-gradient-to-br from-emerald-500 via-emerald-400 to-teal-500 shadow-xl shadow-emerald-500/20 border-emerald-400/20 text-white";
        heroTextClass = "text-white";
        heroSubtextClass = "text-emerald-50";
        heroIconBgClass = "bg-white/20 backdrop-blur-md text-white border border-white/20";
    }

    return (
        <div className="min-h-screen bg-slate-50/50 pb-[120px] font-sans selection:bg-indigo-100">
            {/* Header - Glass */}
            <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-slate-200/50 supports-[backdrop-filter]:bg-white/60">
                <div className="px-5 py-3 flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="font-bold text-slate-900 text-lg tracking-tight">Order #{orderNumber}</h1>
                            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-[10px] font-bold text-slate-500 tracking-wide uppercase border border-slate-200/50">
                                {venueName}
                            </span>
                        </div>
                        <p className="text-xs font-medium text-slate-400">Table {tableCode} • {createdAt.toLocaleDateString()}</p>
                    </div>
                </div>
            </header>

            <main className="px-4 pt-6 space-y-6">
                {/* Hero Status Card - Liquid Design */}
                <div className={`relative overflow-hidden rounded-3xl p-6 transition-all duration-500 ${heroBgClass}`}>
                    {/* Background decoration for active states */}
                    {(isActive || isReady) && (
                        <>
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
                            <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/5 rounded-full blur-3xl -ml-12 -mb-12 pointer-events-none" />
                        </>
                    )}

                    <div className="relative z-10 flex flex-col items-center text-center">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 shadow-lg ${heroIconBgClass} ${(isActive || isReady) ? 'animate-pulse-subtle' : ''}`}>
                            <Icon className="w-8 h-8" strokeWidth={1.5} />
                        </div>

                        <h2 className={`text-2xl font-bold tracking-tight mb-2 ${heroTextClass}`}>
                            {config.title}
                        </h2>

                        <p className={`text-sm font-medium leading-relaxed max-w-[240px] ${heroSubtextClass}`}>
                            {config.subtitle}
                        </p>

                        {!isComplete && estimatedMinutes && (
                            <div className={`mt-6 px-4 py-2 rounded-full flex items-center gap-2 text-sm font-bold shadow-sm ${(isActive || isReady)
                                    ? 'bg-white/15 backdrop-blur-md border border-white/10 text-white'
                                    : 'bg-slate-100 text-slate-700'
                                }`}>
                                <Clock className="w-4 h-4" />
                                <span>~{estimatedMinutes} min</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Timeline - Glass Card */}
                <div className="bg-white/70 backdrop-blur-xl rounded-3xl border border-white/50 shadow-sm shadow-slate-200/40 p-6">
                    <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-6">Order Status</h3>

                    <div className="space-y-7 relative before:absolute before:left-[19px] before:top-2 before:bottom-4 before:w-0.5 before:bg-gradient-to-b before:from-indigo-100 before:to-slate-50">
                        {steps.map((step) => {
                            const isCompleted = step.status === 'completed';
                            const isCurrent = step.status === 'active';
                            const isPending = step.status === 'pending';

                            return (
                                <div key={step.label} className="relative flex gap-5 items-center z-10">
                                    {/* Step Dot */}
                                    <div className={`
                                        relative w-10 h-10 rounded-full flex items-center justify-center border-[3px] transition-all duration-500
                                        ${isCompleted
                                            ? 'bg-indigo-600 border-indigo-100 text-white shadow-lg shadow-indigo-500/20 scale-100'
                                            : isCurrent
                                                ? 'bg-white border-indigo-500 text-indigo-600 shadow-lg shadow-indigo-500/10 scale-110'
                                                : 'bg-white border-slate-100 text-slate-300 scale-95'}
                                    `}>
                                        {isCompleted ? (
                                            <CheckCircle2 className="w-5 h-5" />
                                        ) : isCurrent ? (
                                            <div className="w-3 h-3 bg-indigo-500 rounded-full animate-pulse" />
                                        ) : (
                                            <div className="w-2.5 h-2.5 bg-slate-200 rounded-full" />
                                        )}
                                    </div>

                                    {/* Text Content */}
                                    <div className="flex-1 flex justify-between items-center bg-white/50 rounded-lg py-1 px-3 -ml-2">
                                        <div>
                                            <p className={`text-sm font-bold transition-colors ${isPending ? 'text-slate-400' : 'text-slate-800'
                                                }`}>
                                                {step.label}
                                            </p>
                                        </div>
                                        {step.time && (
                                            <span className={`text-[10px] font-bold tracking-wide ${isCurrent ? 'text-indigo-600' : 'text-slate-400'
                                                }`}>
                                                {step.time}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Receipt - Glass Card */}
                <div className="bg-white/70 backdrop-blur-xl rounded-3xl border border-white/50 shadow-sm shadow-slate-200/40 overflow-hidden">
                    <div className="p-6 border-b border-slate-100/50 bg-slate-50/30 flex items-center gap-2">
                        <Receipt className="w-4 h-4 text-slate-400" />
                        <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Receipt</h3>
                    </div>

                    <div className="p-2">
                        {items.map((item, index) => (
                            <div key={index} className="flex justify-between items-center p-3 hover:bg-slate-50 rounded-xl transition-colors">
                                <div className="flex items-center gap-3">
                                    <span className="w-6 h-6 flex items-center justify-center bg-slate-100 rounded-md text-xs font-bold text-slate-900 border border-slate-200/50">
                                        {item.quantity}
                                    </span>
                                    <span className="text-slate-700 font-medium text-sm">
                                        {item.name}
                                    </span>
                                </div>
                                <span className="font-semibold text-slate-900 text-sm">
                                    €{(item.price * item.quantity).toFixed(2)}
                                </span>
                            </div>
                        ))}
                    </div>

                    <div className="bg-slate-50/50 p-6 flex justify-between items-center border-t border-slate-100/50">
                        <span className="font-medium text-slate-500 text-sm">Total Paid</span>
                        <span className="font-bold text-indigo-900 text-xl tracking-tight">€{total.toFixed(2)}</span>
                    </div>
                </div>
            </main>

            {/* Bottom Actions - Floating Glass Island included in padding-bottom */}
            <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-xl border-t border-slate-200/50 p-4 pb-safe animate-slide-up">
                <div className="flex gap-4 max-w-md mx-auto">
                    <button
                        onClick={onGoHome}
                        className="flex-1 py-4 rounded-2xl bg-white border border-slate-200 text-slate-700 font-bold text-sm hover:bg-slate-50 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-sm"
                    >
                        <Home className="w-4 h-4" />
                        Home
                    </button>
                    <button
                        onClick={onNewOrder}
                        className="flex-1 py-4 rounded-2xl bg-slate-900 text-white font-bold text-sm shadow-xl shadow-slate-900/20 hover:shadow-slate-900/30 active:scale-95 transition-all flex items-center justify-center gap-2 bg-gradient-to-r from-slate-900 to-slate-800"
                    >
                        <RotateCcw className="w-4 h-4" />
                        Order Again
                    </button>
                </div>
            </div>
        </div>
    );
}
