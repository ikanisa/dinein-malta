import { Link, Download, Grid } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { cn } from '../lib/utils';
import { GlassCard } from '../components/ui/GlassCard';

export interface QRActionDockProps {
    onCopyLink: () => void;
    onDownloadQR: () => void;
    onGenerateTableQR: () => void;
    className?: string;
    venueSlug?: string;
}

/**
 * QR Action Dock
 * Floating or static dock for Venue Share screen.
 * Provides quick actions for sharing/generating connection points.
 */
export function QRActionDock({
    onCopyLink,
    onDownloadQR,
    onGenerateTableQR,
    className,
    venueSlug
}: QRActionDockProps) {
    const actions = [
        {
            label: 'Copy Link',
            icon: Link,
            onClick: onCopyLink,
            primary: false
        },
        {
            label: 'Download PDF',
            icon: Download,
            onClick: onDownloadQR,
            primary: false
        },
        {
            label: 'Table Mode',
            icon: Grid,
            onClick: onGenerateTableQR,
            primary: true
        }
    ];

    return (
        <GlassCard className={cn("p-4", className)}>
            <div className="flex items-center justify-between gap-2">
                {actions.map((action, idx) => {
                    const Icon = action.icon;
                    return (
                        <Button
                            key={idx}
                            variant={action.primary ? "default" : "secondary"}
                            className={cn(
                                "flex-1 flex-col h-auto py-3 gap-2",
                                action.primary ? "" : "bg-muted/50 hover:bg-muted"
                            )}
                            onClick={action.onClick}
                        >
                            <Icon className="h-5 w-5" />
                            <span className="text-xs font-medium">{action.label}</span>
                        </Button>
                    );
                })}
            </div>
            {venueSlug && (
                <div className="mt-4 pt-4 border-t border-border/50 text-center">
                    <p className="text-xs text-muted-foreground">
                        dinein.app/v/<span className="font-mono text-foreground">{venueSlug}</span>
                    </p>
                </div>
            )}
        </GlassCard>
    );
}
