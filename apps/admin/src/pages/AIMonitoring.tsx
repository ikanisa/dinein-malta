import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../shared/services/supabase';
import { format, subDays } from 'date-fns';
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import {
    Card,
    Button,
    Skeleton,
    Badge,
} from '@dinein/ui';

interface AgentAction {
    id: string;
    session_id: string;
    correlation_id: string;
    agent_type: string;
    action_type: string;
    tool_name: string | null;
    venue_id: string | null;
    input_tokens: number | null;
    output_tokens: number | null;
    cost_usd: number | null;
    created_at: string;
}

interface AgentMetrics {
    totalActions: number;
    totalTokens: number;
    totalCost: number;
    actionsByAgent: Record<string, number>;
    topTools: { name: string; count: number }[];
    errorRate: number;
}

type TimeRange = '1h' | '24h' | '7d' | '30d';

export default function AIMonitoring() {
    const [actions, setActions] = useState<AgentAction[]>([]);
    const [metrics, setMetrics] = useState<AgentMetrics | null>(null);
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState<TimeRange>('24h');
    const [isStreaming, setIsStreaming] = useState(true);

    // Calculate time range
    const getTimeRange = useCallback(() => {
        const now = new Date();
        switch (timeRange) {
            case '1h':
                return new Date(now.getTime() - 60 * 60 * 1000);
            case '24h':
                return subDays(now, 1);
            case '7d':
                return subDays(now, 7);
            case '30d':
                return subDays(now, 30);
            default:
                return subDays(now, 1);
        }
    }, [timeRange]);

    // Fetch actions
    const fetchActions = useCallback(async () => {
        const startTime = getTimeRange().toISOString();

        const { data, error } = await supabase
            .from('agent_actions')
            .select('*')
            .gte('created_at', startTime)
            .order('created_at', { ascending: false })
            .limit(100);

        if (error) {
            console.error('Error fetching actions:', error);
            return;
        }

        setActions(data || []);
        calculateMetrics(data || []);
        setLoading(false);
    }, [getTimeRange]);

    // Calculate metrics from actions
    const calculateMetrics = (data: AgentAction[]) => {
        if (data.length === 0) {
            setMetrics({
                totalActions: 0,
                totalTokens: 0,
                totalCost: 0,
                actionsByAgent: {},
                topTools: [],
                errorRate: 0,
            });
            return;
        }

        const actionsByAgent: Record<string, number> = {};
        const toolCounts: Record<string, number> = {};
        let totalTokens = 0;
        let totalCost = 0;
        let errorCount = 0;

        for (const action of data) {
            // Count by agent type
            actionsByAgent[action.agent_type] = (actionsByAgent[action.agent_type] || 0) + 1;

            // Count tools
            if (action.tool_name) {
                toolCounts[action.tool_name] = (toolCounts[action.tool_name] || 0) + 1;
            }

            // Sum tokens and cost
            totalTokens += (action.input_tokens || 0) + (action.output_tokens || 0);
            totalCost += action.cost_usd || 0;

            // Count errors
            if (action.action_type?.includes('error')) {
                errorCount++;
            }
        }

        // Top tools
        const topTools = Object.entries(toolCounts)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

        setMetrics({
            totalActions: data.length,
            totalTokens,
            totalCost,
            actionsByAgent,
            topTools,
            errorRate: data.length > 0 ? (errorCount / data.length) * 100 : 0,
        });
    };

    // Set up real-time subscription
    useEffect(() => {
        fetchActions();

        if (!isStreaming) return;

        const channel = supabase
            .channel('agent-actions-stream')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'agent_actions',
                },
                (payload: RealtimePostgresChangesPayload<AgentAction>) => {
                    const newAction = payload.new as AgentAction;
                    setActions((prev) => [newAction, ...prev.slice(0, 99)]);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [fetchActions, isStreaming]);

    // Refresh on time range change
    useEffect(() => {
        setLoading(true);
        fetchActions();
    }, [timeRange, fetchActions]);

    const agentColors: Record<string, string> = {
        guest: 'bg-emerald-100 text-emerald-800',
        bar_manager: 'bg-blue-100 text-blue-800',
        admin: 'bg-purple-100 text-purple-800',
        ui_orchestrator: 'bg-amber-100 text-amber-800',
        research_intel: 'bg-rose-100 text-rose-800',
    };

    if (loading) {
        return (
            <div className="p-6 space-y-6">
                <Skeleton className="h-8 w-48" />
                <div className="grid grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <Skeleton key={i} className="h-24" />
                    ))}
                </div>
                <Skeleton className="h-96" />
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">AI Monitoring</h1>
                    <p className="text-sm text-gray-500">Real-time agent activity stream</p>
                </div>
                <div className="flex items-center gap-3">
                    {/* Streaming toggle */}
                    <Button
                        variant={isStreaming ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setIsStreaming(!isStreaming)}
                    >
                        {isStreaming ? '● Live' : '○ Paused'}
                    </Button>

                    {/* Time range selector */}
                    <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
                        {(['1h', '24h', '7d', '30d'] as TimeRange[]).map((range) => (
                            <button
                                key={range}
                                onClick={() => setTimeRange(range)}
                                className={`px-3 py-1 text-sm rounded-md transition-colors ${timeRange === range
                                    ? 'bg-white shadow text-gray-900'
                                    : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                {range}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Metrics Cards */}
            {metrics && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card className="p-4">
                        <p className="text-sm text-gray-500">Total Actions</p>
                        <p className="text-2xl font-bold">{metrics.totalActions}</p>
                    </Card>
                    <Card className="p-4">
                        <p className="text-sm text-gray-500">Total Tokens</p>
                        <p className="text-2xl font-bold">{metrics.totalTokens.toLocaleString()}</p>
                    </Card>
                    <Card className="p-4">
                        <p className="text-sm text-gray-500">Total Cost</p>
                        <p className="text-2xl font-bold">${metrics.totalCost.toFixed(4)}</p>
                    </Card>
                    <Card className="p-4">
                        <p className="text-sm text-gray-500">Error Rate</p>
                        <p className={`text-2xl font-bold ${metrics.errorRate > 5 ? 'text-red-600' : 'text-green-600'}`}>
                            {metrics.errorRate.toFixed(1)}%
                        </p>
                    </Card>
                </div>
            )}

            {/* Agent Distribution & Top Tools */}
            {metrics && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="p-4">
                        <h3 className="font-semibold mb-3">Actions by Agent</h3>
                        <div className="space-y-2">
                            {Object.entries(metrics.actionsByAgent).map(([agent, count]) => (
                                <div key={agent} className="flex items-center justify-between">
                                    <Badge className={agentColors[agent] || 'bg-gray-100'}>
                                        {agent}
                                    </Badge>
                                    <span className="font-medium">{count}</span>
                                </div>
                            ))}
                            {Object.keys(metrics.actionsByAgent).length === 0 && (
                                <p className="text-gray-500 text-sm">No activity</p>
                            )}
                        </div>
                    </Card>

                    <Card className="p-4">
                        <h3 className="font-semibold mb-3">Top Tools</h3>
                        <div className="space-y-2">
                            {metrics.topTools.map((tool) => (
                                <div key={tool.name} className="flex items-center justify-between">
                                    <code className="text-sm bg-gray-100 px-2 py-0.5 rounded">
                                        {tool.name}
                                    </code>
                                    <span className="font-medium">{tool.count}</span>
                                </div>
                            ))}
                            {metrics.topTools.length === 0 && (
                                <p className="text-gray-500 text-sm">No tool usage</p>
                            )}
                        </div>
                    </Card>
                </div>
            )}

            {/* Activity Stream */}
            <Card className="p-0 overflow-hidden">
                <div className="px-4 py-3 border-b bg-gray-50">
                    <h3 className="font-semibold">Activity Stream</h3>
                </div>
                <div className="divide-y max-h-[400px] overflow-y-auto">
                    {actions.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            No agent activity in the selected time range
                        </div>
                    ) : (
                        actions.map((action) => (
                            <div key={action.id} className="px-4 py-3 hover:bg-gray-50 transition-colors">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Badge className={agentColors[action.agent_type] || 'bg-gray-100'}>
                                            {action.agent_type}
                                        </Badge>
                                        <span className="font-medium">
                                            {action.tool_name || action.action_type}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-gray-500">
                                        {action.input_tokens && (
                                            <span>{action.input_tokens + (action.output_tokens || 0)} tokens</span>
                                        )}
                                        <span>
                                            {format(new Date(action.created_at), 'HH:mm:ss')}
                                        </span>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-400 mt-1">
                                    {action.correlation_id}
                                </p>
                            </div>
                        ))
                    )}
                </div>
            </Card>
        </div>
    );
}
