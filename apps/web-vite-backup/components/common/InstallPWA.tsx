import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './Button';

interface BeforeInstallPromptEvent extends Event {
    prompt(): Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const InstallPWA: React.FC = () => {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [showPrompt, setShowPrompt] = useState(false);

    useEffect(() => {
        const handler = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);

            // Show prompt after 30 seconds or on second visit
            const installPromptCount = parseInt(localStorage.getItem('installPromptCount') || '0');
            if (installPromptCount < 3) {
                setTimeout(() => {
                    setShowPrompt(true);
                }, 30000);
            }
        };

        window.addEventListener('beforeinstallprompt', handler);

        return () => {
            window.removeEventListener('beforeinstallprompt', handler);
        };
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;

        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            // PWA installed successfully
        }

        setDeferredPrompt(null);
        setShowPrompt(false);

        const count = parseInt(localStorage.getItem('installPromptCount') || '0');
        localStorage.setItem('installPromptCount', (count + 1).toString());
    };

    const handleDismiss = () => {
        setShowPrompt(false);
        const count = parseInt(localStorage.getItem('installPromptCount') || '0');
        localStorage.setItem('installPromptCount', (count + 1).toString());
    };

    return (
        <AnimatePresence>
            {showPrompt && deferredPrompt && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    className="fixed bottom-4 left-4 right-4 z-50"
                >
                    <div className="glass-panel rounded-2xl p-4 shadow-2xl">
                        <button
                            onClick={handleDismiss}
                            className="absolute top-3 right-3 p-1.5 text-muted hover:text-foreground transition-colors rounded-full hover:bg-surface-highlight"
                            aria-label="Dismiss"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>

                        <div className="flex items-start gap-3">
                            <div className="p-2.5 bg-primary/10 rounded-xl shrink-0">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                    <polyline points="7 10 12 15 17 10" />
                                    <line x1="12" y1="15" x2="12" y2="3" />
                                </svg>
                            </div>

                            <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-foreground mb-1">
                                    Install DineIn
                                </h3>
                                <p className="text-sm text-muted mb-3 leading-relaxed">
                                    Get faster access, offline ordering, and a native app experience.
                                </p>

                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        onClick={handleInstall}
                                    >
                                        Install
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={handleDismiss}
                                    >
                                        Not now
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default InstallPWA;
