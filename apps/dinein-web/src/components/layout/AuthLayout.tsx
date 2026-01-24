import { ReactNode } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';

interface AuthLayoutProps {
    children: ReactNode;
    title: string;
    subtitle?: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-indigo-500/20 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[100px] pointer-events-none" />

            <div className="w-full max-w-sm relative z-10 animate-fade-in-up">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-2xl mx-auto mb-4 shadow-lg shadow-indigo-500/30 flex items-center justify-center text-3xl">
                        🍽️
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
                    {subtitle && <p className="text-slate-500 mt-2 text-sm">{subtitle}</p>}
                </div>

                <GlassCard className="p-6 md:p-8" depth="2">
                    {children}
                </GlassCard>

                <p className="text-center mt-8 text-xs text-slate-400">
                    &copy; {new Date().getFullYear()} DineIn Malta. All rights reserved.
                </p>
            </div>
        </div>
    );
}
