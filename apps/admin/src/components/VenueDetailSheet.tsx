import { useState } from 'react'
import { BottomSheet, Button, Badge, Input } from '@dinein/ui'
import { Venue } from '@dinein/db'
import { Building2, MapPin, Mail, Phone, CreditCard, AlertTriangle, UserMinus, Save, X } from 'lucide-react'
import { supabase } from '../shared/services/supabase'
import { toast } from 'sonner'

interface VenueDetailSheetProps {
    venue: Venue | null
    isOpen: boolean
    onClose: () => void
    onRefresh: () => void
}

export function VenueDetailSheet({ venue, isOpen, onClose, onRefresh }: VenueDetailSheetProps) {
    const [isEditing, setIsEditing] = useState(false)
    const [editName, setEditName] = useState('')
    const [editSlug, setEditSlug] = useState('')
    const [isSaving, setIsSaving] = useState(false)
    const [showReassignConfirm, setShowReassignConfirm] = useState(false)
    const [newOwnerEmail, setNewOwnerEmail] = useState('')

    if (!venue) return null

    const handleEdit = () => {
        setEditName(venue.name)
        setEditSlug(venue.slug)
        setIsEditing(true)
    }

    const handleSaveEdit = async () => {
        if (!editName.trim() || !editSlug.trim()) {
            toast.error('Name and slug are required')
            return
        }

        setIsSaving(true)
        try {
            const { error } = await supabase
                .from('vendors')
                .update({
                    name: editName.trim(),
                    slug: editSlug.trim().toLowerCase().replace(/\s+/g, '-')
                })
                .eq('id', venue.id)

            if (error) throw error

            // Log audit event
            await supabase.functions.invoke('admin_log_action', {
                body: {
                    action: 'venue_edit',
                    entity_type: 'vendor',
                    entity_id: venue.id,
                    details: { old_name: venue.name, new_name: editName, old_slug: venue.slug, new_slug: editSlug }
                }
            }).catch(() => { /* Audit logging is best-effort */ })

            toast.success('Venue updated')
            setIsEditing(false)
            onRefresh()
        } catch (error) {
            console.error('Error updating venue:', error)
            toast.error('Failed to update venue')
        } finally {
            setIsSaving(false)
        }
    }

    const handleDisableVenue = async () => {
        const newStatus = venue.claimed ? false : true
        setIsSaving(true)
        try {
            const { error } = await supabase
                .from('vendors')
                .update({ claimed: newStatus })
                .eq('id', venue.id)

            if (error) throw error

            toast.success(newStatus ? 'Venue re-enabled' : 'Venue disabled')
            onRefresh()
            onClose()
        } catch (error) {
            console.error('Error toggling venue status:', error)
            toast.error('Failed to update venue status')
        } finally {
            setIsSaving(false)
        }
    }

    const handleReassignOwner = async () => {
        if (!newOwnerEmail.trim()) {
            toast.error('New owner email is required')
            return
        }

        setIsSaving(true)
        try {
            // Try to find the user by email
            const { data: existingUser, error: lookupError } = await supabase
                .from('profiles')
                .select('id, email')
                .ilike('email', newOwnerEmail.trim())
                .maybeSingle()

            if (lookupError) throw lookupError

            if (!existingUser) {
                toast.error('User not found. They must sign up first.')
                setIsSaving(false)
                return
            }

            // Update venue owner
            const { error: updateError } = await supabase
                .from('vendors')
                .update({
                    owner_id: existingUser.id,
                    contact_email: existingUser.email
                })
                .eq('id', venue.id)

            if (updateError) throw updateError

            // Update vendor_users if exists, or insert
            const { data: existingLink } = await supabase
                .from('vendor_users')
                .select('id')
                .eq('vendor_id', venue.id)
                .eq('auth_user_id', existingUser.id)
                .maybeSingle()

            if (!existingLink) {
                await supabase.from('vendor_users').insert({
                    vendor_id: venue.id,
                    auth_user_id: existingUser.id,
                    role: 'owner',
                    is_active: true
                })
            }

            toast.success('Owner reassigned successfully')
            setShowReassignConfirm(false)
            setNewOwnerEmail('')
            onRefresh()
            onClose()
        } catch (error) {
            console.error('Error reassigning owner:', error)
            toast.error('Failed to reassign owner')
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <BottomSheet
            isOpen={isOpen}
            onClose={() => {
                setIsEditing(false)
                setShowReassignConfirm(false)
                onClose()
            }}
            title={isEditing ? 'Edit Venue' : 'Venue Details'}
        >
            <div className="space-y-6 p-4">
                {/* Venue Header */}
                <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Building2 className="h-7 w-7 text-primary" />
                    </div>
                    <div className="flex-1">
                        {isEditing ? (
                            <div className="space-y-3">
                                <div>
                                    <label htmlFor="edit-name" className="text-xs text-muted-foreground">Name</label>
                                    <Input
                                        id="edit-name"
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        placeholder="Venue name"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="edit-slug" className="text-xs text-muted-foreground">Slug</label>
                                    <Input
                                        id="edit-slug"
                                        value={editSlug}
                                        onChange={(e) => setEditSlug(e.target.value)}
                                        placeholder="venue-slug"
                                    />
                                </div>
                            </div>
                        ) : (
                            <>
                                <h2 className="text-xl font-bold">{venue.name}</h2>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <MapPin className="h-4 w-4" />
                                    <span>{venue.address || venue.city || 'No address'}</span>
                                </div>
                                <div className="flex items-center gap-2 mt-2">
                                    <Badge variant="outline">{venue.country === 'RW' ? 'Rwanda' : 'Malta'}</Badge>
                                    <Badge variant={venue.claimed ? 'default' : 'secondary'}>
                                        {venue.claimed ? 'Active' : 'Inactive'}
                                    </Badge>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Venue Info */}
                {!isEditing && (
                    <div className="space-y-4 bg-muted/30 rounded-lg p-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="text-muted-foreground">Slug</span>
                                <p className="font-mono">{venue.slug}</p>
                            </div>
                            <div>
                                <span className="text-muted-foreground">ID</span>
                                <p className="font-mono text-xs truncate">{venue.id}</p>
                            </div>
                        </div>

                        {/* Contact Info */}
                        {(venue.contact_email || venue.phone || venue.whatsapp) && (
                            <div className="border-t border-border pt-4 space-y-2">
                                {venue.contact_email && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <Mail className="h-4 w-4 text-muted-foreground" />
                                        <span>{venue.contact_email}</span>
                                    </div>
                                )}
                                {venue.phone && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <Phone className="h-4 w-4 text-muted-foreground" />
                                        <span>{venue.phone}</span>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Payment Handles (readonly) */}
                        {(venue.revolut_link || venue.whatsapp) && (
                            <div className="border-t border-border pt-4 space-y-2">
                                <h4 className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                                    <CreditCard className="h-3 w-3" /> Payment Methods
                                </h4>
                                {venue.revolut_link && (
                                    <div className="text-sm">
                                        <span className="text-muted-foreground">Revolut:</span>{' '}
                                        <span className="truncate">{venue.revolut_link}</span>
                                    </div>
                                )}
                                {venue.whatsapp && venue.country === 'RW' && (
                                    <div className="text-sm">
                                        <span className="text-muted-foreground">MoMo (WhatsApp):</span>{' '}
                                        <span>{venue.whatsapp}</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Reassign Owner Confirmation */}
                {showReassignConfirm && (
                    <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 space-y-4">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                            <div>
                                <h4 className="font-medium text-destructive">Reassign Owner</h4>
                                <p className="text-sm text-muted-foreground">
                                    This will transfer ownership of this venue to another user. The new user must already have an account.
                                </p>
                            </div>
                        </div>
                        <div>
                            <label htmlFor="new-owner-email" className="text-xs text-muted-foreground">New Owner Email</label>
                            <Input
                                id="new-owner-email"
                                type="email"
                                value={newOwnerEmail}
                                onChange={(e) => setNewOwnerEmail(e.target.value)}
                                placeholder="newowner@example.com"
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                className="flex-1"
                                onClick={() => setShowReassignConfirm(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="destructive"
                                size="sm"
                                className="flex-1"
                                onClick={handleReassignOwner}
                                disabled={isSaving}
                            >
                                {isSaving ? 'Reassigning...' : 'Confirm Reassign'}
                            </Button>
                        </div>
                    </div>
                )}

                {/* Actions */}
                {!showReassignConfirm && (
                    <div className="space-y-3">
                        {isEditing ? (
                            <div className="flex gap-3">
                                <Button
                                    variant="outline"
                                    className="flex-1"
                                    onClick={() => setIsEditing(false)}
                                >
                                    <X className="h-4 w-4 mr-2" /> Cancel
                                </Button>
                                <Button
                                    className="flex-1"
                                    onClick={handleSaveEdit}
                                    disabled={isSaving}
                                >
                                    <Save className="h-4 w-4 mr-2" /> {isSaving ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </div>
                        ) : (
                            <>
                                <Button
                                    variant="outline"
                                    className="w-full justify-start"
                                    onClick={handleEdit}
                                >
                                    <Building2 className="h-4 w-4 mr-3" /> Edit Name & Slug
                                </Button>

                                {venue.claimed && (
                                    <Button
                                        variant="outline"
                                        className="w-full justify-start text-orange-500 border-orange-500/30 hover:bg-orange-500/10"
                                        onClick={() => setShowReassignConfirm(true)}
                                    >
                                        <UserMinus className="h-4 w-4 mr-3" /> Reassign Owner
                                    </Button>
                                )}

                                <Button
                                    variant="outline"
                                    className={`w-full justify-start ${venue.claimed
                                            ? 'text-destructive border-destructive/30 hover:bg-destructive/10'
                                            : 'text-green-500 border-green-500/30 hover:bg-green-500/10'
                                        }`}
                                    onClick={handleDisableVenue}
                                    disabled={isSaving}
                                >
                                    {venue.claimed ? (
                                        <>
                                            <AlertTriangle className="h-4 w-4 mr-3" /> Disable Venue
                                        </>
                                    ) : (
                                        <>
                                            <Building2 className="h-4 w-4 mr-3" /> Re-enable Venue
                                        </>
                                    )}
                                </Button>
                            </>
                        )}
                    </div>
                )}
            </div>
        </BottomSheet>
    )
}
