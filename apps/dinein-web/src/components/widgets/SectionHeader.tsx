import React from 'react';
import { ChevronRight } from 'lucide-react';

interface SectionHeaderProps {
    title: string;
    actionLabel?: string;
    onAction?: () => void;
    count?: number;
    className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
    title,
    actionLabel,
    onAction,
    count,
    className
}) => {
    return (
        <div className={`flex items-center justify-between mb-4 px-1 ${className}`}>
            <div className="flex items-center gap-2">
                <h2 className="font-bold text-lg text-slate-900 tracking-tight">{title}</h2>
                {count !== undefined && (
                    <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                        {count}
                    </span>
                )}
            </div>
            {actionLabel && (
                <button
                    onClick={onAction}
                    className="group flex items-center gap-0.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 active:opacity-70 transition-all"
                >
                    {actionLabel}
                    <ChevronRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                </button>
            )}
        </div>
    );
};
