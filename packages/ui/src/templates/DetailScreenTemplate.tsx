import * as React from 'react';
import { ArrowLeft } from 'lucide-react';
import { cn } from '../lib/utils';
import { Skeleton } from '../components/ui/Skeleton';

export interface DetailSection {
    id: string;
    title?: string;
    content: React.ReactNode;
}

export interface DetailScreenTemplateProps {
    /** Page title */
    title?: string;
    /** Back button handler */
    onBack?: () => void;
    /** Right header action */
    rightAction?: React.ReactNode;
    /** Hero/header content (image, banner, etc.) */
    hero?: React.ReactNode;
    /** Content sections */
    sections?: DetailSection[];
    /** Direct children (alternative to sections) */
    children?: React.ReactNode;
    /** Loading state */
    loading?: boolean;
    /** Sticky footer content (CTA button, etc.) */
    footer?: React.ReactNode;
    /** Additional className for content area */
    className?: string;
}

/**
 * DetailScreenTemplate
 * Template: header + hero + content sections.
 * Standardizes detail/view screens across the app.
 */
export function DetailScreenTemplate({
    title,
    onBack,
    rightAction,
    hero,
    sections,
    children,
    loading = false,
    footer,
    className,
}: DetailScreenTemplateProps) {
    return (
        <div className="flex flex-col min-h-screen bg-background">
            {/* Header - sticky over hero */}
            <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
                <div className="flex items-center justify-between h-14 px-4">
                    <div className="flex-shrink-0 w-10">
                        {onBack && (
                            <button
                                onClick={onBack}
                                className="p-2 -ml-2 rounded-xl hover:bg-muted/50 transition-colors"
                                aria-label="Go back"
                            >
                                <ArrowLeft className="h-5 w-5" />
                            </button>
                        )}
                    </div>

                    {title && (
                        <h1 className="flex-1 text-center font-semibold text-foreground truncate px-2">
                            {title}
                        </h1>
                    )}

                    <div className="flex-shrink-0 w-10 flex justify-end">
                        {rightAction}
                    </div>
                </div>
            </header>

            {/* Main content */}
            <main className={cn('flex-1 overflow-y-auto', footer ? 'pb-24' : 'pb-20', className)}>
                {loading ? (
                    <div className="space-y-4">
                        {hero && <Skeleton className="h-48 rounded-none" />}
                        <div className="p-4 space-y-4">
                            <Skeleton className="h-8 w-3/4" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-2/3" />
                            <div className="pt-4 space-y-3">
                                <Skeleton className="h-20 rounded-xl" />
                                <Skeleton className="h-20 rounded-xl" />
                            </div>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Hero */}
                        {hero && <div className="flex-shrink-0">{hero}</div>}

                        {/* Sections */}
                        {sections && sections.length > 0 ? (
                            <div className="divide-y divide-border">
                                {sections.map((section) => (
                                    <section key={section.id} className="p-4">
                                        {section.title && (
                                            <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">
                                                {section.title}
                                            </h2>
                                        )}
                                        {section.content}
                                    </section>
                                ))}
                            </div>
                        ) : (
                            children
                        )}
                    </>
                )}
            </main>

            {/* Sticky footer */}
            {footer && (
                <div className="fixed bottom-0 left-0 right-0 z-30 bg-background/95 backdrop-blur border-t border-border p-4 pb-safe">
                    {footer}
                </div>
            )}
        </div>
    );
}
