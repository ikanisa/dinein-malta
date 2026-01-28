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
                    .from('venues')
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

        const formData = new FormData(e.currentTarget)
        const email = formData.get('email') as string
        const phone = formData.get('phone') as string
        const password = formData.get('password') as string

        if (!email || !phone || !password) return

        setSubmitting(true)
        try {
            // 1. Sign Up User
            const { error: authError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: { phone }
                }
            })

            if (authError) {
                // If user exists, we might still want to submit the claim?
                // Or tell them to login?
                if (authError.message.includes('already registered')) {
                    alert("User already registered. Please login first (if you haven't) or check your email.")
                    // Proceed to submit claim anyway? 
                    // If we proceed, we use the email.
                } else {
                    throw authError
                }
            }

            // 2. Submit Claim Request
            const { data, error } = await supabase.functions.invoke('submit_claim', {
                body: {
                    venue_id: selectedVenue.id,
                    email,
                    phone
                }
            })

            if (error) throw error
            if (!data?.success) throw new Error(data?.message || 'Submission failed')

            alert(`Account created! Please CHECK YOUR EMAIL to confirm.\n\nClaim request submitted for ${selectedVenue.name}.`)
            navigate('/login')
        } catch (error: any) {
            console.error('Error:', error)
            alert(error.message || 'An error occurred. Please try again.')
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
                        <div className="space-y-2 text-center">
                            <h2 className="text-xl font-semibold">Verify Ownership</h2>
                            <p className="text-muted-foreground text-sm">
                                Claim request for <span className="text-foreground font-bold">{selectedVenue?.name}</span>
                            </p>
                        </div>

                        <div className="space-y-4 pt-4">
                            <div className="space-y-2">
                                <label htmlFor="claim-email" className="text-sm font-medium">Business Email</label>
                                <Input
                                    id="claim-email"
                                    name="email"
                                    type="email"
                                    required
                                    placeholder="manager@venue.com"
                                    className="bg-muted/30"
                                />
                                <p className="text-xs text-muted-foreground">This will be your login email.</p>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="claim-phone" className="text-sm font-medium">Business Phone</label>
                                <Input
                                    id="claim-phone"
                                    name="phone"
                                    type="tel"
                                    required
                                    placeholder="+250 ..."
                                    className="bg-muted/30"
                                />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="claim-password" className="text-sm font-medium">Create Password</label>
                                <Input
                                    id="claim-password"
                                    name="password"
                                    type="password"
                                    required
                                    placeholder="••••••"
                                    minLength={6}
                                    className="bg-muted/30"
                                />
                                <p className="text-xs text-muted-foreground">Minimum 6 characters.</p>
                            </div>
                        </div>

                        <div className="pt-6 flex gap-3">
                            <Button type="button" variant="outline" className="flex-1" onClick={() => setStep('search')}>
                                Cancel
                            </Button>
                            <Button type="submit" className="flex-1 bg-primary text-primary-foreground shadow-glass" loading={submitting}>
                                Submit Request
                            </Button>
                        </div>
                    </form>
                )}
            </Card>
        </div>
    )
}
