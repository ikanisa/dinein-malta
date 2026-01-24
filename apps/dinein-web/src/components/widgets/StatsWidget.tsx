import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { GlassCard } from './GlassCard';

interface StatsWidgetProps {
    label: string;
    value: string;
    icon?: LucideIcon;
    trend?: string;
    trendUp?: boolean;
    subValue?: string;
    color?: 'indigo' | 'coral' | 'emerald' | 'amber';
    delay?: number; // for animation stagger
}

export function StatsWidget({
    label,
    value,
    icon: Icon,
    trend,
    trendUp,
    subValue,
    color = 'indigo',
    delay = 0
}: StatsWidgetProps) {

    const getColorClass = () => {
        switch (color) {
            case 'coral': return 'text-rose-500 bg-rose-50';
            case 'emerald': return 'text-emerald-500 bg-emerald-50';
            case 'amber': return 'text-amber-500 bg-amber-50';
            default: return 'text-indigo-500 bg-indigo-50';
        }
    };

    return (
        <GlassCard
            className={`p-5 relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300 animate-fade-in-up`}
            style={{ animationDelay: `${delay}ms` }}
        >
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl ${getColorClass()} shadow-sm`}>
                    {Icon && <Icon className="w-6 h-6" />}
                </div>
                {trend && (
                    <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${trendUp
                        ? 'bg-emerald-100/50 text-emerald-600'
                        : 'bg-rose-100/50 text-rose-600'
                        }`}>
                        {trendUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {trend}
                    </div>
                )}
            </div>

            <div>
                <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">{label}</p>
                <h3 className="text-2xl font-bold text-slate-900 tracking-tight">{value}</h3>
                {subValue && (
                    <p className="text-slate-400 text-xs mt-1 font-medium">{subValue}</p>
                )}
            </div>

            {/* Decorative gradient background blur */}
            <div className={`absolute -right-6 -bottom-6 w-24 h-24 rounded-full opacity-10 blur-2xl ${color === 'coral' ? 'bg-rose-500' :
                color === 'emerald' ? 'bg-emerald-500' :
                    color === 'amber' ? 'bg-amber-500' :
                        'bg-indigo-500'
                }`} />
        </GlassCard>
    );
}
