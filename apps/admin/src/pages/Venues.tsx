import { useState, useEffect, useCallback } from 'react'
import { Card, Badge, Button, Skeleton } from '@dinein/ui'
import { Search, Building2, RefreshCw } from 'lucide-react'
import { Venue } from '@dinein/db'
import { supabase } from '../shared/services/supabase'
import { VenueDetailSheet } from '../components/VenueDetailSheet'

export default function Venues() {
    const [searchTerm, setSearchTerm] = useState('')
    const [venues, setVenues] = useState<Venue[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null)
    const [countryFilter, setCountryFilter] = useState<'all' | 'RW' | 'MT'>('all')
    const [statusFilter, setStatusFilter] = useState<'all' | 'claimed' | 'unclaimed'>('all')

    const fetchVenues = useCallback(async () => {
        setLoading(true)
        try {
            const { data, error } = await supabase
                .from('vendors')
                .select('*')
                .order('name', { ascending: true })

            if (error) {
                console.error('Error fetching venues:', error)
                return
            }

            setVenues((data || []) as Venue[])
        } catch (error) {
            console.error('Error:', error)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchVenues()
    }, [fetchVenues])

    const filteredVenues = venues.filter(v => {
        const matchesSearch =
            v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            v.slug?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            v.country.toLowerCase().includes(searchTerm.toLowerCase())

        const matchesCountry = countryFilter === 'all' || v.country === countryFilter
        const matchesStatus =
            statusFilter === 'all' ||
            (statusFilter === 'claimed' && v.claimed) ||
            (statusFilter === 'unclaimed' && !v.claimed)

        return matchesSearch && matchesCountry && matchesStatus
    })

    // Stats
    const stats = {
        total: venues.length,
        claimed: venues.filter(v => v.claimed).length,
        unclaimed: venues.filter(v => !v.claimed).length,
        rwanda: venues.filter(v => v.country === 'RW').length,
        malta: venues.filter(v => v.country === 'MT').length,
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Venue Management</h1>
                    <p className="text-muted-foreground">Manage all registered venues across regions.</p>
                </div>
                <Button onClick={fetchVenues} variant="outline" size="sm" className="gap-2">
                    <RefreshCw className="h-4 w-4" /> Refresh
                </Button>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <Card className="p-3 bg-card border-border">
                    <p className="text-2xl font-bold">{stats.total}</p>
                    <p className="text-xs text-muted-foreground">Total</p>
                </Card>
                <Card className="p-3 bg-green-500/10 border-green-500/30">
                    <p className="text-2xl font-bold text-green-500">{stats.claimed}</p>
                    <p className="text-xs text-muted-foreground">Active</p>
                </Card>
                <Card className="p-3 bg-muted/50 border-border">
                    <p className="text-2xl font-bold text-muted-foreground">{stats.unclaimed}</p>
                    <p className="text-xs text-muted-foreground">Unclaimed</p>
                </Card>
                <Card className="p-3 bg-card border-border">
                    <p className="text-2xl font-bold">{stats.rwanda}</p>
                    <p className="text-xs text-muted-foreground">🇷🇼 Rwanda</p>
                </Card>
                <Card className="p-3 bg-card border-border">
                    <p className="text-2xl font-bold">{stats.malta}</p>
                    <p className="text-xs text-muted-foreground">🇲🇹 Malta</p>
                </Card>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <input
                        className="w-full bg-muted border border-border rounded-lg py-2 pl-10 pr-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                        placeholder="Search venues..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    <select
                        value={countryFilter}
                        onChange={(e) => setCountryFilter(e.target.value as 'all' | 'RW' | 'MT')}
                        className="bg-muted border border-border rounded-lg px-3 py-2 text-sm"
                    >
                        <option value="all">All Countries</option>
                        <option value="RW">Rwanda</option>
                        <option value="MT">Malta</option>
                    </select>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as 'all' | 'claimed' | 'unclaimed')}
                        className="bg-muted border border-border rounded-lg px-3 py-2 text-sm"
                    >
                        <option value="all">All Status</option>
                        <option value="claimed">Active Only</option>
                        <option value="unclaimed">Unclaimed Only</option>
                    </select>
                </div>
            </div>

            <Card className="bg-card border-border">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-muted-foreground border-b border-border bg-muted/30">
                            <tr>
                                <th className="px-6 py-3 font-medium">Venue</th>
                                <th className="px-6 py-3 font-medium">Country</th>
                                <th className="px-6 py-3 font-medium">Status</th>
                                <th className="px-6 py-3 font-medium">Owner</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <>
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <tr key={i} className="border-b border-border">
                                            <td className="px-6 py-4"><Skeleton className="h-6 w-48" /></td>
                                            <td className="px-6 py-4"><Skeleton className="h-6 w-16" /></td>
                                            <td className="px-6 py-4"><Skeleton className="h-6 w-20" /></td>
                                            <td className="px-6 py-4"><Skeleton className="h-6 w-32" /></td>
                                        </tr>
                                    ))}
                                </>
                            ) : (
                                filteredVenues.map((venue) => (
                                    <tr
                                        key={venue.id}
                                        className="border-b border-border hover:bg-muted/30 cursor-pointer transition-colors"
                                        onClick={() => setSelectedVenue(venue)}
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                                                    <Building2 className="h-4 w-4 text-primary" />
                                                </div>
                                                <div>
                                                    <div className="font-medium">{venue.name}</div>
                                                    <div className="text-xs text-muted-foreground font-mono">{venue.slug}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge variant="outline" className="text-xs">
                                                {venue.country === 'RW' ? '🇷🇼 RW' : '🇲🇹 MT'}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4">
                                            {venue.claimed ? (
                                                <div className="flex items-center gap-2">
                                                    <span className="h-2 w-2 rounded-full bg-green-500" />
                                                    <span className="text-green-500 text-sm">Active</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    <span className="h-2 w-2 rounded-full bg-muted-foreground" />
                                                    <span className="text-muted-foreground text-sm">Unclaimed</span>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-muted-foreground">
                                                {venue.contact_email || venue.owner_email || '—'}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                    {!loading && filteredVenues.length === 0 && (
                        <div className="p-8 text-center text-muted-foreground">
                            {venues.length === 0
                                ? 'No venues registered yet'
                                : `No venues found matching your filters`}
                        </div>
                    )}
                </div>
            </Card>

            {/* Result count */}
            {!loading && (
                <p className="text-center text-sm text-muted-foreground">
                    Showing {filteredVenues.length} of {venues.length} venues
                </p>
            )}

            {/* Venue Detail Sheet */}
            <VenueDetailSheet
                venue={selectedVenue}
                isOpen={!!selectedVenue}
                onClose={() => setSelectedVenue(null)}
                onRefresh={fetchVenues}
            />
        </div>
    )
}
