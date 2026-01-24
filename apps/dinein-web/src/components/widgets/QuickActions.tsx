import { QrCode, ClipboardList, Timer, Percent } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { QRScannerModal } from '@/shared/components/QRScannerModal';
import { useToast } from '@/components/Toast';

export function QuickActions({ className }: { className?: string }) {
    const [showScanner, setShowScanner] = useState(false);
    const { showToast } = useToast();

    const actions = [
        {
            label: 'Scan QR',
            icon: QrCode,
            color: 'text-indigo-600',
            bg: 'bg-indigo-50 hover:bg-indigo-100',
            onClick: () => setShowScanner(true)
        },
        {
            label: 'Reorder',
            icon: ClipboardList,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50 hover:bg-emerald-100',
            onClick: () => showToast('Reordering your last meal...', 'success')
        },
        {
            label: 'Recent',
            icon: Timer,
            color: 'text-amber-600',
            bg: 'bg-amber-50 hover:bg-amber-100',
            onClick: () => showToast('Previous orders coming soon!', 'info')
        },
        {
            label: 'Offers',
            icon: Percent,
            color: 'text-rose-600',
            bg: 'bg-rose-50 hover:bg-rose-100',
            onClick: () => showToast('2 active offers available!', 'warning')
        },
    ];

    const handleScan = (slug: string, table: string) => {
        window.location.href = `/m/${slug}/${table}`;
    };

    return (
        <>
            <div className={cn("grid grid-cols-4 gap-3", className)}>
                {actions.map((action) => (
                    <button
                        key={action.label}
                        onClick={action.onClick}
                        className="flex flex-col items-center gap-2 group"
                    >
                        <div className={cn(
                            "w-14 h-14 rounded-[1.25rem] flex items-center justify-center transition-all duration-300 shadow-sm border border-transparent hover:scale-105 active:scale-95",
                            "glass-depth-1", // Use glass effect for base
                            action.color
                        )}>
                            <action.icon className="w-6 h-6 drop-shadow-sm" />
                        </div>
                        <span className="text-[11px] font-semibold text-slate-600 group-hover:text-slate-900 transition-colors">
                            {action.label}
                        </span>
                    </button>
                ))}
            </div>

            <QRScannerModal
                isOpen={showScanner}
                onClose={() => setShowScanner(false)}
                onScan={handleScan}
            />
        </>
    );
}
