import { useState, useEffect } from 'react'
import { Card, Badge, Input, Skeleton } from '@dinein/ui'
import { FileText, Search, Calendar, Filter } from 'lucide-react'
import { supabase } from '../shared/services/supabase'

interface AuditLogEntry {
    id: string
    action: string
    entity_type: string
    entity_id: string
    actor_auth_user_id: string
    actor_email?: string
    details: Record<string, unknown>
    created_at: string
}

const ACTION_COLORS: Record<string, string> = {
    create: 'border-green-500/50 text-green-400 bg-green-500/10',
    update: 'border-blue-500/50 text-blue-400 bg-blue-500/10',
    delete: 'border-red-500/50 text-red-400 bg-red-500/10',
    approve: 'border-emerald-500/50 text-emerald-400 bg-emerald-500/10',
    reject: 'border-orange-500/50 text-orange-400 bg-orange-500/10',
    login: 'border-purple-500/50 text-purple-400 bg-purple-500/10',
}

export default function AuditLogs() {
    const [logs, setLogs] = useState<AuditLogEntry[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [actionFilter, setActionFilter] = useState<string>('all')
    const [availableActions, setAvailableActions] = useState<string[]>([])

    useEffect(() => {
        fetchLogs()
    }, [])

    const fetchLogs = async () => {
        try {
            const { data, error } = await supabase
                .from('audit_logs')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(100)

            if (error) {
                console.error('Error fetching audit logs:', error)
                return
            }

            // Get unique actions for filter
            const actions = [...new Set((data || []).map((log: { action: string }) => log.action))] as string[]
            setAvailableActions(actions)

            setLogs((data || []) as AuditLogEntry[])
        } catch (error) {
            console.error('Error:', error)
        } finally {
            setLoading(false)
        }
    }

    const filteredLogs = logs.filter(log => {
        const matchesSearch =
            log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
            log.entity_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
            log.entity_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (log.actor_email?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)

        const matchesAction = actionFilter === 'all' || log.action === actionFilter

        return matchesSearch && matchesAction
    })

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr)
        return date.toLocaleString()
    }

    const getActionColor = (action: string) => {
        const lowerAction = action.toLowerCase()
        return ACTION_COLORS[lowerAction] || 'border-zinc-600 text-zinc-400'
    }

    if (loading) {
        return (
            <div className="space-y-6">
                <h1 className="text-3xl font-bold tracking-tight text-white">Audit Logs</h1>
                <Skeleton className="h-12" />
                <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-24" />)}
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-white">Audit Logs</h1>
                <p className="text-zinc-400">Track all system actions and changes.</p>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                    <Input
                        placeholder="Search logs..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 bg-zinc-900 border-zinc-700"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-zinc-500" />
                    <select
                        value={actionFilter}
                        onChange={(e) => setActionFilter(e.target.value)}
                        className="bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-zinc-200 text-sm"
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
                <Card className="p-12 text-center bg-zinc-900 border-zinc-800">
                    <FileText className="mx-auto h-12 w-12 text-zinc-600 mb-4" />
                    <h3 className="text-lg font-medium text-zinc-200">No logs found</h3>
                    <p className="text-zinc-500">
                        {logs.length === 0
                            ? 'No audit logs have been recorded yet.'
                            : 'Try adjusting your search or filters.'}
                    </p>
                </Card>
            ) : (
                <div className="space-y-3">
                    {filteredLogs.map(log => (
                        <Card key={log.id} className="p-4 bg-zinc-900 border-zinc-800">
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Badge
                                            variant="outline"
                                            className={getActionColor(log.action)}
                                        >
                                            {log.action}
                                        </Badge>
                                        <span className="text-zinc-400 text-sm">
                                            on <span className="text-zinc-300">{log.entity_type}</span>
                                        </span>
                                    </div>
                                    <p className="text-white font-mono text-sm">
                                        ID: {log.entity_id.slice(0, 8)}...
                                    </p>
                                    {log.actor_email && (
                                        <p className="text-zinc-500 text-sm mt-1">
                                            By: {log.actor_email}
                                        </p>
                                    )}
                                </div>
                                <div className="flex items-center gap-2 text-zinc-500 text-sm">
                                    <Calendar className="h-4 w-4" />
                                    {formatDate(log.created_at)}
                                </div>
                            </div>
                            {Object.keys(log.details || {}).length > 0 && (
                                <details className="mt-3">
                                    <summary className="text-zinc-500 text-sm cursor-pointer hover:text-zinc-300">
                                        View details
                                    </summary>
                                    <pre className="mt-2 p-3 bg-zinc-950 rounded text-xs text-zinc-400 overflow-x-auto">
                                        {JSON.stringify(log.details, null, 2)}
                                    </pre>
                                </details>
                            )}
                        </Card>
                    ))}
                </div>
            )}

            {/* Log count */}
            <p className="text-center text-zinc-500 text-sm">
                Showing {filteredLogs.length} of {logs.length} logs (limited to 100)
            </p>
        </div>
    )
}
