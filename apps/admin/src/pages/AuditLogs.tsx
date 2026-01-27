import { useState, useEffect, useCallback } from 'react'
import { Card, Badge, Input, Skeleton, BottomSheet, Button } from '@dinein/ui'
import { FileText, Search, Calendar, Filter, RefreshCw, Clock, ChevronRight } from 'lucide-react'
import { supabase } from '../shared/services/supabase'

interface AuditLogEntry {
    id: string
    action: string
    entity_type: string
    entity_id: string | null
    actor_auth_user_id: string
    actor_email?: string
    metadata_json: Record<string, unknown> | null
    created_at: string
}

const ACTION_COLORS: Record<string, string> = {
    create: 'border-green-500/50 text-green-500 bg-green-500/10',
    update: 'border-blue-500/50 text-blue-500 bg-blue-500/10',
    delete: 'border-red-500/50 text-red-500 bg-red-500/10',
    approve: 'border-emerald-500/50 text-emerald-500 bg-emerald-500/10',
    reject: 'border-orange-500/50 text-orange-500 bg-orange-500/10',
    login: 'border-purple-500/50 text-purple-500 bg-purple-500/10',
    vendor_claim: 'border-amber-500/50 text-amber-500 bg-amber-500/10',
    user_disabled: 'border-red-500/50 text-red-500 bg-red-500/10',
    user_enabled: 'border-green-500/50 text-green-500 bg-green-500/10',
    venue_edit: 'border-blue-500/50 text-blue-500 bg-blue-500/10',
}

type DateRange = 'all' | 'today' | '7d' | '30d'

export default function AuditLogs() {
    const [logs, setLogs] = useState<AuditLogEntry[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [actionFilter, setActionFilter] = useState<string>('all')
    const [dateRange, setDateRange] = useState<DateRange>('7d')
    const [availableActions, setAvailableActions] = useState<string[]>([])
    const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null)

    const fetchLogs = useCallback(async () => {
        setLoading(true)
        try {
            let query = supabase
                .from('audit_logs')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(200)

            // Apply date filter
            if (dateRange !== 'all') {
                const now = new Date()
                let startDate: Date

                switch (dateRange) {
                    case 'today':
                        startDate = new Date(now.setHours(0, 0, 0, 0))
                        break
                    case '7d':
                        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
                        break
                    case '30d':
                        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
                        break
                }

                query = query.gte('created_at', startDate!.toISOString())
            }

            const { data, error } = await query

            if (error) {
                console.error('Error fetching audit logs:', error)
                return
            }

            // Get unique actions for filter
            const actions = [...new Set((data || []).map((log: { action: string }) => log.action))] as string[]
            setAvailableActions(actions.sort())

            setLogs((data || []) as AuditLogEntry[])
        } catch (error) {
            console.error('Error:', error)
        } finally {
            setLoading(false)
        }
    }, [dateRange])

    useEffect(() => {
        fetchLogs()
    }, [fetchLogs])

    const filteredLogs = logs.filter(log => {
        const matchesSearch =
            log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
            log.entity_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (log.entity_id?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
            (log.actor_email?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)

        const matchesAction = actionFilter === 'all' || log.action === actionFilter

        return matchesSearch && matchesAction
    })

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr)
        return date.toLocaleString()
    }

    const formatRelativeTime = (dateStr: string) => {
        const date = new Date(dateStr)
        const now = new Date()
        const diffMs = now.getTime() - date.getTime()
        const diffMins = Math.floor(diffMs / 60000)
        const diffHours = Math.floor(diffMs / 3600000)
        const diffDays = Math.floor(diffMs / 86400000)

        if (diffMins < 1) return 'Just now'
        if (diffMins < 60) return `${diffMins}m ago`
        if (diffHours < 24) return `${diffHours}h ago`
        if (diffDays < 7) return `${diffDays}d ago`
        return date.toLocaleDateString()
    }

    const getActionColor = (action: string) => {
        const lowerAction = action.toLowerCase()
        // Check for exact match first
        if (ACTION_COLORS[lowerAction]) return ACTION_COLORS[lowerAction]
        // Check for partial matches
        if (lowerAction.includes('create')) return ACTION_COLORS.create
        if (lowerAction.includes('update') || lowerAction.includes('edit')) return ACTION_COLORS.update
        if (lowerAction.includes('delete') || lowerAction.includes('remove')) return ACTION_COLORS.delete
        if (lowerAction.includes('approve')) return ACTION_COLORS.approve
        if (lowerAction.includes('reject')) return ACTION_COLORS.reject
        if (lowerAction.includes('claim')) return ACTION_COLORS.vendor_claim
        if (lowerAction.includes('disable')) return ACTION_COLORS.user_disabled
        if (lowerAction.includes('enable')) return ACTION_COLORS.user_enabled
        return 'border-border text-muted-foreground'
    }

    const dateRangeOptions: { id: DateRange; label: string }[] = [
        { id: 'today', label: 'Today' },
        { id: '7d', label: '7 Days' },
        { id: '30d', label: '30 Days' },
        { id: 'all', label: 'All Time' },
    ]

    if (loading) {
        return (
            <div className="space-y-6">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Audit Logs</h1>
                <Skeleton className="h-12" />
                <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-24" />)}
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Audit Logs</h1>
                    <p className="text-muted-foreground">Track all system actions and changes.</p>
                </div>
                <Button onClick={fetchLogs} variant="outline" size="sm" className="gap-2">
                    <RefreshCw className="h-4 w-4" /> Refresh
                </Button>
            </div>

            {/* Date Range Filters */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                {dateRangeOptions.map(option => (
                    <button
                        key={option.id}
                        onClick={() => setDateRange(option.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all whitespace-nowrap ${dateRange === option.id
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                            }`}
                    >
                        <Clock className="h-4 w-4" />
                        {option.label}
                    </button>
                ))}
            </div>

            {/* Search and Action Filter */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search logs..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <select
                        value={actionFilter}
                        onChange={(e) => setActionFilter(e.target.value)}
                        className="bg-muted border border-border rounded-md px-3 py-2 text-foreground text-sm"
                    >
                        <option value="all">All Actions</option>
                        {availableActions.map(action => (
                            <option key={action} value={action}>{action}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Logs List */}
            {filteredLogs.length === 0 ? (
                <Card className="p-12 text-center bg-card border-border">
                    <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium text-foreground">No logs found</h3>
                    <p className="text-muted-foreground">
                        {logs.length === 0
                            ? 'No audit logs have been recorded yet.'
                            : 'Try adjusting your search or filters.'}
                    </p>
                </Card>
            ) : (
                <div className="space-y-3">
                    {filteredLogs.map(log => (
                        <Card
                            key={log.id}
                            className="p-4 bg-card border-border cursor-pointer hover:bg-muted/30 transition-colors"
                            onClick={() => setSelectedLog(log)}
                        >
                            <div className="flex items-center gap-4">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                                        <Badge
                                            variant="outline"
                                            className={getActionColor(log.action)}
                                        >
                                            {log.action}
                                        </Badge>
                                        <span className="text-muted-foreground text-sm">
                                            on <span className="text-foreground">{log.entity_type}</span>
                                        </span>
                                    </div>
                                    <p className="text-foreground font-mono text-sm truncate">
                                        {log.entity_id ? `${log.entity_id.slice(0, 8)}...` : '—'}
                                    </p>
                                </div>
                                <div className="text-right text-sm text-muted-foreground shrink-0">
                                    {formatRelativeTime(log.created_at)}
                                </div>
                                <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* Log count */}
            <p className="text-center text-muted-foreground text-sm">
                Showing {filteredLogs.length} of {logs.length} logs
            </p>

            {/* Log Detail Sheet */}
            {selectedLog && (
                <BottomSheet
                    isOpen={!!selectedLog}
                    onClose={() => setSelectedLog(null)}
                    title="Audit Log Details"
                >
                    <div className="space-y-6 p-4">
                        {/* Action Header */}
                        <div className="flex items-start gap-4">
                            <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                                <FileText className="h-7 w-7 text-primary" />
                            </div>
                            <div className="flex-1">
                                <Badge
                                    variant="outline"
                                    className={`${getActionColor(selectedLog.action)} text-base`}
                                >
                                    {selectedLog.action}
                                </Badge>
                                <p className="text-sm text-muted-foreground mt-1">
                                    on {selectedLog.entity_type}
                                </p>
                            </div>
                        </div>

                        {/* Log Info */}
                        <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                            {selectedLog.entity_id && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Entity ID</span>
                                    <span className="font-mono truncate max-w-[200px]">{selectedLog.entity_id}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Actor ID</span>
                                <span className="font-mono truncate max-w-[200px]">{selectedLog.actor_auth_user_id.slice(0, 12)}...</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground flex items-center gap-2">
                                    <Calendar className="h-4 w-4" /> Timestamp
                                </span>
                                <span>{formatDate(selectedLog.created_at)}</span>
                            </div>
                        </div>

                        {/* Metadata */}
                        {selectedLog.metadata_json && Object.keys(selectedLog.metadata_json).length > 0 && (
                            <div className="space-y-3">
                                <h4 className="font-medium text-sm text-muted-foreground">Metadata</h4>
                                <div className="bg-muted rounded-lg p-4 overflow-x-auto">
                                    <pre className="text-xs text-foreground whitespace-pre-wrap break-all">
                                        {JSON.stringify(selectedLog.metadata_json, null, 2)}
                                    </pre>
                                </div>
                            </div>
                        )}
                    </div>
                </BottomSheet>
            )}
        </div>
    )
}
