import { useParams, Link } from 'react-router-dom'
import { CheckCircle2, Clock, Utensils, XCircle, ArrowLeft } from 'lucide-react'
import { Button, Card } from '@dinein/ui'
import { useOrder } from '../hooks/useOrder'
import { useVenueContext } from '../context/VenueContext'

const STATUS_STEPS = [
    { id: 'placed', label: 'Order Placed', icon: CheckCircle2 },
    { id: 'received', label: 'Confimred', icon: Clock },
    { id: 'served', label: 'Served', icon: Utensils },
]

export default function OrderStatus() {
    const { orderId } = useParams<{ orderId: string }>()
    const { order, loading } = useOrder(orderId)
    const { venue } = useVenueContext()

    if (loading) {
        return <div className="p-8 text-center animate-pulse">Loading order status...</div>
    }

    if (!order || !venue) {
        return <div className="p-8 text-center text-destructive">Order not found</div>
    }

    const currentStepIndex = STATUS_STEPS.findIndex(s => s.id === order.status)
    const isCancelled = order.status === 'cancelled'

    return (
        <div className="min-h-screen bg-background p-4">
            <header className="mb-6">
                <Link to={`/v/${venue.slug}`}>
                    <Button variant="ghost" className="-ml-4 gap-2 text-muted-foreground">
                        <ArrowLeft className="h-4 w-4" /> Back to Menu
                    </Button>
                </Link>
                <h1 className="mt-2 text-2xl font-bold">Order #{order.id.slice(-4)}</h1>
                <p className="text-muted-foreground">{venue.name}</p>
            </header>

            <Card className="p-6 border-muted/50 mb-6 transition-all duration-500">
                <div className="text-center mb-6">
                    <div className="text-4xl font-bold text-primary mb-1">
                        {order.currency} {order.total_amount.toLocaleString()}
                    </div>
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${isCancelled ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                        }`}>
                        {isCancelled ? (
                            <>
                                <XCircle className="h-4 w-4" /> Cancelled
                            </>
                        ) : (
                            // Show label of current status
                            STATUS_STEPS.find(s => s.id === order.status)?.label || 'Processing'
                        )}
                    </div>
                </div>

                {!isCancelled && (
                    <div className="space-y-8 relative pl-4 border-l-2 border-muted ml-2">
                        {STATUS_STEPS.map((step, index) => {
                            const DeviceIcon = step.icon
                            const isCompleted = index <= currentStepIndex
                            const isCurrent = index === currentStepIndex

                            return (
                                <div key={step.id} className="relative pl-6">
                                    <div className={`absolute -left-[21px] top-0 flex h-10 w-10 items-center justify-center rounded-full border-4 border-background transition-all ${isCompleted ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
                                        }`}>
                                        <DeviceIcon className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h3 className={`font-semibold ${isCompleted ? 'text-foreground' : 'text-muted-foreground'}`}>
                                            {step.label}
                                        </h3>
                                        {isCurrent && (
                                            <p className="text-sm text-muted-foreground animate-pulse">
                                                In progress...
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </Card>

            <div className="text-center">
                <p className="text-sm text-muted-foreground mb-4">
                    Show this screen to the waiter if needed.
                </p>
            </div>
        </div>
    )
}
