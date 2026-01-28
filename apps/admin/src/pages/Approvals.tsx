import { useState } from 'react'
import { Card, Button, Badge, BottomSheet } from '@dinein/ui'
import { Check, X, Clock, FileText, Info, Building2, User, Shield, ExternalLink, AlertTriangle } from 'lucide-react'
import { useApprovals, ApprovalRequest } from '../hooks/useApprovals'

// Risk assessment helper
function getRiskLevel(request: ApprovalRequest): { level: 'low' | 'medium' | 'high'; reason: string } {
    // High risk: access grants, refunds, venue deletions
    if (request.request_type.includes('access') || request.request_type.includes('refund')) {
        return { level: 'high', reason: 'Sensitive operation' };
    }
    // Medium risk: menu/promo changes from new venues
    if (request.priority === 'urgent') {
        return { level: 'medium', reason: 'Urgent request' };
    }
    return { level: 'low', reason: 'Standard operation' };
}

function RiskBadge({ request }: { request: ApprovalRequest }) {
    const risk = getRiskLevel(request);
    const colors = {
        low: 'bg-green-500/10 text-green-500 border-green-500/20',
        medium: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
        high: 'bg-red-500/10 text-red-500 border-red-500/20',
    };
    return (
        <Badge variant="outline" className={`${colors[risk.level]} text-xs`}>
            <Shield className="h-3 w-3 mr-1" />
            {risk.level}
        </Badge>
    );
}

export default function Approvals() {
    const { requests, loading, approveRequest, rejectRequest, stats } = useApprovals()
    const [selectedRequest, setSelectedRequest] = useState<ApprovalRequest | null>(null)
    const [rejectionNotes, setRejectionNotes] = useState('')

    if (loading) {
        return (
            <div className="space-y-4">
                <h1 className="text-3xl font-bold tracking-tight text-foreground mb-6">Approvals</h1>
                {[1, 2, 3].map(i => <div key={i} className="h-32 bg-muted rounded-xl animate-pulse" />)}
            </div>
        )
    }

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'urgent': return 'bg-red-500/10 text-red-500 border-red-500/20'
            case 'high': return 'bg-orange-500/10 text-orange-500 border-orange-500/20'
            case 'low': return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
            default: return 'bg-slate-500/10 text-slate-500 border-slate-500/20'
        }
    }

    const getIconForType = (type: string) => {
        if (type.includes('menu')) return <FileText className="h-5 w-5" />
        if (type.includes('venue')) return <Building2 className="h-5 w-5" />
        if (type.includes('access')) return <User className="h-5 w-5" />
        return <Info className="h-5 w-5" />
    }

    // Build evidence link based on entity type
    const getEvidenceLink = (request: ApprovalRequest): string | null => {
        if (!request.entity_id) return null;
        if (request.entity_type === 'menu_item_draft' || request.entity_type === 'promo_draft') {
            return `/dashboard/audit?entity=${request.entity_id}`;
        }
        if (request.entity_type === 'venue_claim') {
            return `/dashboard/claims?id=${request.entity_id}`;
        }
        return null;
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500" data-testid="admin-approvals:page">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Approvals</h1>
                    <p className="text-muted-foreground">Review and action pending changes from venues.</p>
                </div>

                {/* Stats Cards */}
                <div className="flex gap-3">
                    <Card className="px-4 py-2 bg-red-500/10 border-red-500/20 flex flex-col items-center justify-center min-w-[80px]">
                        <span className="text-red-600 font-bold text-xl">{requests.filter(r => getRiskLevel(r).level === 'high').length}</span>
                        <span className="text-xs text-red-600/80 uppercase font-semibold">High Risk</span>
                    </Card>
                    <Card className="px-4 py-2 bg-orange-500/10 border-orange-500/20 flex flex-col items-center justify-center min-w-[80px]">
                        <span className="text-orange-600 font-bold text-xl">{stats.urgent}</span>
                        <span className="text-xs text-orange-600/80 uppercase font-semibold">Urgent</span>
                    </Card>
                    <Card className="px-4 py-2 bg-card border-border flex flex-col items-center justify-center min-w-[80px]">
                        <span className="text-foreground font-bold text-xl">{stats.pending}</span>
                        <span className="text-xs text-muted-foreground uppercase font-semibold">Total</span>
                    </Card>
                </div>
            </div>

            {requests.length === 0 ? (
                <Card className="p-12 text-center bg-card border-border border-dashed flex flex-col items-center">
                    <Check className="h-12 w-12 text-green-500 mb-4 bg-green-500/10 p-2 rounded-full" />
                    <h3 className="text-lg font-semibold">All clear!</h3>
                    <p className="text-muted-foreground">No pending approval requests.</p>
                </Card>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {requests.map(request => {
                        const risk = getRiskLevel(request);
                        return (
                            <Card
                                key={request.id}
                                className={`p-5 bg-card border-border shadow-sm hover:shadow-md transition-all cursor-pointer relative group ${risk.level === 'high' ? 'ring-1 ring-red-500/30' : ''}`}
                                onClick={() => setSelectedRequest(request)}
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                            {getIconForType(request.request_type)}
                                        </div>
                                        <div>
                                            <h3 className="font-bold capitalize">{request.request_type.replace('_', ' ')}</h3>
                                            <div className="flex items-center gap-1 text-muted-foreground text-xs">
                                                <Building2 className="h-3 w-3" />
                                                {request.venue_name || 'System'}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <Badge variant="outline" className={getPriorityColor(request.priority)}>
                                            {request.priority}
                                        </Badge>
                                        <RiskBadge request={request} />
                                    </div>
                                </div>

                                <div className="bg-muted/50 rounded p-3 mb-3 text-sm">
                                    {request.entity_preview ? (
                                        <div className="space-y-1">
                                            {Object.entries(request.entity_preview).map(([key, value]) => (
                                                <div key={key} className="flex justify-between">
                                                    <span className="text-muted-foreground capitalize">{key}:</span>
                                                    <span className="font-medium truncate max-w-[120px]">{String(value)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-muted-foreground italic">No preview available</p>
                                    )}
                                </div>

                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        <span>{new Date(request.created_at).toLocaleDateString()}</span>
                                    </div>
                                    <span>{request.requester_email}</span>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            )}

            {/* Review Sheet */}
            {selectedRequest && (
                <BottomSheet
                    isOpen={!!selectedRequest}
                    onClose={() => {
                        setSelectedRequest(null)
                        setRejectionNotes('')
                    }}
                    title={`Review ${selectedRequest.request_type.replace('_', ' ')}`}
                >
                    <div className="space-y-6 p-4">
                        {/* Risk Warning for High Risk */}
                        {getRiskLevel(selectedRequest).level === 'high' && (
                            <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                                <AlertTriangle className="h-5 w-5 text-red-500" />
                                <div>
                                    <p className="font-semibold text-red-600">High Risk Operation</p>
                                    <p className="text-sm text-red-500/80">{getRiskLevel(selectedRequest).reason} - Verify carefully before approving</p>
                                </div>
                            </div>
                        )}

                        <div className="flex items-center gap-4 bg-muted/30 p-4 rounded-lg border border-border">
                            <div className="flex-1">
                                <p className="text-sm font-medium text-muted-foreground mb-1">Venue</p>
                                <p className="font-bold flex items-center gap-2">
                                    <Building2 className="h-4 w-4" />
                                    {selectedRequest.venue_name || 'N/A'}
                                </p>
                            </div>
                            <div className="flex-1 border-l border-border pl-4">
                                <p className="text-sm font-medium text-muted-foreground mb-1">Requester</p>
                                <p className="font-mono text-sm">{selectedRequest.requester_email}</p>
                            </div>
                        </div>

                        {/* Evidence Link */}
                        {getEvidenceLink(selectedRequest) && (
                            <a
                                href={getEvidenceLink(selectedRequest)!}
                                className="flex items-center gap-2 text-sm text-primary hover:underline"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <ExternalLink className="h-4 w-4" />
                                View Evidence Bundle
                            </a>
                        )}

                        {/* Payload Preview */}
                        <div>
                            <h3 className="font-semibold mb-2">Request Details</h3>
                            <div className="bg-slate-950 text-slate-50 p-4 rounded-lg font-mono text-xs overflow-x-auto max-h-60">
                                {JSON.stringify(selectedRequest.entity_preview || {}, null, 2)}
                            </div>
                        </div>

                        {/* Notes */}
                        {selectedRequest.notes && (
                            <div>
                                <h3 className="font-semibold mb-2 flex items-center gap-2">
                                    <Info className="h-4 w-4" /> Notes
                                </h3>
                                <div className="bg-yellow-500/10 text-yellow-600 p-3 rounded-lg text-sm">
                                    {selectedRequest.notes}
                                </div>
                            </div>
                        )}

                        {/* Action Area */}
                        <div className="pt-4 border-t border-border space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Rejection Reason (if rejecting)</label>
                                <textarea
                                    className="w-full p-3 bg-background border border-border rounded-lg text-sm h-24 resize-none focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                    placeholder="Please allow popups / fix spelling / etc..."
                                    value={rejectionNotes}
                                    onChange={e => setRejectionNotes(e.target.value)}
                                />
                            </div>

                            <div className="flex gap-3">
                                <Button
                                    variant="outline"
                                    className="flex-1 border-destructive/50 text-destructive hover:bg-destructive/10 gap-2 h-11"
                                    onClick={() => {
                                        if (!rejectionNotes) {
                                            alert('Please provide a reason for rejection')
                                            return
                                        }
                                        rejectRequest(selectedRequest.id, rejectionNotes)
                                        setSelectedRequest(null)
                                        setRejectionNotes('')
                                    }}
                                >
                                    <X className="h-4 w-4" /> Reject
                                </Button>
                                <Button
                                    className="flex-1 gap-2 h-11 bg-primary hover:bg-primary/90"
                                    onClick={() => {
                                        approveRequest(selectedRequest.id, rejectionNotes)
                                        setSelectedRequest(null)
                                        setRejectionNotes('')
                                    }}
                                >
                                    <Check className="h-4 w-4" /> Approve
                                </Button>
                            </div>
                        </div>
                    </div>
                </BottomSheet>
            )}
        </div>
    )
}

