import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';


export function PromoCard({ className }: { className?: string }) {
    return (
        <div className={cn(
            "relative overflow-hidden rounded-[2rem] min-h-[160px] flex items-center group",
            className
        )}>
            {/* Background Image / Gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600" />
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1544025162-d76694265947?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80')] bg-cover bg-center opacity-40 mix-blend-overlay group-hover:scale-105 transition-transform duration-700" />

            {/* Gradient Overlay for Text Readability */}
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/80 via-indigo-900/40 to-transparent" />

            {/* Content */}
            <div className="relative z-10 p-6 max-w-[70%]">
                <span className="inline-block px-2.5 py-1 rounded-lg bg-white/20 backdrop-blur-md border border-white/20 text-[10px] font-bold text-white mb-2 uppercase tracking-wide">
                    Limited Time
                </span>
                <h3 className="text-xl font-bold text-white mb-1 leading-tight">
                    Double Points on Lunch
                </h3>
                <p className="text-indigo-100 text-sm mb-4 font-medium opacity-90">
                    Order between 11 AM - 2 PM
                </p>
                <button className="flex items-center gap-2 px-4 py-2 bg-white text-indigo-600 rounded-xl text-xs font-bold shadow-lg shadow-indigo-900/20 active:scale-95 transition-all hover:bg-indigo-50">
                    Order Now
                    <ArrowRight className="w-3.5 h-3.5" />
                </button>
            </div>

            {/* Decorative Glass Shape */}
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
        </div>
    );
}
