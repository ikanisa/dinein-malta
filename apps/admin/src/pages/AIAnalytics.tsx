import { Card } from '@dinein/ui'
import { Bot, CheckCircle2, XCircle, TrendingUp, Zap, Loader2, Clock, DollarSign } from 'lucide-react'
import { useEffect, useState } from 'react'
import { supabase } from '../shared/services/supabase'
import {
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from 'recharts'

interface AgentAction {
    id: string
    tool_name: string
    success: boolean
    venue_id: string | null
    user_id: string | null
    created_at: string
    input_params: Record<string, unknown>
    output_result: Record<string, unknown>
    input_tokens: number | null
    output_tokens: number | null
    cost_estimate: number | null
    venues: { name: string }[] | null
}

interface Stats {
    totalActions: number
    successRate: number
    popularTool: string
    actionsByTool: Record<string, number>
    actionsByDay: { date: string; count: number; success: number }[]
    totalInputTokens: number
    totalOutputTokens: number
    loading: boolean
}

const CHART_COLORS = ['#a855f7', '#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#ec4899', '#06b6d4', '#8b5cf6']

type Period = 'today' | 'week' | 'month'

export default function AIAnalytics() {
    const [stats, setStats] = useState<Stats>({
        totalActions: 0,
        successRate: 0,
        popularTool: '--',
        actionsByTool: {},
        actionsByDay: [],
        totalInputTokens: 0,
        totalOutputTokens: 0,
        loading: true
    })
    const [actions, setActions] = useState<AgentAction[]>([])
    const [period, setPeriod] = useState<Period>('today')

    useEffect(() => {
        const fetchData = async () => {
            setStats(prev => ({ ...prev, loading: true }))

            // Calculate date range
            const now = new Date()
            let startDate: Date
            switch (period) {
                case 'week':
                    startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
                    break
                case 'month':
                    startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
                    break
                default:
                    startDate = new Date(now.setHours(0, 0, 0, 0))
            }

            try {
                // Fetch all actions in period
                const { data: allActions, error } = await supabase
                    .from('agent_actions')
                    .select('id, tool_name, success, venue_id, user_id, created_at, input_params, output_result, input_tokens, output_tokens, cost_estimate, venues(name)')
                    .gte('created_at', startDate.toISOString())
                    .order('created_at', { ascending: false })
                    .limit(100)

                if (error) throw error

                const actionsData = allActions || []

                // Calculate stats
                const successCount = actionsData.filter(a => a.success).length
                const toolCounts: Record<string, number> = {}
                const dayMap: Record<string, { count: number; success: number }> = {}
                let totalInput = 0
                let totalOutput = 0

                actionsData.forEach(action => {
                    toolCounts[action.tool_name] = (toolCounts[action.tool_name] || 0) + 1

                    // Group by day
                    const day = new Date(action.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                    if (!dayMap[day]) dayMap[day] = { count: 0, success: 0 }
                    dayMap[day].count++
                    if (action.success) dayMap[day].success++

                    // Sum tokens from actual columns
                    totalInput += action.input_tokens || 0
                    totalOutput += action.output_tokens || 0
                })

                const popularTool = Object.entries(toolCounts)
                    .sort((a, b) => b[1] - a[1])[0]?.[0] || '--'

                const actionsByDay = Object.entries(dayMap)
                    .map(([date, data]) => ({ date, ...data }))
                    .reverse()

                setStats({
                    totalActions: actionsData.length,
                    successRate: actionsData.length > 0 ? Math.round((successCount / actionsData.length) * 100) : 0,
                    popularTool,
                    actionsByTool: toolCounts,
                    actionsByDay,
                    totalInputTokens: totalInput,
                    totalOutputTokens: totalOutput,
                    loading: false
                })

                setActions(actionsData.slice(0, 20)) // Show recent 20

            } catch (err) {
                console.error('Error fetching AI analytics:', err)
                setStats(prev => ({ ...prev, loading: false }))
            }
        }

        fetchData()
    }, [period])

    if (stats.loading) {
        return <div className="flex justify-center p-12"><Loader2 className="animate-spin h-8 w-8 text-zinc-400" /></div>
    }

    const STATS_DATA = [
        { label: 'Total Actions', value: stats.totalActions.toString(), icon: Bot, trend: `${period === 'today' ? 'Today' : period === 'week' ? 'This week' : 'This month'}` },
        { label: 'Success Rate', value: `${stats.successRate}%`, icon: stats.successRate >= 80 ? CheckCircle2 : XCircle, trend: stats.successRate >= 80 ? 'Healthy' : 'Needs attention', alert: stats.successRate < 80 },
        { label: 'Most Used Tool', value: stats.popularTool.replace(/_/g, ' '), icon: Zap, trend: `${stats.actionsByTool[stats.popularTool] || 0} calls` },
        { label: 'Active Tools', value: Object.keys(stats.actionsByTool).length.toString(), icon: TrendingUp, trend: 'Unique tools used' },
    ]

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white">AI Analytics</h1>
                    <p className="text-zinc-400">Monitor Moltbot usage and performance.</p>
                </div>
                <div className="flex gap-2">
                    {(['today', 'week', 'month'] as Period[]).map(p => (
                        <button
                            key={p}
                            onClick={() => setPeriod(p)}
                            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${period === p
                                ? 'bg-purple-600 text-white'
                                : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                                }`}
                        >
                            {p.charAt(0).toUpperCase() + p.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {STATS_DATA.map(stat => {
                    const Icon = stat.icon
                    return (
                        <Card key={stat.label} className="p-6 flex flex-col justify-between space-y-2 bg-zinc-900 border-zinc-800 text-zinc-100">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-zinc-400">{stat.label}</span>
                                <Icon className={`h-4 w-4 ${stat.alert ? 'text-red-500' : 'text-purple-400'}`} />
                            </div>
                            <div className="text-2xl font-bold">{stat.value}</div>
                            <div className={`text-xs ${stat.alert ? 'text-red-400' : 'text-zinc-500'}`}>
                                {stat.trend}
                            </div>
                        </Card>
                    )
                })}
            </div>

            {/* Charts Grid */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Actions Trend Chart */}
                {stats.actionsByDay.length > 0 && (
                    <Card className="p-6 bg-zinc-900 border-zinc-800">
                        <h2 className="text-lg font-semibold text-white mb-4">Actions Over Time</h2>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={stats.actionsByDay}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
                                    <XAxis
                                        dataKey="date"
                                        stroke="#71717a"
                                        tick={{ fill: '#71717a', fontSize: 12 }}
                                    />
                                    <YAxis
                                        stroke="#71717a"
                                        tick={{ fill: '#71717a', fontSize: 12 }}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#18181b',
                                            border: '1px solid #3f3f46',
                                            borderRadius: '8px',
                                        }}
                                        labelStyle={{ color: '#e4e4e7' }}
                                    />
                                    <Legend />
                                    <Line
                                        type="monotone"
                                        dataKey="count"
                                        name="Total"
                                        stroke="#a855f7"
                                        strokeWidth={2}
                                        dot={{ fill: '#a855f7' }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="success"
                                        name="Successful"
                                        stroke="#22c55e"
                                        strokeWidth={2}
                                        dot={{ fill: '#22c55e' }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                )}

                {/* Tool Distribution Pie Chart */}
                {Object.keys(stats.actionsByTool).length > 0 && (
                    <Card className="p-6 bg-zinc-900 border-zinc-800">
                        <h2 className="text-lg font-semibold text-white mb-4">Tool Distribution</h2>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={Object.entries(stats.actionsByTool).map(([name, value]) => ({
                                            name: name.replace(/_/g, ' '),
                                            value
                                        }))}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={50}
                                        outerRadius={80}
                                        paddingAngle={2}
                                        dataKey="value"
                                        label={({ name, percent }) => `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`}
                                        labelLine={{ stroke: '#71717a' }}
                                    >
                                        {Object.keys(stats.actionsByTool).map((_, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={CHART_COLORS[index % CHART_COLORS.length]}
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#18181b',
                                            border: '1px solid #3f3f46',
                                            borderRadius: '8px',
                                        }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                )}
            </div>

            {/* Cost Monitoring */}
            {(stats.totalInputTokens > 0 || stats.totalOutputTokens > 0) && (
                <Card className="p-6 bg-zinc-900 border-zinc-800">
                    <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-green-400" />
                        Claude API Usage
                    </h2>
                    <div className="grid gap-4 md:grid-cols-3">
                        <div className="p-4 bg-zinc-800 rounded-lg">
                            <div className="text-sm text-zinc-400">Input Tokens</div>
                            <div className="text-2xl font-bold text-white">{stats.totalInputTokens.toLocaleString()}</div>
                            <div className="text-xs text-zinc-500">~${(stats.totalInputTokens * 0.000003).toFixed(4)}</div>
                        </div>
                        <div className="p-4 bg-zinc-800 rounded-lg">
                            <div className="text-sm text-zinc-400">Output Tokens</div>
                            <div className="text-2xl font-bold text-white">{stats.totalOutputTokens.toLocaleString()}</div>
                            <div className="text-xs text-zinc-500">~${(stats.totalOutputTokens * 0.000015).toFixed(4)}</div>
                        </div>
                        <div className="p-4 bg-zinc-800 rounded-lg">
                            <div className="text-sm text-zinc-400">Estimated Cost</div>
                            <div className="text-2xl font-bold text-green-400">
                                ${((stats.totalInputTokens * 0.000003) + (stats.totalOutputTokens * 0.000015)).toFixed(4)}
                            </div>
                            <div className="text-xs text-zinc-500">{period === 'today' ? 'Today' : period === 'week' ? 'This week' : 'This month'}</div>
                        </div>
                    </div>
                </Card>
            )}

            {/* Tool Usage Grid */}
            {Object.keys(stats.actionsByTool).length > 0 && (
                <Card className="p-6 bg-zinc-900 border-zinc-800">
                    <h2 className="text-lg font-semibold text-white mb-4">Tool Usage</h2>
                    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                        {Object.entries(stats.actionsByTool)
                            .sort((a, b) => b[1] - a[1])
                            .map(([tool, count]) => (
                                <div key={tool} className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg">
                                    <span className="text-sm text-zinc-300">{tool.replace(/_/g, ' ')}</span>
                                    <span className="text-sm font-bold text-purple-400">{count}</span>
                                </div>
                            ))}
                    </div>
                </Card>
            )}

            {/* Recent Actions Table */}
            <Card className="p-6 bg-zinc-900 border-zinc-800">
                <h2 className="text-lg font-semibold text-white mb-4">Recent Actions</h2>
                {actions.length === 0 ? (
                    <div className="text-center py-8 text-zinc-500">
                        No AI actions recorded yet
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-zinc-700">
                                    <th className="text-left py-3 px-2 text-zinc-400 font-medium">Tool</th>
                                    <th className="text-left py-3 px-2 text-zinc-400 font-medium">Status</th>
                                    <th className="text-left py-3 px-2 text-zinc-400 font-medium">Venue</th>
                                    <th className="text-left py-3 px-2 text-zinc-400 font-medium">Time</th>
                                </tr>
                            </thead>
                            <tbody>
                                {actions.map(action => (
                                    <tr key={action.id} className="border-b border-zinc-800 hover:bg-zinc-800/50">
                                        <td className="py-3 px-2 text-zinc-100">
                                            <div className="flex items-center gap-2">
                                                <Zap className="h-3 w-3 text-purple-400" />
                                                {action.tool_name.replace(/_/g, ' ')}
                                            </div>
                                        </td>
                                        <td className="py-3 px-2">
                                            {action.success ? (
                                                <span className="inline-flex items-center gap-1 text-green-400">
                                                    <CheckCircle2 className="h-3 w-3" /> Success
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 text-red-400">
                                                    <XCircle className="h-3 w-3" /> Failed
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-3 px-2 text-zinc-400">
                                            {action.venues?.[0]?.name || '--'}
                                        </td>
                                        <td className="py-3 px-2 text-zinc-500">
                                            <div className="flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                {new Date(action.created_at).toLocaleTimeString()}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>
        </div>
    )
}
