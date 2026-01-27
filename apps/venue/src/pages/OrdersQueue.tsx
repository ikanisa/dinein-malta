import { useState, useCallback } from 'react'
import { Button, Card, OrdersQueueTabs, ContextMenuSheet, type ContextMenuItem, PullToRefresh } from '@dinein/ui'
import { Clock, CheckCircle2, AlertCircle, Eye, XCircle, ChefHat, RefreshCw } from 'lucide-react'
import { useOwner } from '../context/OwnerContext'
import { useOrders, OrderWithItems } from '../hooks/useOrders'


export default function OrdersQueue() {
    const { venue } = useOwner()
    const { activeOrders, servedOrders, loading, updateOrderStatus, refresh } = useOrders()
    const [activeTab, setActiveTab] = useState<'active' | 'served'>('active')
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [selectedOrder, setSelectedOrder] = useState<OrderWithItems | null>(null)

    const handleRefresh = useCallback(async () => {
        setIsRefreshing(true)
        await refresh()
        setIsRefreshing(false)
    }, [refresh])

    const formatTimeAgo = useCallback((dateStr: string) => {
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
    }, [])

    // Generate context menu items based on order status
    const getOrderMenuItems = useCallback((order: OrderWithItems): ContextMenuItem[] => {
        const items: ContextMenuItem[] = [
            {
                id: 'view',
                label: 'View Details',
                icon: <Eye className="h-4 w-4" />,
                onSelect: () => setSelectedOrder(order),
            },
        ]

        if (order.status === 'placed') {
            items.push(
                {
                    id: 'accept',
                    label: 'Accept Order',
                    icon: <ChefHat className="h-4 w-4" />,
                    onSelect: () => updateOrderStatus(order.id, 'received'),
                },
                {
                    id: 'reject',
                    label: 'Reject Order',
                    icon: <XCircle className="h-4 w-4" />,
                    onSelect: () => {
                        // Destructive actions need confirmation - handled by UI
                        if (confirm('Reject this order?')) {
                            updateOrderStatus(order.id, 'cancelled')
                        }
                    },
                    destructive: true,
                }
            )
        }

        if (order.status === 'received') {
            items.push({
                id: 'served',
                label: 'Mark as Served',
                icon: <CheckCircle2 className="h-4 w-4" />,
                onSelect: () => updateOrderStatus(order.id, 'served'),
            })
        }

        return items
    }, [updateOrderStatus])

    // Early return AFTER all hooks
    if (!venue) return null

    const orders = activeTab === 'active' ? activeOrders : servedOrders


    return (
        <div className="space-y-6 animate-in fade-in duration-500" data-testid="venue-orders:page">
            <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Orders Queue</h1>
                    <p className="text-muted-foreground">Manage incoming and active orders.</p>
                </div>
                <OrdersQueueTabs
                    statuses={[
                        { id: 'placed', label: 'Placed', count: activeOrders.filter(o => o.status === 'placed').length },
                        { id: 'received', label: 'In Prep', count: activeOrders.filter(o => o.status === 'received').length },
                        { id: 'served', label: 'Served', count: servedOrders.length },
                        { id: 'cancelled', label: 'Cancelled', count: 0 }
                    ]}
                    activeStatus={activeTab === 'active' ? 'placed' : 'served'}
                    onStatusChange={(status) => {
                        if (status === 'served') setActiveTab('served')
                        else setActiveTab('active')
                    }}
                    className="max-w-md"
                />
            </header>

            <PullToRefresh onRefresh={handleRefresh} isRefreshing={isRefreshing} className="flex-1">
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map(i => <div key={i} className="h-64 bg-muted rounded-xl animate-pulse" />)}
                    </div>
                ) : orders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-muted-foreground border-2 border-dashed border-border rounded-xl bg-card/50">
                        <Clock className="h-12 w-12 mb-4 opacity-20" />
                        <p>No {activeTab} orders found.</p>
                        <Button
                            variant="outline"
                            size="sm"
                            className="mt-4 gap-2"
                            onClick={handleRefresh}
                            disabled={isRefreshing}
                        >
                            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                            Refresh
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {orders.map(order => (
                            <ContextMenuSheet
                                key={order.id}
                                items={getOrderMenuItems(order)}
                                title={order.table_no ? `Table ${order.table_no}` : 'Takeout Order'}
                                menuButtonClassName="z-10"
                            >
                                <Card className="flex flex-col overflow-hidden border border-border hover:border-primary/20 transition-all shadow-sm bg-card" data-testid={`venue-orders:order-card:${order.id}`}>
                                    <div className={`p-4 border-b border-border flex justify-between items-center ${order.status === 'placed' ? 'bg-yellow-500/10' : 'bg-muted/30'}`}>
                                        <div className="font-bold text-lg flex items-center gap-2">
                                            {order.table_no ? `Table ${order.table_no}` : 'Takeout'}
                                            {order.status === 'placed' && <span className="flex h-2 w-2 rounded-full bg-yellow-500 animate-pulse" />}
                                        </div>
                                        <div className="text-xs text-muted-foreground flex items-center gap-1 mr-8">
                                            <Clock className="h-3 w-3" /> {formatTimeAgo(order.created_at)}
                                        </div>
                                    </div>
                                    <div className="p-4 flex-1 space-y-3">
                                        <div className="space-y-1">
                                            {(order.items || []).map((item, idx) => (
                                                <div key={idx} className="flex justify-between text-sm">
                                                    <span className="font-medium text-foreground">{item.quantity}x {item.name}</span>
                                                </div>
                                            ))}
                                            {(!order.items || order.items.length === 0) && (
                                                <div className="text-sm text-destructive italic flex items-center gap-1">
                                                    <AlertCircle className="h-3 w-3" /> No items data
                                                </div>
                                            )}
                                        </div>
                                        <div className="pt-2 border-t border-border text-right font-bold text-muted-foreground">
                                            {order.currency} {order.total_amount.toLocaleString()}
                                        </div>
                                    </div>
                                    <div className="p-3 bg-muted/20 grid grid-cols-2 gap-2">
                                        {order.status === 'placed' && (
                                            <>
                                                <Button variant="outline" className="text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/20" onClick={() => updateOrderStatus(order.id, 'cancelled')} data-testid={`venue-orders:cancel:${order.id}`}>Reject</Button>
                                                <Button className="bg-primary hover:bg-primary/90 shadow-glass" onClick={() => updateOrderStatus(order.id, 'received')} data-testid={`venue-orders:mark-received:${order.id}`}>Accept</Button>
                                            </>
                                        )}
                                        {order.status === 'received' && (
                                            <>
                                                <div /> {/* Spacer */}
                                                <Button className="bg-green-600 hover:bg-green-700 gap-2 text-white shadow-md" onClick={() => updateOrderStatus(order.id, 'served')} data-testid={`venue-orders:mark-served:${order.id}`}>
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
                            </ContextMenuSheet>
                        ))}
                    </div>
                )}
            </PullToRefresh>

            {/* Order detail sheet would go here if selectedOrder is set */}
            {selectedOrder && (
                <div
                    className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                    onClick={() => setSelectedOrder(null)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') setSelectedOrder(null)
                    }}
                >
                    <Card
                        className="w-full max-w-md p-6"
                        onClick={e => e.stopPropagation()}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="modal-title"
                        tabIndex={-1}
                    >
                        <h2 id="modal-title" className="text-xl font-bold mb-4">Order #{selectedOrder.id.slice(0, 8)}</h2>
                        <p className="text-muted-foreground">Table: {selectedOrder.table_no || 'Takeout'}</p>
                        <p className="text-muted-foreground">Status: {selectedOrder.status}</p>
                        <Button className="mt-4 w-full" onClick={() => setSelectedOrder(null)}>Close</Button>
                    </Card>
                </div>
            )}
        </div>
    )
}

