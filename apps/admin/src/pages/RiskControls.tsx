/**
 * RiskControls - Platform admin risk management console
 * 
 * Manage blocked sessions, domain allowlists, and incident queue.
 */

import { useState, useEffect, useCallback } from 'react';
import { Card, Button, Badge, Input, Skeleton, BottomSheet } from '@dinein/ui';
import {
    Shield, AlertTriangle, Globe, Lock, Unlock, RefreshCw, Plus, X
} from 'lucide-react';
import { supabase } from '../shared/services/supabase';
import { toast } from 'sonner';

// =============================================================================
// TYPES
// =============================================================================

interface BlockedSession {
    id: string;
    session_key: string;
    reason: string;
    blocked_at: string;
    blocked_by: string;
    expires_at: string | null;
}

interface AllowedDomain {
    id: string;
    domain: string;
    purpose: string;
    added_at: string;
    added_by: string;
}

interface Incident {
    id: string;
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    status: 'open' | 'investigating' | 'resolved';
    created_at: string;
}

type TabType = 'blocked' | 'domains' | 'incidents';

// =============================================================================
// HELPERS
// =============================================================================

function getSeverityBadge(severity: string) {
    const classes: Record<string, string> = {
        critical: 'bg-red-500/20 text-red-400 border-red-500/30',
        high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
        medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
        low: 'bg-green-500/20 text-green-400 border-green-500/30',
    };
    return <Badge className={classes[severity] || classes.low}>{severity}</Badge>;
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

export default function RiskControls() {
    const [activeTab, setActiveTab] = useState<TabType>('blocked');
    const [loading, setLoading] = useState(true);

    // Data states
    const [blockedSessions, setBlockedSessions] = useState<BlockedSession[]>([]);
    const [allowedDomains, setAllowedDomains] = useState<AllowedDomain[]>([]);
    const [incidents, setIncidents] = useState<Incident[]>([]);

    // Sheet states
    const [showAddDomain, setShowAddDomain] = useState(false);
    const [newDomain, setNewDomain] = useState('');
    const [newDomainPurpose, setNewDomainPurpose] = useState('');

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            // Fetch blocked sessions
            const { data: blocked } = await supabase
                .from('blocked_sessions')
                .select('*')
                .order('blocked_at', { ascending: false })
                .limit(50);
            setBlockedSessions(blocked || []);

            // Fetch allowed domains
            const { data: domains } = await supabase
                .from('allowed_domains')
                .select('*')
                .order('added_at', { ascending: false });
            setAllowedDomains(domains || []);

            // Fetch incidents
            const { data: incidentData } = await supabase
                .from('incidents')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(50);
            setIncidents(incidentData || []);
        } catch (err) {
            console.error('Error fetching risk data:', err);
            toast.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleUnblock = async (id: string) => {
        try {
            const { error } = await supabase
                .from('blocked_sessions')
                .delete()
                .eq('id', id);
            if (error) throw error;
            toast.success('Session unblocked');
            fetchData();
        } catch (err) {
            toast.error('Failed to unblock');
        }
    };

    const handleAddDomain = async () => {
        if (!newDomain.trim()) {
            toast.error('Domain is required');
            return;
        }
        try {
            const { data: { user } } = await supabase.auth.getUser();
            const { error } = await supabase
                .from('allowed_domains')
                .insert({
                    domain: newDomain.trim(),
                    purpose: newDomainPurpose.trim() || 'General',
                    added_by: user?.id || 'system',
                });
            if (error) throw error;
            toast.success('Domain added');
            setNewDomain('');
            setNewDomainPurpose('');
            setShowAddDomain(false);
            fetchData();
        } catch (err) {
            toast.error('Failed to add domain');
        }
    };

    const handleRemoveDomain = async (id: string) => {
        try {
            const { error } = await supabase
                .from('allowed_domains')
                .delete()
                .eq('id', id);
            if (error) throw error;
            toast.success('Domain removed');
            fetchData();
        } catch (err) {
            toast.error('Failed to remove domain');
        }
    };

    const handleResolveIncident = async (id: string) => {
        try {
            const { error } = await supabase
                .from('incidents')
                .update({ status: 'resolved' })
                .eq('id', id);
            if (error) throw error;
            toast.success('Incident resolved');
            fetchData();
        } catch (err) {
            toast.error('Failed to resolve incident');
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <Shield className="h-6 w-6" />
                        Risk Controls
                    </h1>
                    <p className="text-muted-foreground">Manage security and access controls</p>
                </div>
                <Button variant="outline" size="sm" onClick={fetchData}>
                    <RefreshCw className="h-4 w-4" />
                </Button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-border pb-2">
                {[
                    { id: 'blocked', label: 'Blocked Sessions', icon: Lock },
                    { id: 'domains', label: 'Domain Allowlist', icon: Globe },
                    { id: 'incidents', label: 'Incidents', icon: AlertTriangle },
                ].map(tab => {
                    const Icon = tab.icon;
                    return (
                        <Button
                            key={tab.id}
                            variant={activeTab === tab.id ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setActiveTab(tab.id as TabType)}
                        >
                            <Icon className="h-4 w-4 mr-1" />
                            {tab.label}
                        </Button>
                    );
                })}
            </div>

            {/* Content */}
            {loading ? (
                <div className="space-y-3">
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full" />)}
                </div>
            ) : (
                <>
                    {/* Blocked Sessions Tab */}
                    {activeTab === 'blocked' && (
                        <div className="space-y-3">
                            {blockedSessions.length === 0 ? (
                                <Card className="p-8 text-center text-muted-foreground">
                                    <Unlock className="h-10 w-10 mx-auto mb-3 opacity-50" />
                                    <p>No blocked sessions</p>
                                </Card>
                            ) : (
                                blockedSessions.map(session => (
                                    <Card key={session.id} className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-mono text-sm truncate max-w-[200px]">
                                                    {session.session_key}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {session.reason} • {formatDate(session.blocked_at)}
                                                </p>
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleUnblock(session.id)}
                                            >
                                                <Unlock className="h-4 w-4 mr-1" />
                                                Unblock
                                            </Button>
                                        </div>
                                    </Card>
                                ))
                            )}
                        </div>
                    )}

                    {/* Domains Tab */}
                    {activeTab === 'domains' && (
                        <div className="space-y-3">
                            <Button size="sm" onClick={() => setShowAddDomain(true)}>
                                <Plus className="h-4 w-4 mr-1" />
                                Add Domain
                            </Button>
                            {allowedDomains.length === 0 ? (
                                <Card className="p-8 text-center text-muted-foreground">
                                    <Globe className="h-10 w-10 mx-auto mb-3 opacity-50" />
                                    <p>No domains in allowlist</p>
                                </Card>
                            ) : (
                                allowedDomains.map(domain => (
                                    <Card key={domain.id} className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-mono">{domain.domain}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {domain.purpose} • Added {formatDate(domain.added_at)}
                                                </p>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleRemoveDomain(domain.id)}
                                            >
                                                <X className="h-4 w-4 text-red-400" />
                                            </Button>
                                        </div>
                                    </Card>
                                ))
                            )}
                        </div>
                    )}

                    {/* Incidents Tab */}
                    {activeTab === 'incidents' && (
                        <div className="space-y-3">
                            {incidents.length === 0 ? (
                                <Card className="p-8 text-center text-muted-foreground">
                                    <AlertTriangle className="h-10 w-10 mx-auto mb-3 opacity-50" />
                                    <p>No incidents</p>
                                </Card>
                            ) : (
                                incidents.map(incident => (
                                    <Card key={incident.id} className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                {getSeverityBadge(incident.severity)}
                                                <div>
                                                    <p className="font-medium">{incident.type}</p>
                                                    <p className="text-sm text-muted-foreground truncate max-w-[300px]">
                                                        {incident.description}
                                                    </p>
                                                </div>
                                            </div>
                                            {incident.status !== 'resolved' && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleResolveIncident(incident.id)}
                                                >
                                                    Resolve
                                                </Button>
                                            )}
                                        </div>
                                    </Card>
                                ))
                            )}
                        </div>
                    )}
                </>
            )}

            {/* Add Domain Sheet */}
            <BottomSheet
                isOpen={showAddDomain}
                onClose={() => setShowAddDomain(false)}
                title="Add Allowed Domain"
            >
                <div className="space-y-4 p-4">
                    <div className="space-y-2">
                        <label className="text-sm text-muted-foreground">Domain</label>
                        <Input
                            placeholder="example.com"
                            value={newDomain}
                            onChange={(e) => setNewDomain(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm text-muted-foreground">Purpose</label>
                        <Input
                            placeholder="Research, Documentation, etc."
                            value={newDomainPurpose}
                            onChange={(e) => setNewDomainPurpose(e.target.value)}
                        />
                    </div>
                    <Button className="w-full" onClick={handleAddDomain}>
                        Add Domain
                    </Button>
                </div>
            </BottomSheet>
        </div>
    );
}
