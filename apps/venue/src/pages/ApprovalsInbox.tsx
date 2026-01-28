/**
 * ApprovalsInbox - Venue manager's approval queue
 * 
 * Lists pending approvals for menu/promo publish.
 * Owner can approve/deny with notes.
 */

import { useState } from 'react';
import { Card, Button, Badge, BottomSheet, Input } from '@dinein/ui';
import { Check, X, Clock, FileText, AlertTriangle, ChevronRight } from 'lucide-react';
import { useVenueApprovals, VenueApproval, ApprovalStatus, RiskLevel } from '../hooks/useVenueApprovals';
import { useOwner } from '../context/OwnerContext';
import { toast } from 'sonner';

// =============================================================================
// HELPERS
// =============================================================================

function getRiskBadgeClass(risk: RiskLevel): string {
    switch (risk) {
        case 'critical': return 'bg-red-500/20 text-red-400 border-red-500/30';
        case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
        case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
        default: return 'bg-green-500/20 text-green-400 border-green-500/30';
    }
}

function getStatusIcon(status: ApprovalStatus) {
    switch (status) {
        case 'approved': return <Check className="h-4 w-4 text-green-500" />;
        case 'denied': return <X className="h-4 w-4 text-red-500" />;
        default: return <Clock className="h-4 w-4 text-yellow-500" />;
    }
}

function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleString('en-GB', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
    });
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function ApprovalsInbox() {
    const { isAuthenticated } = useOwner();
    const [filter, setFilter] = useState<ApprovalStatus | undefined>(undefined);
    const { approvals, loading, error, approve, deny } = useVenueApprovals(filter);
    const [selectedApproval, setSelectedApproval] = useState<VenueApproval | null>(null);
    const [actionNotes, setActionNotes] = useState('');
    const [actionLoading, setActionLoading] = useState(false);

    const handleApprove = async () => {
        if (!selectedApproval) return;
        setActionLoading(true);
        const success = await approve(selectedApproval.id, actionNotes);
        setActionLoading(false);
        if (success) {
            toast.success('Approved successfully');
            setSelectedApproval(null);
            setActionNotes('');
        }
    };

    const handleDeny = async () => {
        if (!selectedApproval) return;
        if (!actionNotes.trim()) {
            toast.error('Please provide a reason for denial');
            return;
        }
        setActionLoading(true);
        const success = await deny(selectedApproval.id, actionNotes);
        setActionLoading(false);
        if (success) {
            toast.success('Denied successfully');
            setSelectedApproval(null);
            setActionNotes('');
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Approvals Inbox</h1>
                <p className="text-muted-foreground">Review and approve pending requests</p>
            </div>

            {/* Filters */}
            <div className="flex gap-2 flex-wrap">
                {(['pending', 'approved', 'denied'] as ApprovalStatus[]).map(status => (
                    <Button
                        key={status}
                        variant={filter === status ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFilter(filter === status ? undefined : status)}
                    >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Button>
                ))}
            </div>

            {/* Error */}
            {error && (
                <Card className="p-4 bg-red-500/10 border-red-500/30 text-red-400">
                    <AlertTriangle className="h-4 w-4 inline mr-2" />
                    {error}
                </Card>
            )}

            {/* List */}
            {loading ? (
                <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                        <Card key={i} className="p-4 animate-pulse bg-muted/20 h-20" />
                    ))}
                </div>
            ) : approvals.length === 0 ? (
                <Card className="p-8 text-center text-muted-foreground">
                    <FileText className="h-10 w-10 mx-auto mb-3 opacity-50" />
                    <p>No approvals found</p>
                </Card>
            ) : (
                <div className="space-y-3">
                    {approvals.map(approval => (
                        <Card
                            key={approval.id}
                            className="p-4 cursor-pointer hover:bg-muted/10 transition-colors"
                            onClick={() => setSelectedApproval(approval)}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    {getStatusIcon(approval.status)}
                                    <div>
                                        <p className="font-medium">{approval.request_type.replace('_', ' ')}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {formatDate(approval.requested_at)}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge className={getRiskBadgeClass(approval.risk_level)}>
                                        {approval.risk_level}
                                    </Badge>
                                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* Detail Sheet */}
            <BottomSheet
                isOpen={!!selectedApproval}
                onClose={() => {
                    setSelectedApproval(null);
                    setActionNotes('');
                }}
                title="Approval Detail"
            >
                {selectedApproval && (
                    <div className="space-y-4 p-4">
                        <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">Request Type</p>
                            <p className="font-medium">{selectedApproval.request_type.replace('_', ' ')}</p>
                        </div>

                        <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">Risk Level</p>
                            <Badge className={getRiskBadgeClass(selectedApproval.risk_level)}>
                                {selectedApproval.risk_level}
                            </Badge>
                        </div>

                        <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">Status</p>
                            <div className="flex items-center gap-2">
                                {getStatusIcon(selectedApproval.status)}
                                <span className="capitalize">{selectedApproval.status}</span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">Requested</p>
                            <p>{formatDate(selectedApproval.requested_at)}</p>
                        </div>

                        {selectedApproval.notes && (
                            <div className="space-y-2">
                                <p className="text-sm text-muted-foreground">Notes</p>
                                <p className="text-sm">{selectedApproval.notes}</p>
                            </div>
                        )}

                        {selectedApproval.resolution_notes && (
                            <div className="space-y-2">
                                <p className="text-sm text-muted-foreground">Resolution Notes</p>
                                <p className="text-sm">{selectedApproval.resolution_notes}</p>
                            </div>
                        )}

                        {/* Actions for pending + owner */}
                        {selectedApproval.status === 'pending' && isAuthenticated && (
                            <div className="space-y-3 pt-4 border-t">
                                <Input
                                    placeholder="Add notes (required for denial)"
                                    value={actionNotes}
                                    onChange={(e) => setActionNotes(e.target.value)}
                                />
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        className="flex-1 text-red-500 border-red-500/30"
                                        onClick={handleDeny}
                                        disabled={actionLoading}
                                    >
                                        <X className="h-4 w-4 mr-1" />
                                        Deny
                                    </Button>
                                    <Button
                                        className="flex-1"
                                        onClick={handleApprove}
                                        disabled={actionLoading}
                                    >
                                        <Check className="h-4 w-4 mr-1" />
                                        Approve
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </BottomSheet>
        </div>
    );
}
