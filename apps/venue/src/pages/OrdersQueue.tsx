import { useState } from 'react'
import { Button, Card } from '@dinein/ui'
import { Clock, CheckCircle2, AlertCircle } from 'lucide-react'
import { useOwner } from '../context/OwnerContext'
import { useOrders } from '../hooks/useOrders'


export default function OrdersQueue() {
    const { venue } = useOwner()
    const { activeOrders, servedOrders, loading, updateOrderStatus } = useOrders()
    const [activeTab, setActiveTab] = useState<'active' | 'served'>('active')

    if (!venue) return null

    const orders = activeTab === 'active' ? activeOrders : servedOrders

    // Simple TimeAgo wrapper if date-fns is not available, but usually it is.
    // If build fails on date-fns, I'll replace it with a helper.
    // For now assuming it is or I will add it, OR I write a safe helper.
    // Let's write a safe helper to be dependency-free as per "No heavy libs without justification".
    const formatTimeAgo = (dateStr: string) => {
        try {
            const date = new Date(dateStr)
            const now = new Date()
            const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

            if (diffInSeconds < 60) return 'Just now'
            if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
            if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
            return date.toLocaleDateString()
        } catch {
            return 'Unknown'
        }
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Orders Queue</h1>
                    <p className="text-muted-foreground">Manage incoming and active orders.</p>
                </div>
                <div className="flex gap-2">
                    <div className="flex rounded-lg bg-muted p-1">
                        <button
                            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'active' ? 'bg-background shadow' : 'text-muted-foreground'}`}
                            onClick={() => setActiveTab('active')}
                        >
                            Active ({activeOrders.length})
                        </button>
                        <button
                            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'served' ? 'bg-background shadow' : 'text-muted-foreground'}`}
                            onClick={() => setActiveTab('served')}
                        >
                            Served ({servedOrders.length})
                        </button>
                    </div>
                </div>
            </header>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => <div key={i} className="h-64 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />)}
                </div>
            ) : orders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground border-2 border-dashed rounded-xl">
                    <Clock className="h-12 w-12 mb-4 opacity-20" />
                    <p>No {activeTab} orders found.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {orders.map(order => (
                        <Card key={order.id} className="flex flex-col overflow-hidden border-2 border-transparent hover:border-muted-foreground/20 transition-all shadow-sm">
                            <div className={`p-4 border-b flex justify-between items-center ${order.status === 'placed' ? 'bg-yellow-50 dark:bg-yellow-900/10' : 'bg-muted/30'}`}>
                                <div className="font-bold text-lg flex items-center gap-2">
                                    {order.table_no ? `Table ${order.table_no}` : 'Takeout'}
                                    {order.status === 'placed' && <span className="flex h-2 w-2 rounded-full bg-yellow-500 animate-pulse" />}
                                </div>
                                <div className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Clock className="h-3 w-3" /> {formatTimeAgo(order.created_at)}
                                </div>
                            </div>
                            <div className="p-4 flex-1 space-y-3">
                                <div className="space-y-1">
                                    {(order.items || []).map((item, idx) => (
                                        <div key={idx} className="flex justify-between text-sm">
                                            <span className="font-medium">{item.quantity}x {item.name}</span>
                                        </div>
                                    ))}
                                    {(!order.items || order.items.length === 0) && (
                                        <div className="text-sm text-destructive italic flex items-center gap-1">
                                            <AlertCircle className="h-3 w-3" /> No items data
                                        </div>
                                    )}
                                </div>
                                <div className="pt-2 border-t text-right font-bold text-muted-foreground">
                                    {order.currency} {order.total_amount.toLocaleString()}
                                </div>
                            </div>
                            <div className="p-3 bg-muted/10 grid grid-cols-2 gap-2">
                                {order.status === 'placed' && (
                                    <>
                                        <Button variant="outline" className="text-destructive hover:bg-destructive/10" onClick={() => updateOrderStatus(order.id, 'cancelled')}>Reject</Button>
                                        <Button className="bg-blue-600 hover:bg-blue-700 shadow-blue-200 dark:shadow-none" onClick={() => updateOrderStatus(order.id, 'received')}>Accept</Button>
                                    </>
                                )}
                                {order.status === 'received' && (
                                    <>
                                        <div /> {/* Spacer */}
                                        <Button className="bg-green-600 hover:bg-green-700 gap-2 shadow-green-200 dark:shadow-none" onClick={() => updateOrderStatus(order.id, 'served')}>
                                            <CheckCircle2 className="h-4 w-4" /> Mark Served
                                        </Button>
                                    </>
                                )}
                                {order.status === 'served' && (
                                    <div className="col-span-2 text-center text-sm font-medium text-green-600 flex items-center justify-center gap-2">
                                        <CheckCircle2 className="h-4 w-4" /> Completed
                                    </div>
                                )}
                                {order.status === 'cancelled' && (
                                    <div className="col-span-2 text-center text-sm font-medium text-destructive">
                                        Cancelled
                                    </div>
                                )}
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
