import { useEffect } from 'react';
import { Bell, Check, Clock } from 'lucide-react';
import type { WaiterRing } from '../../hooks/useWaiterRings';

const REASON_LABELS: Record<string, { label: string; emoji: string }> = {
    ready_to_order: { label: 'Ready to Order', emoji: '📝' },
    need_help: { label: 'Need Help', emoji: '🙋' },
    check_please: { label: 'Check Please', emoji: '💳' },
    other: { label: 'Assistance', emoji: '❓' },
};

interface RingAlertOverlayProps {
    ring: WaiterRing;
    onAcknowledge: () => void;
    onDismiss: () => void;
}

export function RingAlertOverlay({ ring, onAcknowledge, onDismiss }: RingAlertOverlayProps) {
    const reasonInfo = ring.reason ? REASON_LABELS[ring.reason] : null;
    const createdAt = new Date(ring.created_at);
    const timeStr = createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Auto-dismiss after 30 seconds if not acknowledged
    useEffect(() => {
        const timer = setTimeout(() => {
            onDismiss();
        }, 30000);

        return () => clearTimeout(timer);
    }, [onDismiss]);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-fade-in">
            {/* Backdrop with pulsing effect */}
            <div
                className="absolute inset-0 bg-gradient-to-br from-amber-500/90 to-orange-600/90 backdrop-blur-md"
                onClick={onDismiss}
            />

            {/* Alert Card */}
            <div className="relative bg-white rounded-[2.5rem] p-8 w-full max-w-sm shadow-2xl animate-scale-in">
                {/* Pulsing Ring Icon */}
                <div className="absolute -top-10 left-1/2 -translate-x-1/2">
                    <div className="relative">
                        {/* Pulse rings */}
                        <div className="absolute inset-0 w-20 h-20 bg-amber-400 rounded-full animate-ping opacity-30" />
                        <div className="absolute inset-0 w-20 h-20 bg-amber-400 rounded-full animate-ping opacity-20 animation-delay-150" />
                        {/* Main icon */}
                        <div className="relative w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-xl shadow-orange-500/30">
                            <Bell className="w-10 h-10 text-white animate-wiggle" />
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="mt-8 text-center">
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Table Needs Attention!</h2>

                    {/* Table Number - Large and prominent */}
                    <div className="my-6">
                        <div className="inline-flex items-center justify-center w-28 h-28 rounded-3xl bg-gradient-to-br from-orange-100 to-amber-100 border-4 border-orange-200">
                            <span className="text-5xl font-black text-orange-600">{ring.table_number}</span>
                        </div>
                        <p className="text-sm text-slate-500 mt-2 font-medium">Table Number</p>
                    </div>

                    {/* Reason Badge */}
                    {reasonInfo && (
                        <div className="inline-flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-full mb-4">
                            <span className="text-lg">{reasonInfo.emoji}</span>
                            <span className="font-medium text-slate-700">{reasonInfo.label}</span>
                        </div>
                    )}

                    {/* Time */}
                    <div className="flex items-center justify-center gap-2 text-slate-500 text-sm mb-6">
                        <Clock className="w-4 h-4" />
                        <span>Requested at {timeStr}</span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                        <button
                            onClick={onDismiss}
                            className="flex-1 py-4 bg-slate-100 text-slate-700 rounded-2xl font-semibold active:scale-95 transition-transform"
                        >
                            Dismiss
                        </button>
                        <button
                            onClick={() => {
                                onAcknowledge();
                                onDismiss();
                            }}
                            className="flex-1 py-4 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-2xl font-bold shadow-lg shadow-emerald-500/30 active:scale-95 transition-transform flex items-center justify-center gap-2"
                        >
                            <Check className="w-5 h-5" />
                            On My Way
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Add these keyframes to your CSS
// @keyframes wiggle {
//   0%, 100% { transform: rotate(-5deg); }
//   50% { transform: rotate(5deg); }
// }
// .animate-wiggle {
//   animation: wiggle 0.3s ease-in-out infinite;
// }
