import { useEffect, useState } from 'react';

export const SplashScreen = ({ onComplete }: { onComplete?: () => void }) => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
            if (onComplete) onComplete();
        }, 2000);
        return () => clearTimeout(timer);
    }, [onComplete]);

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-gradient-to-br from-purple-600 via-pink-600 to-red-500 flex items-center justify-center animate-fade-out" style={{ animationDelay: '1.8s', animationFillMode: 'forwards' }}>
            <div className="text-center">
                <div className="text-8xl mb-4 animate-bounce">🍽️</div>
                <h1 className="text-5xl font-bold text-white mb-2 tracking-tight">DineIn</h1>
                <p className="text-white/80 text-lg font-medium">Malta's Dining Experience</p>
                <div className="mt-8">
                    <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto"></div>
                </div>
            </div>
        </div>
    );
};
