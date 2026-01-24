import { useState } from 'react';
import { Bell, X, Check, Loader2, AlertCircle } from 'lucide-react';
import { useRingWaiter, type RingReason } from '../../hooks/useRingWaiter';

const REASONS: { id: RingReason; label: string; emoji: string }[] = [
    { id: 'ready_to_order', label: 'Ready to Order', emoji: '📝' },
    { id: 'need_help', label: 'Need Help', emoji: '🙋' },
    { id: 'check_please', label: 'Check Please', emoji: '💳' },
    { id: 'other', label: 'Other', emoji: '❓' },
];

interface RingWaiterModalProps {
    isOpen: boolean;
    onClose: () => void;
    vendorId: string;
    vendorName?: string;
    prefilledTableNumber?: number;
}

export function RingWaiterModal({
    isOpen,
    onClose,
    vendorId,
    vendorName,
    prefilledTableNumber
}: RingWaiterModalProps) {
    const [tableNumber, setTableNumber] = useState(prefilledTableNumber?.toString() || '');
    const [selectedReason, setSelectedReason] = useState<RingReason>(null);
    const [step, setStep] = useState<'table' | 'reason' | 'success'>(prefilledTableNumber ? 'reason' : 'table');

    const { sendRing, loading, error, cooldownRemaining, reset } = useRingWaiter();

    if (!isOpen) return null;

    const handleSubmit = async () => {
        const tableNum = parseInt(tableNumber);
        if (isNaN(tableNum) || tableNum < 1) return;

        const sent = await sendRing(vendorId, tableNum, selectedReason);
        if (sent) {
            setStep('success');
        }
    };

    const handleClose = () => {
        reset();
        setTableNumber(prefilledTableNumber?.toString() || '');
        setSelectedReason(null);
        setStep(prefilledTableNumber ? 'reason' : 'table');
        onClose();
    };

    const handleTableContinue = () => {
        const tableNum = parseInt(tableNumber);
        if (!isNaN(tableNum) && tableNum > 0) {
            setStep('reason');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
            <div className="bg-white w-full sm:max-w-md sm:rounded-3xl rounded-t-[2.5rem] p-6 animate-slide-up shadow-2xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
                            <Bell className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">Ring Waiter</h2>
                            {vendorName && <p className="text-sm text-slate-500">{vendorName}</p>}
                        </div>
                    </div>
                    <button
                        onClick={handleClose}
                        className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors"
                    >
                        <X className="w-5 h-5 text-slate-600" />
                    </button>
                </div>

                {/* Step 1: Table Number */}
                {step === 'table' && (
                    <div className="space-y-6">
                        <div className="text-center">
                            <p className="text-slate-600 mb-4">Enter your table number to call a waiter</p>
                        </div>

                        <div className="relative">
                            <input
                                type="number"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                placeholder="Table Number"
                                value={tableNumber}
                                onChange={(e) => setTableNumber(e.target.value)}
                                className="w-full text-center text-4xl font-bold py-6 bg-slate-50 rounded-2xl border-2 border-slate-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20 outline-none transition-all"
                                autoFocus
                            />
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 text-red-500 text-sm bg-red-50 p-3 rounded-xl">
                                <AlertCircle className="w-4 h-4 shrink-0" />
                                {error}
                            </div>
                        )}

                        <button
                            onClick={handleTableContinue}
                            disabled={!tableNumber || parseInt(tableNumber) < 1}
                            className="w-full py-4 btn-primary !rounded-2xl text-lg font-bold shadow-lg shadow-orange-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Continue
                        </button>
                    </div>
                )}

                {/* Step 2: Reason (Optional) */}
                {step === 'reason' && (
                    <div className="space-y-6">
                        <div className="text-center">
                            <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-3 py-1.5 rounded-full text-sm font-medium mb-3">
                                <span>Table {tableNumber}</span>
                            </div>
                            <p className="text-slate-600">What do you need? (Optional)</p>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            {REASONS.map((reason) => (
                                <button
                                    key={reason.id}
                                    onClick={() => setSelectedReason(selectedReason === reason.id ? null : reason.id)}
                                    className={`p-4 rounded-2xl border-2 transition-all active:scale-95 ${selectedReason === reason.id
                                        ? 'border-orange-500 bg-orange-50 shadow-lg shadow-orange-500/10'
                                        : 'border-slate-200 bg-white hover:border-slate-300'
                                        }`}
                                >
                                    <span className="text-2xl mb-2 block">{reason.emoji}</span>
                                    <span className={`text-sm font-medium ${selectedReason === reason.id ? 'text-orange-700' : 'text-slate-700'
                                        }`}>
                                        {reason.label}
                                    </span>
                                </button>
                            ))}
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 text-red-500 text-sm bg-red-50 p-3 rounded-xl">
                                <AlertCircle className="w-4 h-4 shrink-0" />
                                {error}
                            </div>
                        )}

                        <div className="flex gap-3">
                            <button
                                onClick={() => setStep('table')}
                                className="flex-1 py-4 bg-slate-100 text-slate-700 rounded-2xl font-semibold active:scale-95 transition-transform"
                            >
                                Back
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={loading || cooldownRemaining > 0}
                                className="flex-1 py-4 btn-primary !rounded-2xl font-bold shadow-lg shadow-orange-500/25 disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : cooldownRemaining > 0 ? (
                                    `Wait ${cooldownRemaining}s`
                                ) : (
                                    <>
                                        <Bell className="w-5 h-5" />
                                        Ring Now
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 3: Success */}
                {step === 'success' && (
                    <div className="text-center py-6 space-y-6">
                        <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center shadow-lg shadow-emerald-500/30 animate-scale-in">
                            <Check className="w-10 h-10 text-white" />
                        </div>

                        <div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">Waiter Notified!</h3>
                            <p className="text-slate-500">
                                A staff member will be with you at Table {tableNumber} shortly.
                            </p>
                        </div>

                        <button
                            onClick={handleClose}
                            className="w-full py-4 bg-slate-100 text-slate-700 rounded-2xl font-semibold active:scale-95 transition-transform"
                        >
                            Done
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
