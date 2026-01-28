/**
 * AuditTrace - Venue-scoped audit log viewer
 * 
 * Search and trace tool calls and outcomes for venue operations.
 */

import { useState, useEffect, useCallback } from 'react';
import { Card, Button, Badge, Input, Skeleton, BottomSheet } from '@dinein/ui';
import { Search, Clock, ChevronRight, FileText, Download, RefreshCw } from 'lucide-react';
import { supabase } from '../shared/services/supabase';
import { useOwner } from '../context/OwnerContext';
import { toast } from 'sonner';

// =============================================================================
// TYPES
// =============================================================================

interface AuditEntry {
    id: string;
    request_id: string;
    tool_name: string;
    actor_id: string;
    decision: 'allow' | 'deny';
    created_at: string;
    latency_ms: number | null;
    inputs_hash: string | null;
    outputs_summary: string | null;
}

// =============================================================================
// HELPERS
// =============================================================================

function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleString('en-GB', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    });
}

function getDecisionBadge(decision: string) {
    return decision === 'allow' ? (
        <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Allow</Badge>
    ) : (
        <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Deny</Badge>
    );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function AuditTrace() {
    const { venue, isAuthenticated } = useOwner();
    const [entries, setEntries] = useState<AuditEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedEntry, setSelectedEntry] = useState<AuditEntry | null>(null);

    const fetchAuditLogs = useCallback(async () => {
        if (!venue) return;

        setLoading(true);
        try {
            let query = supabase
                .from('audit_logs')
                .select('*')
                .eq('venue_id', venue.id)
                .order('created_at', { ascending: false })
                .limit(100);

            if (searchQuery.trim()) {
                query = query.or(`request_id.ilike.%${searchQuery}%,tool_name.ilike.%${searchQuery}%`);
            }

            const { data, error } = await query;
            if (error) throw error;

            setEntries(data || []);
        } catch (err) {
            console.error('Error fetching audit logs:', err);
            toast.error('Failed to load audit logs');
        } finally {
            setLoading(false);
        }
    }, [venue, searchQuery]);

    useEffect(() => {
        fetchAuditLogs();
    }, [fetchAuditLogs]);

    const handleExport = async () => {
        if (!isAuthenticated) {
            toast.error('Only venue owners can export audit logs');
            return;
        }

        try {
            const csvData = entries.map(e => ({
                request_id: e.request_id,
                tool_name: e.tool_name,
                decision: e.decision,
                timestamp: e.created_at,
                latency_ms: e.latency_ms,
            }));

            const csv = [
                Object.keys(csvData[0] || {}).join(','),
                ...csvData.map(row => Object.values(row).join(','))
            ].join('\n');

            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `audit-${venue?.slug || 'venue'}-${new Date().toISOString().split('T')[0]}.csv`;
            a.click();
            URL.revokeObjectURL(url);
            toast.success('Audit log exported');
        } catch (err) {
            toast.error('Failed to export');
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Audit Trace</h1>
                    <p className="text-muted-foreground">Review tool calls and outcomes</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => fetchAuditLogs()}>
                        <RefreshCw className="h-4 w-4" />
                    </Button>
                    {isAuthenticated && (
                        <Button variant="outline" size="sm" onClick={handleExport}>
                            <Download className="h-4 w-4 mr-1" />
                            Export
                        </Button>
                    )}
                </div>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search by request ID or tool name..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && fetchAuditLogs()}
                />
            </div>

            {/* List */}
            {loading ? (
                <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map(i => (
                        <Skeleton key={i} className="h-16 w-full" />
                    ))}
                </div>
            ) : entries.length === 0 ? (
                <Card className="p-8 text-center text-muted-foreground">
                    <FileText className="h-10 w-10 mx-auto mb-3 opacity-50" />
                    <p>No audit entries found</p>
                </Card>
            ) : (
                <div className="space-y-2">
                    {entries.map(entry => (
                        <Card
                            key={entry.id}
                            className="p-3 cursor-pointer hover:bg-muted/10 transition-colors"
                            onClick={() => setSelectedEntry(entry)}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <p className="font-mono text-sm">{entry.tool_name}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {formatDate(entry.created_at)}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {getDecisionBadge(entry.decision)}
                                    {entry.latency_ms && (
                                        <span className="text-xs text-muted-foreground">
                                            {entry.latency_ms}ms
                                        </span>
                                    )}
                                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* Detail Sheet */}
            <BottomSheet
                isOpen={!!selectedEntry}
                onClose={() => setSelectedEntry(null)}
                title="Audit Entry Detail"
            >
                {selectedEntry && (
                    <div className="space-y-4 p-4">
                        <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">Request ID</p>
                            <p className="font-mono text-sm break-all">{selectedEntry.request_id}</p>
                        </div>

                        <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">Tool Name</p>
                            <p className="font-mono">{selectedEntry.tool_name}</p>
                        </div>

                        <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">Decision</p>
                            {getDecisionBadge(selectedEntry.decision)}
                        </div>

                        <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">Timestamp</p>
                            <p>{formatDate(selectedEntry.created_at)}</p>
                        </div>

                        {selectedEntry.latency_ms && (
                            <div className="space-y-2">
                                <p className="text-sm text-muted-foreground">Latency</p>
                                <p>{selectedEntry.latency_ms}ms</p>
                            </div>
                        )}

                        {selectedEntry.outputs_summary && (
                            <div className="space-y-2">
                                <p className="text-sm text-muted-foreground">Output Summary</p>
                                <p className="text-sm font-mono bg-muted/20 p-2 rounded">
                                    {selectedEntry.outputs_summary}
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </BottomSheet>
        </div>
    );
}
