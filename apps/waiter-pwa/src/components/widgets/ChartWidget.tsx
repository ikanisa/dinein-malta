import { ResponsiveContainer, AreaChart, Area, XAxis, Tooltip, CartesianGrid } from 'recharts';
import { GlassCard } from './GlassCard';

interface ChartWidgetProps {
    title: string;
    description?: string;
    data: Record<string, unknown>[];
    dataKey: string;
    xAxisKey?: string;
    color?: string;
    gradientId?: string;
    height?: number;
    className?: string;
}

export function ChartWidget({
    title,
    description,
    data,
    dataKey,
    xAxisKey = 'name',
    color = '#6366f1', // Indigo-500
    gradientId = 'colorIndigo',
    height = 200,
    className
}: ChartWidgetProps) {
    return (
        <GlassCard className={`p-6 ${className || ''}`}>
            <div className="mb-6">
                <h3 className="text-lg font-bold text-slate-900">{title}</h3>
                {description && <p className="text-sm text-slate-500">{description}</p>}
            </div>

            <div style={{ width: '100%', height: height }}>
                <ResponsiveContainer>
                    <AreaChart data={data} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                                <stop offset="95%" stopColor={color} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis
                            dataKey={xAxisKey}
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 10, fill: '#94a3b8' }}
                            dy={10}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                borderRadius: '12px',
                                border: 'none',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                            }}
                            cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }}
                        />
                        <Area
                            type="monotone"
                            dataKey={dataKey}
                            stroke={color}
                            strokeWidth={3}
                            fillOpacity={1}
                            fill={`url(#${gradientId})`}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </GlassCard>
    );
}
