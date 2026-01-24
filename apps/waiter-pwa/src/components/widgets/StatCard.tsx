import { ArrowUpRight, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

export function StatCard({ className }: { className?: string }) {
    return (
        <a href="/profile" className={cn("glass-depth-2 p-5 relative overflow-hidden group block transition-transform active:scale-95", className)}>
            <div className="absolute top-0 right-0 p-4 opacity-50">
                <div className="w-16 h-16 rounded-full bg-indigo-500/20 blur-xl" />
            </div>

            <div className="relative z-10 flex justify-between items-start">
                <div>
                    <h3 className="text-sm font-semibold text-slate-500 mb-1">DineIn Rewards</h3>
                    <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                            1,250
                        </span>
                        <span className="text-xs font-medium text-emerald-600 flex items-center gap-0.5">
                            <ArrowUpRight className="w-3 h-3" />
                            +120
                        </span>
                    </div>
                </div>
                <div className="p-2.5 rounded-2xl bg-indigo-50/50 text-indigo-600 shadow-sm border border-indigo-100/50">
                    <Star className="w-5 h-5 fill-indigo-600/20" />
                </div>
            </div>

            <div className="mt-4">
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 w-[65%] rounded-full shadow-[0_0_10px_rgba(99,102,241,0.4)]" />
                </div>
                <p className="text-[10px] text-slate-400 mt-2 font-medium">
                    250 points to Gold Status
                </p>
            </div>
        </a>
    );
}
