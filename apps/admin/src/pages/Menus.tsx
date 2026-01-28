import { useState, useEffect } from 'react'
import { Card, Badge, Button, Skeleton } from '@dinein/ui'
import { Search, UtensilsCrossed, Building2, ChevronRight, RefreshCw, FileText } from 'lucide-react'
import { supabase } from '../shared/services/supabase'
import { Venue } from '@dinein/db'

interface VenueWithMenuStats extends Venue {
    menu_count: number
}

export default function Menus() {
    const [venues, setVenues] = useState<VenueWithMenuStats[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        fetchVenues()
    }, [])

    const fetchVenues = async () => {
        setLoading(true)
        try {
            // Fetch venues
            const { data: venuesData, error: venuesError } = await supabase
                .from('venues')
                .select('*')
                .eq('claimed', true)
                .order('name', { ascending: true })

            if (venuesError) throw venuesError

            // For each venue, get menu item count
            const venuesWithCounts = await Promise.all(
                (venuesData || []).map(async (venue) => {
                    const { count, error } = await supabase
                        .from('menu_items')
                        .select('*', { count: 'exact', head: true })
                        .eq('venue_id', venue.id)

                    return {
                        ...venue,
                        menu_count: error ? 0 : (count || 0)
                    } as VenueWithMenuStats
                })
            )

            setVenues(venuesWithCounts)
        } catch (error) {
            console.error('Error fetching venues:', error)
        } finally {
            setLoading(false)
        }
    }

    const filteredVenues = venues.filter(v =>
        v.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    // Stats
    const totalItems = venues.reduce((sum, v) => sum + v.menu_count, 0)
    const venuesWithMenus = venues.filter(v => v.menu_count > 0).length
    const emptyVenues = venues.filter(v => v.menu_count === 0).length

    if (loading) {
        return (
            <div className="space-y-6">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Menu Management</h1>
                <div className="grid grid-cols-3 gap-4">
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-24" />)}
                </div>
                <div className="space-y-3">
                    {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-20" />)}
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Menu Management</h1>
                    <p className="text-muted-foreground">View and manage venue menus.</p>
                </div>
                <Button onClick={fetchVenues} variant="outline" size="sm" className="gap-2">
                    <RefreshCw className="h-4 w-4" /> Refresh
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="p-4 bg-card border-border">
                    <div className="flex items-center gap-3">
                        <Building2 className="h-8 w-8 text-muted-foreground" />
                        <div>
                            <p className="text-2xl font-bold">{venues.length}</p>
                            <p className="text-sm text-muted-foreground">Active Venues</p>
                        </div>
                    </div>
                </Card>
                <Card className="p-4 bg-card border-border">
                    <div className="flex items-center gap-3">
                        <UtensilsCrossed className="h-8 w-8 text-primary" />
                        <div>
                            <p className="text-2xl font-bold">{totalItems}</p>
                            <p className="text-sm text-muted-foreground">Total Items</p>
                        </div>
                    </div>
                </Card>
                <Card className="p-4 bg-green-500/10 border-green-500/30">
                    <div className="flex items-center gap-3">
                        <FileText className="h-8 w-8 text-green-500" />
                        <div>
                            <p className="text-2xl font-bold text-green-500">{venuesWithMenus}</p>
                            <p className="text-sm text-muted-foreground">With Menus</p>
                        </div>
                    </div>
                </Card>
                <Card className="p-4 bg-orange-500/10 border-orange-500/30">
                    <div className="flex items-center gap-3">
                        <FileText className="h-8 w-8 text-orange-500" />
                        <div>
                            <p className="text-2xl font-bold text-orange-500">{emptyVenues}</p>
                            <p className="text-sm text-muted-foreground">Need Items</p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <input
                    className="w-full bg-muted border border-border rounded-lg py-2 pl-10 pr-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="Search venues..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Venues List */}
            <div className="space-y-3">
                {filteredVenues.length === 0 ? (
                    <Card className="p-8 text-center bg-card border-border">
                        <UtensilsCrossed className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">
                            {venues.length === 0 ? 'No active venues yet' : 'No venues match your search'}
                        </p>
                    </Card>
                ) : (
                    filteredVenues.map(venue => (
                        <Card
                            key={venue.id}
                            className="p-4 bg-card border-border hover:bg-muted/30 transition-colors cursor-pointer"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                                        <Building2 className="h-6 w-6 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold">{venue.name}</h3>
                                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                            <Badge variant="outline" className="text-xs">
                                                {venue.country === 'RW' ? '🇷🇼' : '🇲🇹'} {venue.country}
                                            </Badge>
                                            <span className="font-mono text-xs">{venue.slug}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <p className={`text-xl font-bold ${venue.menu_count === 0 ? 'text-muted-foreground' : ''}`}>
                                            {venue.menu_count}
                                        </p>
                                        <p className="text-xs text-muted-foreground">items</p>
                                    </div>
                                    {venue.menu_count === 0 && (
                                        <Badge variant="outline" className="border-orange-500/50 text-orange-500 bg-orange-500/10">
                                            Empty
                                        </Badge>
                                    )}
                                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                                </div>
                            </div>
                        </Card>
                    ))
                )}
            </div>

            {/* Info Note */}
            <div className="text-center text-sm text-muted-foreground p-4 bg-muted/30 rounded-lg">
                <p>
                    <strong>Coming soon:</strong> OCR job review and menu item management.
                </p>
                <p className="text-xs mt-1">
                    Venue owners can add menu items from their portal.
                </p>
            </div>
        </div>
    )
}
