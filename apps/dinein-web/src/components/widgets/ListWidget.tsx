import { ReactNode } from 'react';
import { ChevronRight } from 'lucide-react';
import { GlassCard } from './GlassCard';

interface ListWidgetProps {
    title: string;
    actionLabel?: string;
    onAction?: () => void;
    children: ReactNode;
    className?: string;
}

export function ListWidget({ title, actionLabel, onAction, children, className }: ListWidgetProps) {
    return (
        <GlassCard className={`flex flex-col ${className || ''}`}>
            <div className="p-5 flex items-center justify-between border-b border-slate-100/50">
                <h3 className="font-bold text-slate-800 tracking-tight">{title}</h3>
                {actionLabel && (
                    <button
                        onClick={onAction}
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 transition-colors"
                    >
                        {actionLabel}
                        <ChevronRight className="w-3 h-3" />
                    </button>
                )}
            </div>
            <div className="flex-1 p-2">
                {children}
            </div>
        </GlassCard>
    );
}
