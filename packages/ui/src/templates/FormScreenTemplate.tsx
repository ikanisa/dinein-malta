import * as React from 'react';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { Button } from '../components/ui/Button';

export interface FormScreenTemplateProps {
    /** Page title */
    title: string;
    /** Back button handler */
    onBack?: () => void;
    /** Right header action */
    rightAction?: React.ReactNode;
    /** Form submit handler */
    onSubmit?: () => void;
    /** Submit button text */
    submitText?: string;
    /** Submit button loading state */
    submitting?: boolean;
    /** Submit button disabled state */
    submitDisabled?: boolean;
    /** Form fields */
    children: React.ReactNode;
    /** Info text above submit button */
    submitInfo?: string;
    /** Additional className for form area */
    className?: string;
}

/**
 * FormScreenTemplate
 * Template: stacked form fields + sticky save button.
 * Standardizes form screens across the app.
 */
export function FormScreenTemplate({
    title,
    onBack,
    rightAction,
    onSubmit,
    submitText = 'Save',
    submitting = false,
    submitDisabled = false,
    children,
    submitInfo,
    className,
}: FormScreenTemplateProps) {
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit?.();
    };

    return (
        <div className="flex flex-col min-h-screen bg-background">
            {/* Header */}
            <header className="flex-shrink-0 sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
                <div className="flex items-center justify-between h-14 px-4">
                    <div className="flex-shrink-0 w-10">
                        {onBack && (
                            <button
                                onClick={onBack}
                                className="p-2 -ml-2 rounded-xl hover:bg-muted/50 transition-colors"
                                aria-label="Go back"
                                disabled={submitting}
                            >
                                <ArrowLeft className="h-5 w-5" />
                            </button>
                        )}
                    </div>

                    <h1 className="flex-1 text-center font-semibold text-foreground truncate px-2">
                        {title}
                    </h1>

                    <div className="flex-shrink-0 w-10 flex justify-end">
                        {rightAction}
                    </div>
                </div>
            </header>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
                <main className={cn('flex-1 overflow-y-auto p-4 pb-28', className)}>
                    <div className="space-y-4 max-w-md mx-auto">
                        {children}
                    </div>
                </main>

                {/* Sticky submit button */}
                <div className="fixed bottom-0 left-0 right-0 z-30 bg-background/95 backdrop-blur border-t border-border p-4 pb-safe">
                    <div className="max-w-md mx-auto">
                        {submitInfo && (
                            <p className="text-xs text-muted-foreground text-center mb-3">
                                {submitInfo}
                            </p>
                        )}
                        <Button
                            type="submit"
                            className="w-full"
                            disabled={submitDisabled || submitting}
                        >
                            {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            {submitText}
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
}

// Helper component for form fields
export interface FormFieldProps {
    /** Field label */
    label: string;
    /** Error message */
    error?: string;
    /** Required indicator */
    required?: boolean;
    /** Help text */
    helpText?: string;
    /** Field content */
    children: React.ReactNode;
    /** Additional className */
    className?: string;
}

/**
 * FormField
 * Wrapper for form inputs with label and error handling.
 */
export function FormField({
    label,
    error,
    required,
    helpText,
    children,
    className,
}: FormFieldProps) {
    return (
        <div className={cn('space-y-1.5', className)}>
            <label className="block text-sm font-medium text-foreground">
                {label}
                {required && <span className="text-destructive ml-0.5">*</span>}
            </label>
            {children}
            {helpText && !error && (
                <p className="text-xs text-muted-foreground">{helpText}</p>
            )}
            {error && (
                <p className="text-xs text-destructive">{error}</p>
            )}
        </div>
    );
}
