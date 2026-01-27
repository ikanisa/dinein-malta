import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Trash2 } from 'lucide-react'
import { Button, Card, EmptyState } from '@dinein/ui'
import { MICROCOPY } from '@dinein/core'
import { useVenueContext } from '../context/VenueContext'
import { useCartStore } from '../store/useCartStore'
import { Plus, Minus } from 'lucide-react'

export default function Cart() {
    const { venue } = useVenueContext()
    const navigate = useNavigate()

    const items = useCartStore(state => venue ? state.getVenueItems(venue.id) : [])
    const total = useCartStore(state => venue ? state.getVenueTotal(venue.id) : 0)
    const updateQuantity = useCartStore(state => state.updateQuantity)
    const removeItem = useCartStore(state => state.removeItem)

    if (!venue) return null

    if (items.length === 0) {
        return (
            <div className="flex h-screen flex-col items-center justify-center p-4">
                <EmptyState
                    variant="empty-cart"
                    title={MICROCOPY.states.empty.cart.title}
                    description={MICROCOPY.states.empty.cart.description}
                    action={{
                        label: MICROCOPY.states.empty.cart.action,
                        onClick: () => navigate(`/v/${venue.slug}`)
                    }}
                />
            </div>
        )
    }


    return (
        <div className="min-h-screen bg-background pb-32 p-4" data-testid="cart:page">
            <header className="mb-6 flex items-center gap-4">
                <Link to={`/v/${venue.slug}`}>
                    <Button variant="ghost" size="icon" className="-ml-2" aria-label="Back to menu">
                        <ArrowLeft className="h-5 w-5" aria-hidden="true" />
                    </Button>
                </Link>
                <h1 className="text-xl font-bold">Your Order</h1>
            </header>

            <div className="space-y-4" role="list">
                {items.map(item => (
                    <Card key={item.itemId} className="flex flex-col p-4 shadow-sm border-muted/40" role="listitem">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <h3 className="font-semibold">{item.name}</h3>
                                <div className="text-sm text-primary font-medium">
                                    {item.currency} {(item.price * item.quantity).toLocaleString()}
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                onClick={() => removeItem(item.itemId)}
                                aria-label={`Remove ${item.name} from cart`}
                            >
                                <Trash2 className="h-4 w-4" aria-hidden="true" />
                            </Button>
                        </div>

                        <div className="flex justify-end">
                            <div className="flex items-center gap-3 rounded-full bg-secondary/50 p-1">
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-7 w-7 rounded-full bg-background shadow-sm hover:bg-background/90"
                                    onClick={() => updateQuantity(item.itemId, -1)}
                                    aria-label={`Decrease quantity of ${item.name}`}
                                >
                                    <Minus className="h-3 w-3" aria-hidden="true" />
                                </Button>
                                <span className="w-8 text-center text-sm font-medium" aria-hidden="true">{item.quantity}</span>
                                <span className="sr-only">{item.quantity} {item.name} in cart</span>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-7 w-7 rounded-full bg-background shadow-sm hover:bg-background/90"
                                    onClick={() => updateQuantity(item.itemId, 1)}
                                    aria-label={`Increase quantity of ${item.name}`}
                                >
                                    <Plus className="h-3 w-3" aria-hidden="true" />
                                </Button>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            <div className="fixed bottom-0 left-0 right-0 border-t bg-background p-4">
                <div className="mb-4 flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>{items[0]?.currency} {total.toLocaleString()}</span>
                </div>
                <Button size="lg" className="w-full text-lg py-6 rounded-2xl" asChild data-testid="cart:checkout">
                    <Link to={`/v/${venue.slug}/checkout`}>
                        Go to Checkout
                    </Link>
                </Button>
            </div>
        </div>
    )
}
