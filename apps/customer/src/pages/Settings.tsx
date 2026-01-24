import { Link } from 'react-router-dom'
import { Heart, History, Home, Settings as SettingsIcon, Share2 } from 'lucide-react'
import { Button, Card } from '@dinein/ui'
import { useVenueContext } from '../context/VenueContext'

export default function Settings() {
    const { venue } = useVenueContext() // Only exists if we entered via a venue workflow

    return (
        <div className="min-h-screen bg-background p-4 pb-24">
            <header className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-bold">Settings</h1>
            </header>

            <div className="space-y-6">
                <section>
                    <h2 className="mb-3 text-sm font-semibold uppercase text-muted-foreground tracking-wider">Account</h2>
                    <Card className="overflow-hidden border-muted/50">
                        <div className="divide-y divide-muted">
                            <Button variant="ghost" className="w-full justify-start rounded-none p-4 h-auto">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
                                        <History className="h-5 w-5" />
                                    </div>
                                    <div className="text-left">
                                        <div className="font-medium">Order History</div>
                                        <div className="text-xs text-muted-foreground">Recent orders</div>
                                    </div>
                                </div>
                            </Button>
                            <Button variant="ghost" className="w-full justify-start rounded-none p-4 h-auto">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
                                        <Heart className="h-5 w-5" />
                                    </div>
                                    <div className="text-left">
                                        <div className="font-medium">Favorites</div>
                                        <div className="text-xs text-muted-foreground">Saved venues & items</div>
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
                            <Button variant="ghost" className="w-full justify-start rounded-none p-4 h-auto">
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
                            <Button variant="ghost" className="w-full justify-start rounded-none p-4 h-auto">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
                                        <Home className="h-5 w-5" />
                                    </div>
                                    <div className="text-left">
                                        <div className="font-medium">Add to Home Screen</div>
                                        <div className="text-xs text-muted-foreground">Install app</div>
                                    </div>
                                </div>
                            </Button>
                        </div>
                    </Card>
                </section>
            </div>

            {/* Bottom Nav Mock for Settings Page */}
            <div className="fixed bottom-0 left-0 right-0 border-t bg-background p-2 grid grid-cols-2 gap-2">
                <Link to={venue ? `/v/${venue.slug}` : "/"} className="w-full">
                    <Button variant="ghost" className="w-full flex-col h-16 gap-1 rounded-xl text-muted-foreground">
                        <Home className="h-6 w-6" />
                        <span className="text-xs">Home</span>
                    </Button>
                </Link>
                <Button variant="ghost" className="w-full flex-col h-16 gap-1 rounded-xl bg-secondary/50 text-foreground">
                    <SettingsIcon className="h-6 w-6" />
                    <span className="text-xs">Settings</span>
                </Button>
            </div>
        </div>
    )
}
