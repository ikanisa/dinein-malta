import { useState } from 'react'
import { Heart, History, Share2, Download, ChevronRight, Clock, Loader2 } from 'lucide-react'
import { Button, Card, useA2HS, EmptyState } from '@dinein/ui'
import { formatMoney } from '@dinein/core'
import { useVenueContext } from '../context/VenueContext'
import { useOrderHistory } from '../hooks/useOrderHistory'
import { BottomNav } from '../components/BottomNav'

export default function Settings() {
    const venueContext = useVenueContext()
    const venue = venueContext?.venue ?? null // Gracefully handle undefined context
    const { orders, loading: ordersLoading } = useOrderHistory()
    const { canInstall, install } = useA2HS()

    const [showOrderHistory, setShowOrderHistory] = useState(false)
    const [installing, setInstalling] = useState(false)

    const handleInstall = async () => {
        setInstalling(true)
        try {
            await install()
        } finally {
            setInstalling(false)
        }
    }

    const handleShare = async () => {
        const shareData = {
            title: 'DineIn',
            text: 'Order from your favorite restaurants with DineIn!',
            url: window.location.origin,
        }

        if (navigator.share) {
            await navigator.share(shareData)
        } else {
            await navigator.clipboard.writeText(shareData.url)
            alert('Link copied to clipboard!')
        }
    }

    return (
        <>
            <div className="min-h-screen bg-background p-4 pb-24">
                <header className="mb-6 flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Settings</h1>
                </header>

                <div className="space-y-6">
                    <section>
                        <h2 className="mb-3 text-sm font-semibold uppercase text-muted-foreground tracking-wider">Account</h2>
                        <Card className="overflow-hidden border-muted/50">
                            <div className="divide-y divide-muted">
                                <Button
                                    variant="ghost"
                                    className="w-full justify-between rounded-none p-4 h-auto"
                                    onClick={() => setShowOrderHistory(!showOrderHistory)}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
                                            <History className="h-5 w-5" />
                                        </div>
                                        <div className="text-left">
                                            <div className="font-medium">Order History</div>
                                            <div className="text-xs text-muted-foreground">
                                                {orders.length > 0 ? `${orders.length} orders` : 'No orders yet'}
                                            </div>
                                        </div>
                                    </div>
                                    <ChevronRight className={`h-5 w-5 text-muted-foreground transition-transform ${showOrderHistory ? 'rotate-90' : ''}`} />
                                </Button>

                                {/* Order History Expandable Section */}
                                {showOrderHistory && (
                                    <div className="bg-muted/30 p-4 space-y-3">
                                        {ordersLoading ? (
                                            <div className="flex items-center justify-center py-4">
                                                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                                            </div>
                                        ) : orders.length > 0 ? (
                                            orders.slice(0, 5).map(order => (
                                                <div
                                                    key={order.id}
                                                    className="flex items-center justify-between rounded-lg bg-background p-3 shadow-sm"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <Clock className="h-4 w-4 text-muted-foreground" />
                                                        <div>
                                                            <div className="text-sm font-medium">
                                                                {formatMoney(order.total_amount, order.currency === 'RWF' ? 'RW' : 'MT')}
                                                            </div>
                                                            <div className="text-xs text-muted-foreground">
                                                                {new Date(order.created_at).toLocaleDateString()}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <span className={`text-xs px-2 py-1 rounded-full ${order.status === 'served' ? 'bg-green-100 text-green-700' :
                                                            order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                                                'bg-yellow-100 text-yellow-700'
                                                        }`}>
                                                        {order.status}
                                                    </span>
                                                </div>
                                            ))
                                        ) : (
                                            <EmptyState
                                                variant="no-results"
                                                title="No orders yet"
                                                description="Your order history will appear here"
                                                className="py-4"
                                            />
                                        )}
                                    </div>
                                )}

                                <Button variant="ghost" className="w-full justify-start rounded-none p-4 h-auto" disabled>
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
                                            <Heart className="h-5 w-5" />
                                        </div>
                                        <div className="text-left">
                                            <div className="font-medium">Favorites</div>
                                            <div className="text-xs text-muted-foreground">Coming soon</div>
                                        </div>
                                    </div>
                                </Button>
                            </div>
                        </Card>
                    </section>

                    <section>
                        <h2 className="mb-3 text-sm font-semibold uppercase text-muted-foreground tracking-wider">App</h2>
                        <Card className="overflow-hidden border-muted/50">
                            <div className="divide-y divide-muted">
                                <Button
                                    variant="ghost"
                                    className="w-full justify-start rounded-none p-4 h-auto"
                                    onClick={handleShare}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
                                            <Share2 className="h-5 w-5" />
                                        </div>
                                        <div className="text-left">
                                            <div className="font-medium">Invite Friends</div>
                                            <div className="text-xs text-muted-foreground">Share DineIn</div>
                                        </div>
                                    </div>
                                </Button>
                                <Button
                                    variant="ghost"
                                    className="w-full justify-start rounded-none p-4 h-auto"
                                    onClick={handleInstall}
                                    disabled={!canInstall || installing}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
                                            {installing ? (
                                                <Loader2 className="h-5 w-5 animate-spin" />
                                            ) : (
                                                <Download className="h-5 w-5" />
                                            )}
                                        </div>
                                        <div className="text-left">
                                            <div className="font-medium">Add to Home Screen</div>
                                            <div className="text-xs text-muted-foreground">
                                                {canInstall ? 'Install app' : 'Already installed or not available'}
                                            </div>
                                        </div>
                                    </div>
                                </Button>
                            </div>
                        </Card>
                    </section>
                </div>
            </div>

            {/* Bottom Navigation - EXACTLY 2 tabs per STARTER RULES */}
            <BottomNav venueSlug={venue?.slug} />
        </>
    )
}
