'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Check, X, RefreshCw, Loader2 } from 'lucide-react';

interface ImageGenerationProgressProps {
    isGenerating: boolean;
    error?: string | null;
    onRetry?: () => void;
    label?: string;
}

export function ImageGenerationProgress({
    isGenerating,
    error,
    onRetry,
    label = "Generating AI Image...",
}: ImageGenerationProgressProps) {
    if (!isGenerating && !error) return null;

    return (
        <Card className="p-4 border-primary/20 bg-primary/5">
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {isGenerating ? (
                            <Loader2 className="w-4 h-4 text-primary animate-spin" />
                        ) : error ? (
                            <X className="w-4 h-4 text-destructive" />
                        ) : (
                            <Check className="w-4 h-4 text-green-500" />
                        )}
                        <h4 className="font-semibold text-sm">{label}</h4>
                    </div>
                </div>

                {isGenerating && <Progress value={undefined} className="h-1.5" />}

                {error && (
                    <div className="text-xs text-destructive flex items-center justify-between gap-2">
                        <span>{error}</span>
                        {onRetry && (
                            <Button variant="outline" size="icon" className="h-6 w-6" onClick={onRetry}>
                                <RefreshCw className="w-3 h-3" />
                            </Button>
                        )}
                    </div>
                )}
            </div>
        </Card>
    );
}
