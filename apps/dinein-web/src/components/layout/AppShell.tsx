import React, { useState } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
// BottomNav handled by consumer
import { StatusHeader } from './StatusHeader';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface AppShellProps {
    children: React.ReactNode;
    className?: string;
    showBottomNav?: boolean;
    showHeader?: boolean;
    title?: string;
    subtitle?: string;
}

export const AppShell: React.FC<AppShellProps> = ({
    children,
    className,
    showBottomNav = true,
    showHeader = true,
    title,
    subtitle
}) => {
    return (
        <div className="min-h-screen relative overflow-x-hidden bg-slate-50 selection:bg-indigo-100 selection:text-indigo-900">
            {/* 
              Global Premium Background 
              Unified soft gradient background
            */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] bg-indigo-200/20 rounded-full blur-[120px] mix-blend-multiply opacity-60 animate-pulse-soft" />
                <div className="absolute bottom-[-20%] right-[-20%] w-[80%] h-[80%] bg-purple-200/20 rounded-full blur-[120px] mix-blend-multiply opacity-60 animate-pulse-soft delay-1000" />
            </div>

            {/* App Header */}
            {showHeader && (
                <StatusHeader
                    title={title}
                    subtitle={subtitle}
                />
            )}

            {/* Main Content Container */}
            <main
                className={cn(
                    "w-full max-w-md mx-auto min-h-screen relative z-10",
                    "flex flex-col",
                    showBottomNav ? "pb-[90px]" : "pb-safe", // Space for bottom nav + extra
                    !showHeader && "pt-safe", // If no header, ensure safe area top
                    className
                )}
            >
                {/* Offline Banner */}
                <OfflineBanner />
                {children}
            </main>


            {/* Bottom Navigation (Rendered by children if needed) */}
            {/* We just provide the padding via 'showBottomNav' prop */}
        </div>
    );
};

function OfflineBanner() {
    const [isOffline, setIsOffline] = useState(!navigator.onLine);

    React.useEffect(() => {
        const handleOnline = () => setIsOffline(false);
        const handleOffline = () => setIsOffline(true);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    if (!isOffline) return null;

    return (
        <div className="bg-amber-500 text-white px-4 py-2 text-xs font-semibold text-center shadow-lg relative z-50 animate-in slide-in-from-top duration-300">
            Connection lost. You are browsing offline.
        </div>
    );
}
