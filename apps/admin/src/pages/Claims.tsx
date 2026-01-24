import { Card, Button, Badge } from '@dinein/ui'
import { Check, X, ShieldAlert, MapPin, Building2 } from 'lucide-react'
import { useVenueClaims } from '../hooks/useVenueClaims'

export default function Claims() {
    const { unclaimedVenues, claimedVenues, loading, approveClaim, revokeClaim } = useVenueClaims()

    const formatDate = (dateStr: string) => {
        try {
            return new Date(dateStr).toLocaleDateString()
        } catch {
            return dateStr
        }
    }

    if (loading) {
        return (
            <div className="space-y-4">
                <h1 className="text-3xl font-bold tracking-tight text-white mb-6">Venue Claims</h1>
                {[1, 2, 3].map(i => <div key={i} className="h-32 bg-zinc-900 rounded-xl animate-pulse" />)}
            </div>
        )
    }

    return (
        <div className="space-y-8">
            {/* Unclaimed Venues Section */}
            <div className="space-y-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white">Unclaimed Venues</h1>
                    <p className="text-zinc-400">Venues available for ownership claims.</p>
                </div>

                {unclaimedVenues.length === 0 ? (
                    <Card className="p-12 text-center bg-zinc-900 border-zinc-800">
                        <ShieldAlert className="mx-auto h-12 w-12 text-zinc-600 mb-4" />
                        <h3 className="text-lg font-medium text-zinc-200">All venues claimed</h3>
                        <p className="text-zinc-500">Every venue has an owner.</p>
                    </Card>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {unclaimedVenues.map(venue => (
                            <Card key={venue.id} className="p-5 bg-zinc-900 border-zinc-800 text-zinc-100">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center">
                                            <Building2 className="h-5 w-5 text-zinc-500" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold">{venue.name}</h3>
                                            <div className="flex items-center gap-1 text-zinc-400 text-xs">
                                                <MapPin className="h-3 w-3" />
                                                {venue.country === 'RW' ? 'Rwanda' : 'Malta'}
                                            </div>
                                        </div>
                                    </div>
                                    <Badge variant="outline" className="border-orange-500/50 text-orange-400 bg-orange-500/10">
                                        Unclaimed
                                    </Badge>
                                </div>

                                <div className="text-xs text-zinc-500 mb-4">
                                    Added {formatDate(venue.created_at)}
                                </div>

                                <Button
                                    size="sm"
                                    className="w-full bg-green-600 hover:bg-green-700 text-white gap-2"
                                    onClick={() => approveClaim(venue.id)}
                                >
                                    <Check className="h-4 w-4" /> Mark as Claimed
                                </Button>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {/* Claimed Venues Section */}
            <div className="space-y-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-white">Claimed Venues</h2>
                    <p className="text-zinc-400">Venues with active owners.</p>
                </div>

                {claimedVenues.length === 0 ? (
                    <Card className="p-8 text-center bg-zinc-900 border-zinc-800">
                        <p className="text-zinc-500">No claimed venues yet.</p>
                    </Card>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {claimedVenues.map(venue => (
                            <Card key={venue.id} className="p-5 bg-zinc-900 border-zinc-800 text-zinc-100">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-green-900/30 flex items-center justify-center">
                                            <Check className="h-5 w-5 text-green-500" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold">{venue.name}</h3>
                                            <div className="flex items-center gap-1 text-zinc-400 text-xs">
                                                <MapPin className="h-3 w-3" />
                                                {venue.country === 'RW' ? 'Rwanda' : 'Malta'}
                                            </div>
                                        </div>
                                    </div>
                                    <Badge variant="outline" className="border-green-500/50 text-green-400 bg-green-500/10">
                                        Claimed
                                    </Badge>
                                </div>

                                <div className="text-xs text-zinc-500 mb-4">
                                    Added {formatDate(venue.created_at)}
                                </div>

                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="w-full border-red-900 text-red-400 hover:bg-red-950 hover:text-red-300 gap-2"
                                    onClick={() => revokeClaim(venue.id)}
                                >
                                    <X className="h-4 w-4" /> Revoke Claim
                                </Button>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
