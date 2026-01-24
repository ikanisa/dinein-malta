import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Check, Smartphone, Banknote, HelpCircle } from 'lucide-react'
import { Button, Card, useCountry } from '@dinein/ui'
import { getPaymentOptions, formatMoney, PAYMENT_METHOD_LABELS, type PaymentMethod } from '@dinein/core'

import { useVenueContext } from '../context/VenueContext'
import { useCartStore } from '../store/useCartStore'
import { supabase } from '../shared/services/supabase'

export default function Checkout() {
    const { venue } = useVenueContext()
    const { countryCode } = useCountry()
    const navigate = useNavigate()

    const items = useCartStore(state => venue ? state.getVenueItems(venue.id) : [])
    const total = useCartStore(state => venue ? state.getVenueTotal(venue.id) : 0)
    const clearCart = useCartStore(state => state.clearCart)

    // Calculate options based on current venue and country
    const paymentOptions = useMemo(() => {
        if (!venue || !countryCode) return []
        // Use the venue's declared country as authority, fallback to active context
        const modeCountry = venue.country as 'RW' | 'MT' || countryCode
        return getPaymentOptions(modeCountry, {
            momo_code: venue.momo_code || undefined,
            revolut_link: venue.revolut_link || undefined
        })
    }, [venue, countryCode])

    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>('cash')
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Calculate formatted total (before early returns to satisfy hooks rules)
    const formattedTotal = useMemo(() => {
        if (!venue) return ''
        return formatMoney(total, (venue.country as 'RW' | 'MT') || countryCode || 'RW');
    }, [total, venue, countryCode]);

    // Early returns must come AFTER all hooks
    if (!venue) return null

    if (items.length === 0) {
        navigate(`/v/${venue.slug}`)
        return null
    }

    const handlePlaceOrder = async () => {
        if (!paymentMethod) return
        setIsSubmitting(true)
        try {
            // Map payment method to expected format
            const paymentMethodMap: Record<PaymentMethod, 'cash' | 'momo' | 'revolut'> = {
                'cash': 'cash',
                'momo_ussd': 'momo',
                'revolut_link': 'revolut'
            }

            // Calculate total from items
            const total_amount = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
            const currency = venue.country === 'RW' ? 'RWF' : 'EUR'

            // Create order via edge function
            const { data: order, error } = await supabase.functions.invoke('order_create', {
                body: {
                    venue_id: venue.id,
                    payment_method: paymentMethodMap[paymentMethod],
                    total_amount,
                    currency,
                    items: items.map(item => ({
                        menu_item_id: item.itemId,
                        name: item.name,
                        quantity: item.quantity,
                        price: item.price,
                        currency
                    }))
                }
            })

            if (error || !order) {
                throw new Error(error?.message || 'Failed to create order')
            }

            clearCart(venue.id)
            navigate(`/v/${venue.slug}/orders/${order.id}`)
        } catch (err) {
            console.error(err)
            alert("Failed to place order. Please try again.")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="min-h-screen bg-background pb-32 p-4">
            <header className="mb-6 flex items-center gap-4">
                <Link to={`/v/${venue.slug}/cart`}>
                    <Button variant="ghost" size="icon" className="-ml-2">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <h1 className="text-xl font-bold">Checkout</h1>
            </header>

            <div className="space-y-6">
                <section>
                    <h2 className="mb-3 text-lg font-semibold">Order Summary</h2>
                    <Card className="p-4 bg-muted/30 border-muted/50">
                        <div className="flex justify-between items-center mb-1">
                            <span>{items.reduce((s, i) => s + i.quantity, 0)} Items</span>
                            <span className="font-medium text-lg text-primary">{formattedTotal}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">Detailed list in previous step</p>
                    </Card>
                </section>

                <section>
                    <h2 className="mb-3 text-lg font-semibold">Payment Method</h2>
                    <div className="grid gap-3">
                        {paymentOptions.map((option) => {
                            const isSelected = paymentMethod === option.method
                            const isDisabled = !option.enabled

                            // Map icons
                            let Icon = HelpCircle
                            if (option.method === 'cash') Icon = Banknote
                            if (option.method === 'momo_ussd') Icon = Smartphone
                            if (option.method === 'revolut_link') Icon = Smartphone // Or credit card

                            // Map labels
                            const label = PAYMENT_METHOD_LABELS[option.method]
                            let sublabel = option.reason === 'missing_handle'
                                ? 'Not configured by venue'
                                : 'Select to proceed'

                            if (option.method === 'cash') sublabel = 'Pay at counter/table'
                            if (option.method === 'momo_ussd' && option.enabled) sublabel = `Dial ${venue.momo_code}`
                            if (option.method === 'revolut_link' && option.enabled) sublabel = 'Revolut App'

                            return (
                                <button
                                    key={option.method}
                                    type="button"
                                    disabled={isDisabled}
                                    className={`w-full text-left flex items-center justify-between rounded-xl border p-4 transition-all
                                        ${isDisabled ? 'opacity-50 cursor-not-allowed bg-muted/50' : 'cursor-pointer'}
                                        ${isSelected && !isDisabled ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'hover:bg-muted/30'}
                                    `}
                                    onClick={() => !isDisabled && setPaymentMethod(option.method)}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`flex h-10 w-10 items-center justify-center rounded-full 
                                            ${isSelected ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                                            <Icon className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <div className="font-semibold">{label}</div>
                                            <div className="text-xs text-muted-foreground">{sublabel}</div>
                                        </div>
                                    </div>
                                    {isSelected && <Check className="h-5 w-5 text-primary" />}
                                </button>
                            )
                        })}
                    </div>
                </section>
            </div>

            <div className="fixed bottom-0 left-0 right-0 border-t bg-background p-4 pb-8 safe-area-pb">
                <Button
                    size="lg"
                    className="w-full text-lg py-6 rounded-2xl shadow-lg shadow-primary/20"
                    onClick={handlePlaceOrder}
                    disabled={isSubmitting || !paymentMethod}
                    loading={isSubmitting}
                >
                    {isSubmitting ? 'Placing Order...' : `Pay ${formattedTotal}`}
                </Button>
            </div>
        </div>
    )
}
