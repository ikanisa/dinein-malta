import { BottomSheet } from '../components/ui/BottomSheet';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { User, MapPin, Mail, Phone, ExternalLink, Check, X } from 'lucide-react';
import { format } from 'date-fns';

export interface ClaimantInfo {
    email: string;
    fullName?: string;
    phone?: string;
    submittedAt: string;
}

export interface VenuePreview {
    id: string;
    name: string;
    address?: string;
    slug: string;
    imageUrl?: string; // If we had images, but we don't. Maybe ignore.
}

export interface ClaimReviewSheetProps {
    isOpen: boolean;
    onClose: () => void;
    claimant: ClaimantInfo;
    venue: VenuePreview;
    onApprove: () => void;
    onReject: () => void;
    isLoading?: boolean;
}

/**
 * Claim Review Sheet
 * Admin widget to quickly screen venue claims.
 */
export function ClaimReviewSheet({
    isOpen,
    onClose,
    claimant,
    venue,
    onApprove,
    onReject,
    isLoading = false
}: ClaimReviewSheetProps) {
    return (
        <BottomSheet
            isOpen={isOpen}
            onClose={onClose}
            title="Review Claim"
            className="sm:max-w-md"
        >
            <div className="flex flex-col gap-6 px-4 pb-8">
                {/* Venue Card Preview */}
                <div className="rounded-xl bg-muted/30 p-4 border border-border/50">
                    <div className="flex justify-between items-start mb-2">
                        <Badge variant="outline" className="text-[10px] text-muted-foreground uppercase tracking-wide">
                            Target Venue
                        </Badge>
                        <a
                            href={`/v/${venue.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-primary flex items-center gap-1 hover:underline"
                        >
                            View Live <ExternalLink className="h-3 w-3" />
                        </a>
                    </div>
                    <h3 className="font-bold text-lg">{venue.name}</h3>
                    {venue.address && (
                        <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                            <MapPin className="h-3.5 w-3.5" />
                            <span className="line-clamp-1">{venue.address}</span>
                        </div>
                    )}
                    <div className="mt-3 text-xs font-mono text-muted-foreground bg-muted p-1.5 rounded w-fit">
                        ID: {venue.id.slice(0, 8)}...
                    </div>
                </div>

                {/* Claimant Info */}
                <div className="flex flex-col gap-3">
                    <h4 className="text-sm font-semibold text-muted-foreground">Claimant</h4>

                    <div className="grid gap-2">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                <User className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="font-medium text-sm">{claimant.fullName || 'Anonymous User'}</p>
                                <p className="text-xs text-muted-foreground">
                                    Submitted {format(new Date(claimant.submittedAt), 'MMM d, h:mm a')}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 text-sm ml-13 pl-1">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span>{claimant.email}</span>
                        </div>
                        {claimant.phone && (
                            <div className="flex items-center gap-2 text-sm ml-13 pl-1">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                <span>{claimant.phone}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-3 mt-2">
                    <Button
                        variant="outline"
                        onClick={onReject}
                        disabled={isLoading}
                        className="w-full gap-2 border-destructive/50 text-destructive hover:bg-destructive/10 hover:text-destructive"
                    >
                        <X className="h-4 w-4" />
                        Reject
                    </Button>
                    <Button
                        onClick={onApprove}
                        disabled={isLoading}
                        className="w-full gap-2 bg-green-600 hover:bg-green-700 text-white"
                    >
                        <Check className="h-4 w-4" />
                        Approve
                    </Button>
                </div>
            </div>
        </BottomSheet>
    );
}
