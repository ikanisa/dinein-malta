import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Search, Building2, MapPin, Loader2 } from 'lucide-react'
import { Button, Input, Card } from '@dinein/ui'
import { useState, useEffect } from 'react'
import { supabase } from '../shared/services/supabase'

interface VenueResult {
    id: string
    name: string
    address?: string
    country: string
}

export default function Claim() {
    const [query, setQuery] = useState('')
    const [step, setStep] = useState<'search' | 'verify'>('search')
    const [selectedVenue, setSelectedVenue] = useState<VenueResult | null>(null)
    const [results, setResults] = useState<VenueResult[]>([])
    const [searching, setSearching] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const navigate = useNavigate()

    // Debounced search
    useEffect(() => {
        if (query.length < 3) {
            setResults([])
            return
        }

        const timeout = setTimeout(async () => {
            setSearching(true)
            try {
                const { data, error } = await supabase
                    .from('vendors')
                    .select('id, name, address, country')
                    .ilike('name', `%${query}%`)
                    .eq('claimed', false)
                    .limit(10)

                if (error) {
                    console.error('Search error:', error)
                    return
                }

                setResults((data || []) as VenueResult[])
            } catch (error) {
                console.error('Error:', error)
            } finally {
                setSearching(false)
            }
        }, 300)

        return () => clearTimeout(timeout)
    }, [query])

    const handleClaim = (venue: VenueResult) => {
        setSelectedVenue(venue)
        setStep('verify')
    }

    const handleSubmitClaim = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!selectedVenue) return

        setSubmitting(true)
        try {
            // Update vendors.claimed to true
            const { error } = await supabase
                .from('vendors')
                .update({ claimed: true })
                .eq('id', selectedVenue.id)

            if (error) {
                console.error('Claim error:', error)
                alert('Failed to claim venue. Please try again.')
                return
            }

            alert(`Successfully claimed ${selectedVenue.name}! You are now the owner.`)
            navigate('/dashboard')
        } catch (error) {
            console.error('Error:', error)
            alert('An error occurred. Please try again.')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="min-h-screen bg-background p-4 flex flex-col items-center">
            <header className="w-full max-w-md mb-8 flex items-center">
                <Link to="/">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <h1 className="ml-2 text-xl font-bold">Claim Venue</h1>
            </header>

            <Card className="w-full max-w-md p-6">
                {step === 'search' ? (
                    <>
                        <h2 className="text-lg font-semibold mb-2">Find your business</h2>
                        <p className="text-sm text-muted-foreground mb-6">
                            Search for your venue to claim ownership.
                        </p>

                        <div className="relative mb-6">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Venue name..."
                                className="pl-9"
                                value={query}
                                onChange={e => setQuery(e.target.value)}
                            />
                            {searching && (
                                <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-muted-foreground" />
                            )}
                        </div>

                        <div className="space-y-2">
                            {results.map(venue => (
                                <div key={venue.id} className="flex items-center justify-between p-3 rounded-lg border bg-muted/20">
                                    <div>
                                        <div className="font-medium">{venue.name}</div>
                                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                                            <MapPin className="h-3 w-3" />
                                            {venue.address || venue.country}
                                        </div>
                                    </div>
                                    <Button size="sm" variant="secondary" onClick={() => handleClaim(venue)}>
                                        Claim
                                    </Button>
                                </div>
                            ))}
                            {query.length > 2 && !searching && results.length === 0 && (
                                <div className="text-center py-8 text-muted-foreground">
                                    <Building2 className="mx-auto h-8 w-8 mb-2 opacity-50" />
                                    No venues found. <br />
                                    <Button variant="link" className="mt-2">Register new venue</Button>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <form onSubmit={handleSubmitClaim} className="space-y-4">
                        <h2 className="text-lg font-semibold">Verify Ownership</h2>
                        <p className="text-sm text-muted-foreground">
                            To claim <strong>{selectedVenue?.name}</strong>, please provide your business details.
                        </p>

                        <div className="space-y-2">
                            <label htmlFor="claim-email" className="text-sm font-medium">Business Email</label>
                            <Input id="claim-email" name="email" type="email" required placeholder="manager@venue.com" />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="claim-phone" className="text-sm font-medium">Business Phone</label>
                            <Input id="claim-phone" name="phone" type="tel" required placeholder="+250 ..." />
                        </div>

                        <div className="pt-4 flex gap-2">
                            <Button type="button" variant="outline" className="flex-1" onClick={() => setStep('search')}>
                                Cancel
                            </Button>
                            <Button type="submit" className="flex-1" disabled={submitting}>
                                {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                Submit Claim
                            </Button>
                        </div>
                    </form>
                )}
            </Card>
        </div>
    )
}
