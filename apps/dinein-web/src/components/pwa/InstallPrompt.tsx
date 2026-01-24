import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';
import { useInstallPrompt } from '@/hooks/useInstallPrompt';
import { GlassCard } from '@/components/ui/GlassCard';

export function InstallPrompt() {
    const { isInstallable, promptToInstall } = useInstallPrompt();
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (isInstallable) {
            // Delay showing the prompt to not be intrusive immediately
            const timer = setTimeout(() => setIsVisible(true), 3000);
            return () => clearTimeout(timer);
        }
    }, [isInstallable]);

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-20 left-4 right-4 z-50 animate-slide-up">
            <GlassCard className="p-4 flex items-center gap-4 bg-white/90 backdrop-blur-xl border-indigo-200/50 shadow-2xl shadow-indigo-500/20">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shrink-0">
                    <Download className="w-6 h-6 text-white" />
                </div>

                <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-900 text-sm">Install DineIn</h3>
                    <p className="text-xs text-slate-500">Add to home screen for the best experience</p>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setIsVisible(false)}
                        className="p-2 rounded-full hover:bg-slate-100 text-slate-400 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => {
                            promptToInstall();
                            setIsVisible(false);
                        }}
                        className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl shadow-lg hover:bg-slate-800 transition-colors"
                    >
                        Install
                    </button>
                </div>
            </GlassCard>
        </div>
    );
}
