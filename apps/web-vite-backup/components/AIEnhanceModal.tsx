
import React from 'react';
import { GlassCard } from './GlassCard';
import { Spinner } from './Loading';

interface AIEnhanceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    isLoading?: boolean;
    previewData?: any;
    originalData?: any;
}

export const AIEnhanceModal: React.FC<AIEnhanceModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title = 'AI Enhancement Preview',
    isLoading,
    previewData,
    originalData,
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <GlassCard className="w-full max-w-lg max-h-[85vh] flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center mb-4 pb-4 border-b border-border">
                    <div className="flex items-center gap-2">
                        <span className="text-xl">✨</span>
                        <h2 className="text-xl font-bold text-foreground">{title}</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-muted hover:text-foreground text-2xl leading-none"
                    >
                        ×
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto min-h-[200px] space-y-4">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center h-full py-12 space-y-4">
                            <Spinner className="w-8 h-8 text-purple-500" />
                            <p className="text-muted animate-pulse">Consulting the AI...</p>
                        </div>
                    ) : previewData ? (
                        <div className="space-y-4">
                            <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl">
                                <h3 className="text-xs font-bold text-purple-400 uppercase tracking-wide mb-2">Suggested Changes</h3>
                                <pre className="text-xs text-foreground/80 whitespace-pre-wrap font-mono">
                                    {JSON.stringify(previewData, null, 2)}
                                </pre>
                            </div>

                            {originalData && (
                                <div className="p-3 bg-surface-highlight border border-border rounded-xl opacity-70">
                                    <h3 className="text-xs font-bold text-muted uppercase tracking-wide mb-2">Current Data</h3>
                                    <pre className="text-xs text-muted whitespace-pre-wrap font-mono">
                                        {JSON.stringify(originalData, null, 2)}
                                    </pre>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-center text-muted py-8">
                            No changes to preview.
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex gap-3 pt-4 mt-4 border-t border-border">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 bg-surface-highlight text-foreground font-bold rounded-xl active:scale-95 transition-transform"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isLoading || !previewData}
                        className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Processing...' : 'Apply Changes'}
                    </button>
                </div>
            </GlassCard>
        </div>
    );
};
