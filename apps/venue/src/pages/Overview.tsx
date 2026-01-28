import { Card } from '@dinein/ui'
import { DollarSign, ShoppingBag, Users, TrendingUp, Loader2, BarChart3 } from 'lucide-react'
import { useVenueStats } from '../hooks/useVenueStats'
import { useOwner } from '../context/OwnerContext'
import { AIAssistantPanel } from '../components/AIAssistantPanel'

export default function Overview() {
    const { stats, loading } = useVenueStats()
    const { venue } = useOwner()

    if (loading) {
        return <div className="flex justify-center p-12"><Loader2 className="animate-spin h-8 w-8 text-indigo-600" /></div>
    }

    const DYNAMIC_STATS = [
        { label: 'Total Revenue (Today)', value: `RWF ${stats.totalRevenue.toLocaleString()}`, icon: DollarSign, trend: stats.trends.revenue },
        { label: 'Active Orders', value: stats.activeOrders.toString(), icon: ShoppingBag, trend: stats.trends.orders },
        { label: 'Table Occupancy', value: stats.tableOccupancy > 0 ? `${stats.tableOccupancy}%` : '--', icon: Users, trend: 'Coming soon', disabled: stats.tableOccupancy === 0 },
        { label: 'Avg Order Value', value: '--', icon: TrendingUp, trend: 'Coming soon', disabled: true },
    ]

    return (
        <div className="space-y-8 animate-fade-in" data-testid="venue-dashboard:page">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground">Overview of your venue's performance today.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {DYNAMIC_STATS.map(stat => {
                    const Icon = stat.icon
                    return (
                        <Card key={stat.label} className={`p-6 flex flex-col justify-between space-y-2 ${stat.disabled ? 'opacity-60' : ''}`}>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-muted-foreground">{stat.label}</span>
                                <Icon className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <div className="text-2xl font-bold">{stat.value}</div>
                            <div className="text-xs text-muted-foreground">
                                <span className={stat.trend === 'Coming soon' ? 'text-slate-400 italic' : stat.trend.startsWith('+') ? 'text-green-600' : stat.trend.startsWith('-') ? 'text-red-600' : 'text-slate-500'}>
                                    {stat.trend}
                                </span>{stat.trend !== 'Coming soon' && ' vs yesterday'}
                            </div>
                        </Card>
                    )
                })}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <Card className="p-6 h-[400px] flex flex-col items-center justify-center bg-muted/10 border-dashed">
                    <BarChart3 className="h-10 w-10 text-muted-foreground/50 mb-3" />
                    <span className="text-muted-foreground font-medium">Revenue Analytics</span>
                    <span className="text-xs text-muted-foreground/70 mt-1">Coming soon</span>
                </Card>

                {/* AI Assistant Panel */}
                {venue?.id && (
                    <AIAssistantPanel venueId={venue.id} />
                )}
            </div>
        </div>
    )
}
