import { Card } from '@dinein/ui'
import { Activity, Users, Store, ShieldAlert, BarChart3, MapPin, Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { supabase } from '../shared/services/supabase'

export default function Overview() {
    const [stats, setStats] = useState({
        totalVenues: 0,
        pendingClaims: 0,
        activeUsers: 0,
        loading: true
    })

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [venuesRes, claimsRes] = await Promise.all([
                    supabase.from('vendors').select('id', { count: 'exact', head: true }),
                    supabase.from('onboarding_requests').select('id', { count: 'exact', head: true }).eq('status', 'pending')
                ])

                setStats({
                    totalVenues: venuesRes.count || 0,
                    pendingClaims: claimsRes.count || 0,
                    activeUsers: 0, // To be implemented with auth analytics
                    loading: false
                })
            } catch (err) {
                console.error('Error fetching stats:', err)
                setStats(prev => ({ ...prev, loading: false }))
            }
        }

        fetchStats()
    }, [])

    if (stats.loading) {
        return <div className="flex justify-center p-12"><Loader2 className="animate-spin h-8 w-8 text-zinc-400" /></div>
    }

    const STATS_DATA = [
        { label: 'Total Venues', value: stats.totalVenues.toString(), icon: Store, trend: 'All time' },
        { label: 'Pending Claims', value: stats.pendingClaims.toString(), icon: ShieldAlert, trend: stats.pendingClaims > 0 ? 'Requires attention' : 'All clear', alert: stats.pendingClaims > 0 },
        { label: 'Active Users', value: '--', icon: Users, trend: 'Coming soon', disabled: true },
        { label: 'System Health', value: '99.9%', icon: Activity, trend: 'All systems operational' },
    ]

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-white">System Overview</h1>
                <p className="text-zinc-400">Global metrics and platform health.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {STATS_DATA.map(stat => {
                    const Icon = stat.icon
                    return (
                        <Card key={stat.label} className={`p-6 flex flex-col justify-between space-y-2 bg-zinc-900 border-zinc-800 text-zinc-100 ${stat.disabled ? 'opacity-60' : ''}`}>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-zinc-400">{stat.label}</span>
                                <Icon className={`h-4 w-4 ${stat.alert ? 'text-red-500' : 'text-zinc-400'}`} />
                            </div>
                            <div className="text-2xl font-bold">{stat.value}</div>
                            <div className={`text-xs ${stat.alert ? 'text-red-400' : stat.disabled ? 'text-zinc-600 italic' : 'text-zinc-500'}`}>
                                {stat.trend}
                            </div>
                        </Card>
                    )
                })}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <Card className="p-6 h-[400px] flex flex-col items-center justify-center bg-zinc-900 border-zinc-800 border-dashed">
                    <BarChart3 className="h-12 w-12 text-zinc-700 mb-4" />
                    <span className="text-zinc-400 font-medium">Activity Analytics</span>
                    <span className="text-xs text-zinc-600 mt-1">Coming soon</span>
                </Card>
                <Card className="p-6 h-[400px] flex flex-col items-center justify-center bg-zinc-900 border-zinc-800 border-dashed">
                    <MapPin className="h-12 w-12 text-zinc-700 mb-4" />
                    <span className="text-zinc-400 font-medium">Geographic Distribution</span>
                    <span className="text-xs text-zinc-600 mt-1">Coming soon</span>
                </Card>
            </div>
        </div>
    )
}
