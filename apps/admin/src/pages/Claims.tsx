import { Card, Button, Badge, ClaimReviewSheet, BottomSheet, ContextMenuSheet } from '@dinein/ui'
import { useState } from 'react'
import { Check, X, ShieldAlert, MapPin, Building2, Clock, Mail, Phone, MessageSquare, Eye } from 'lucide-react'
import { useVenueClaims, OnboardingRequest } from '../hooks/useVenueClaims'

type TabType = 'pending' | 'onboarding' | 'claimed'

export default function Claims() {
    const {
        unclaimedVenues,
        claimedVenues,
        pendingVenues,
        onboardingRequests,
        loading,
        approveClaim,
        rejectClaim,
        revokeClaim,
        approveOnboardingRequest,
        rejectOnboardingRequest
    } = useVenueClaims()

    const [selectedClaim, setSelectedClaim] = useState<typeof pendingVenues[0] | null>(null)
    const [selectedOnboarding, setSelectedOnboarding] = useState<OnboardingRequest | null>(null)
    const [activeTab, setActiveTab] = useState<TabType>('pending')
    const [rejectionNotes, setRejectionNotes] = useState('')

    // Count badges
    const pendingCount = pendingVenues.length
    const onboardingCount = onboardingRequests.length
    const claimedCount = claimedVenues.length

    const tabs: { id: TabType; label: string; count: number }[] = [
        { id: 'pending', label: 'Pending Claims', count: pendingCount },
        { id: 'onboarding', label: 'Onboarding Requests', count: onboardingCount },
        { id: 'claimed', label: 'Active Owners', count: claimedCount },
    ]

    if (loading) {
        return (
            <div className="space-y-4">
                <h1 className="text-3xl font-bold tracking-tight text-foreground mb-6">Claims & Onboarding</h1>
                {[1, 2, 3].map(i => <div key={i} className="h-32 bg-muted rounded-xl animate-pulse" />)}
            </div>
        )
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500" data-testid="admin-claims:page">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Claims & Onboarding</h1>
                <p className="text-muted-foreground">Review ownership requests and onboarding submissions.</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all whitespace-nowrap ${activeTab === tab.id
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                            }`}
                    >
                        {tab.label}
                        {tab.count > 0 && (
                            <Badge
                                variant="secondary"
                                className={activeTab === tab.id
                                    ? 'bg-primary-foreground/20 text-primary-foreground'
                                    : 'bg-orange-500/20 text-orange-500'
                                }
                            >
                                {tab.count}
                            </Badge>
                        )}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            {activeTab === 'pending' && (
                <div className="space-y-4">
                    {pendingVenues.length === 0 ? (
                        <Card className="p-8 text-center bg-card border-border border-dashed">
                            <ShieldAlert className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                            <p className="text-muted-foreground">No pending claims.</p>
                        </Card>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {pendingVenues.map(venue => (
                                <ContextMenuSheet
                                    key={venue.id}
                                    items={[
                                        {
                                            id: 'review',
                                            label: 'Review Claim',
                                            icon: <Eye className="h-4 w-4" />,
                                            onSelect: () => setSelectedClaim(venue),
                                        },
                                        {
                                            id: 'approve',
                                            label: 'Quick Approve',
                                            icon: <Check className="h-4 w-4" />,
                                            onSelect: () => approveClaim(venue.id),
                                        },
                                        {
                                            id: 'reject',
                                            label: 'Reject Claim',
                                            icon: <X className="h-4 w-4" />,
                                            onSelect: () => {
                                                if (confirm('Reject this claim?')) {
                                                    rejectClaim(venue.id)
                                                }
                                            },
                                            destructive: true,
                                        },
                                    ]}
                                    title={venue.name}
                                    menuButtonClassName="z-10"
                                >
                                    <Card
                                        className="p-5 bg-card border-border text-card-foreground shadow-sm hover:shadow-md transition-all border-l-4 border-l-orange-500 cursor-pointer"
                                        onClick={() => setSelectedClaim(venue)}
                                        data-testid={`admin-claims:claim-card:${venue.id}`}
                                    >
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                                                    <ShieldAlert className="h-5 w-5 text-orange-500" />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold">{venue.name}</h3>
                                                    <div className="flex items-center gap-1 text-muted-foreground text-xs">
                                                        <MapPin className="h-3 w-3" />
                                                        {venue.country === 'RW' ? 'Rwanda' : 'Malta'}
                                                    </div>
                                                </div>
                                            </div>
                                            <Badge variant="outline" className="border-orange-500/50 text-orange-500 bg-orange-500/10 mr-8">
                                                Pending
                                            </Badge>
                                        </div>

                                        <div className="text-sm bg-muted/50 p-2 rounded mb-2 space-y-1">
                                            <p className="font-medium text-xs text-muted-foreground">REQUESTED BY:</p>
                                            <p className="font-mono text-xs truncate">{venue.owner_email}</p>
                                        </div>
                                        <div className="text-center text-xs text-primary font-medium">Click to review</div>
                                    </Card>
                                </ContextMenuSheet>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'onboarding' && (
                <div className="space-y-4">
                    {onboardingRequests.length === 0 ? (
                        <Card className="p-8 text-center bg-card border-border border-dashed">
                            <Clock className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                            <p className="text-muted-foreground">No pending onboarding requests.</p>
                        </Card>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {onboardingRequests.map(request => (
                                <Card
                                    key={request.id}
                                    className="p-5 bg-card border-border text-card-foreground shadow-sm hover:shadow-md transition-all border-l-4 border-l-blue-500 cursor-pointer"
                                    onClick={() => setSelectedOnboarding(request)}
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                                <Building2 className="h-5 w-5 text-blue-500" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold">{request.vendors?.name || 'Unknown Venue'}</h3>
                                                <div className="flex items-center gap-1 text-muted-foreground text-xs">
                                                    <MapPin className="h-3 w-3" />
                                                    {request.vendors?.country === 'RW' ? 'Rwanda' : 'Malta'}
                                                </div>
                                            </div>
                                        </div>
                                        <Badge variant="outline" className="border-blue-500/50 text-blue-500 bg-blue-500/10">
                                            Onboarding
                                        </Badge>
                                    </div>

                                    <div className="text-sm bg-muted/50 p-2 rounded mb-2 space-y-1">
                                        <div className="flex items-center gap-2 text-xs">
                                            <Mail className="h-3 w-3" />
                                            <span className="truncate">{request.email}</span>
                                        </div>
                                        {request.whatsapp && (
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <Phone className="h-3 w-3" />
                                                <span>{request.whatsapp}</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="text-center text-xs text-primary font-medium">Click to review</div>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'claimed' && (
                <div className="space-y-4">
                    {claimedVenues.length === 0 ? (
                        <Card className="p-8 text-center bg-card border-border">
                            <p className="text-muted-foreground">No claimed venues yet.</p>
                        </Card>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {claimedVenues.map(venue => (
                                <Card key={venue.id} className="p-5 bg-card border-border text-card-foreground shadow-sm">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                                                <Check className="h-5 w-5 text-green-500" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold">{venue.name}</h3>
                                                <div className="flex items-center gap-1 text-muted-foreground text-xs">
                                                    <MapPin className="h-3 w-3" />
                                                    {venue.country === 'RW' ? 'Rwanda' : 'Malta'}
                                                </div>
                                            </div>
                                        </div>
                                        <Badge variant="outline" className="border-green-500/50 text-green-500 bg-green-500/10">
                                            Active
                                        </Badge>
                                    </div>

                                    <div className="text-xs text-muted-foreground mb-4">
                                        Owner Email: <span className="font-mono text-foreground">{venue.contact_email || 'N/A'}</span>
                                    </div>

                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="w-full border-destructive/50 text-destructive hover:bg-destructive/10 hover:text-destructive gap-2"
                                        onClick={() => revokeClaim(venue.id)}
                                    >
                                        <X className="h-4 w-4" /> Revoke Claim
                                    </Button>
                                </Card>
                            ))}
                        </div>
                    )}

                    {/* Also show unclaimed venues for reference */}
                    {unclaimedVenues.length > 0 && (
                        <div className="pt-6 border-t border-border">
                            <h3 className="text-lg font-semibold mb-4 text-muted-foreground">Unclaimed Venues ({unclaimedVenues.length})</h3>
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                                {unclaimedVenues.slice(0, 8).map(venue => (
                                    <Card key={venue.id} className="p-4 bg-card/50 border-border opacity-75">
                                        <div className="flex items-center gap-2">
                                            <Building2 className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-sm truncate">{venue.name}</span>
                                        </div>
                                    </Card>
                                ))}
                                {unclaimedVenues.length > 8 && (
                                    <Card className="p-4 bg-card/30 border-border border-dashed text-center">
                                        <span className="text-sm text-muted-foreground">+{unclaimedVenues.length - 8} more</span>
                                    </Card>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Claim Review Sheet */}
            {selectedClaim && (
                <ClaimReviewSheet
                    isOpen={!!selectedClaim}
                    onClose={() => setSelectedClaim(null)}
                    claimant={{
                        email: selectedClaim.owner_email || 'unknown',
                        phone: selectedClaim.owner_phone || undefined,
                        submittedAt: selectedClaim.created_at || new Date().toISOString()
                    }}
                    venue={{
                        id: selectedClaim.id,
                        name: selectedClaim.name,
                        address: selectedClaim.address || undefined,
                        slug: selectedClaim.slug || selectedClaim.id,
                    }}
                    onApprove={() => {
                        approveClaim(selectedClaim.id)
                        setSelectedClaim(null)
                    }}
                    onReject={() => {
                        rejectClaim(selectedClaim.id)
                        setSelectedClaim(null)
                    }}
                />
            )}

            {/* Onboarding Request Review Sheet */}
            {selectedOnboarding && (
                <BottomSheet
                    isOpen={!!selectedOnboarding}
                    onClose={() => {
                        setSelectedOnboarding(null)
                        setRejectionNotes('')
                    }}
                    title="Review Onboarding Request"
                >
                    <div className="space-y-6 p-4">
                        {/* Venue Info */}
                        <div className="bg-muted/50 rounded-lg p-4">
                            <h3 className="font-bold text-lg">{selectedOnboarding.vendors?.name}</h3>
                            <p className="text-sm text-muted-foreground">{selectedOnboarding.vendors?.address || 'No address'}</p>
                            <Badge variant="outline" className="mt-2">
                                {selectedOnboarding.vendors?.country === 'RW' ? 'Rwanda' : 'Malta'}
                            </Badge>
                        </div>

                        {/* Claimant Info */}
                        <div className="space-y-3">
                            <h4 className="font-medium flex items-center gap-2"><Mail className="h-4 w-4" /> Contact Info</h4>
                            <div className="grid gap-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Email</span>
                                    <span className="font-mono">{selectedOnboarding.email}</span>
                                </div>
                                {selectedOnboarding.whatsapp && (
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">WhatsApp</span>
                                        <span>{selectedOnboarding.whatsapp}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Payment Handles */}
                        {(selectedOnboarding.revolut_link || selectedOnboarding.momo_code) && (
                            <div className="space-y-3">
                                <h4 className="font-medium">Payment Methods</h4>
                                <div className="grid gap-2 text-sm">
                                    {selectedOnboarding.revolut_link && (
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Revolut</span>
                                            <span className="truncate max-w-[200px]">{selectedOnboarding.revolut_link}</span>
                                        </div>
                                    )}
                                    {selectedOnboarding.momo_code && (
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">MoMo Code</span>
                                            <span>{selectedOnboarding.momo_code}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Menu Items */}
                        {selectedOnboarding.menu_items_json && Array.isArray(selectedOnboarding.menu_items_json) && selectedOnboarding.menu_items_json.length > 0 && (
                            <div className="space-y-3">
                                <h4 className="font-medium">Proposed Menu Items ({selectedOnboarding.menu_items_json.length})</h4>
                                <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded max-h-32 overflow-y-auto">
                                    <pre>{JSON.stringify(selectedOnboarding.menu_items_json, null, 2)}</pre>
                                </div>
                            </div>
                        )}

                        {/* Rejection Notes */}
                        <div className="space-y-2">
                            <label htmlFor="rejection-notes" className="text-sm font-medium flex items-center gap-2">
                                <MessageSquare className="h-4 w-4" /> Notes (optional)
                            </label>
                            <textarea
                                id="rejection-notes"
                                value={rejectionNotes}
                                onChange={(e) => setRejectionNotes(e.target.value)}
                                placeholder="Add notes for approval or rejection..."
                                className="w-full p-3 text-sm bg-muted border border-border rounded-lg resize-none h-20"
                            />
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                className="flex-1 border-destructive/50 text-destructive hover:bg-destructive/10"
                                onClick={() => {
                                    rejectOnboardingRequest(selectedOnboarding.id, rejectionNotes || undefined)
                                    setSelectedOnboarding(null)
                                    setRejectionNotes('')
                                }}
                            >
                                <X className="h-4 w-4 mr-2" /> Reject
                            </Button>
                            <Button
                                className="flex-1"
                                onClick={() => {
                                    approveOnboardingRequest(selectedOnboarding.id, rejectionNotes || undefined)
                                    setSelectedOnboarding(null)
                                    setRejectionNotes('')
                                }}
                            >
                                <Check className="h-4 w-4 mr-2" /> Approve
                            </Button>
                        </div>
                    </div>
                </BottomSheet>
            )}
        </div>
    )
}
