import { useState, useEffect, useCallback } from 'react'
import { Card, Button, Badge, Input, Skeleton, BottomSheet } from '@dinein/ui'
import { Users as UsersIcon, Search, Shield, User, Building2, RefreshCw, Ban, CheckCircle, Mail, Calendar, ChevronRight } from 'lucide-react'
import { supabase } from '../shared/services/supabase'
import { toast } from 'sonner'

interface UserProfile {
    id: string
    email: string
    role: 'admin' | 'owner' | 'customer'
    created_at: string
    is_disabled?: boolean
    venue_name?: string
    venue_id?: string
}

export default function Users() {
    const [users, setUsers] = useState<UserProfile[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [roleFilter, setRoleFilter] = useState<string>('all')
    const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null)
    const [isUpdating, setIsUpdating] = useState(false)

    const fetchUsers = useCallback(async () => {
        setLoading(true)
        try {
            // Fetch profiles with role info
            const { data: profiles, error } = await supabase
                .from('profiles')
                .select('id, email, role, created_at, is_disabled')
                .order('created_at', { ascending: false })

            if (error) {
                console.error('Error fetching users:', error)
                return
            }

            // For owners, get their venue names
            const usersWithVenues: UserProfile[] = await Promise.all(
                (profiles || []).map(async (profile: { id: string; email: string; role: string; created_at: string; is_disabled?: boolean }) => {
                    let venue_name: string | undefined
                    let venue_id: string | undefined

                    if (profile.role === 'owner') {
                        const { data: vendorUser } = await supabase
                            .from('vendor_users')
                            .select('vendor_id, vendors(name)')
                            .eq('auth_user_id', profile.id)
                            .single()

                        if (vendorUser) {
                            // Supabase returns single relation as object, not array
                            const vendors = vendorUser.vendors as { name: string } | { name: string }[] | null
                            if (vendors) {
                                if (Array.isArray(vendors) && vendors.length > 0) {
                                    venue_name = vendors[0].name
                                } else if (!Array.isArray(vendors) && typeof vendors === 'object') {
                                    venue_name = vendors.name
                                }
                            }
                            venue_id = vendorUser.vendor_id
                        }
                    }

                    return {
                        ...profile,
                        role: profile.role || 'customer',
                        venue_name,
                        venue_id
                    } as UserProfile
                })
            )

            setUsers(usersWithVenues)
        } catch (error) {
            console.error('Error:', error)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchUsers()
    }, [fetchUsers])

    const handleToggleDisabled = async (user: UserProfile) => {
        setIsUpdating(true)
        const newDisabledState = !user.is_disabled

        try {
            const { error } = await supabase
                .from('profiles')
                .update({ is_disabled: newDisabledState })
                .eq('id', user.id)

            if (error) throw error

            // Log audit event
            await supabase.functions.invoke('admin_log_action', {
                body: {
                    action: newDisabledState ? 'user_disabled' : 'user_enabled',
                    entity_type: 'user',
                    entity_id: user.id,
                    details: { email: user.email }
                }
            }).catch(() => { /* Best effort audit */ })

            toast.success(newDisabledState ? 'User disabled' : 'User enabled')
            setSelectedUser(null)
            fetchUsers()
        } catch (error) {
            console.error('Error updating user:', error)
            toast.error('Failed to update user')
        } finally {
            setIsUpdating(false)
        }
    }

    const filteredUsers = users.filter(user => {
        const matchesSearch =
            user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (user.venue_name?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)

        const matchesRole = roleFilter === 'all' || user.role === roleFilter

        return matchesSearch && matchesRole
    })

    const roleStats = {
        total: users.length,
        admins: users.filter(u => u.role === 'admin').length,
        owners: users.filter(u => u.role === 'owner').length,
        customers: users.filter(u => u.role === 'customer').length,
        disabled: users.filter(u => u.is_disabled).length,
    }

    if (loading) {
        return (
            <div className="space-y-6">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Users</h1>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24" />)}
                </div>
                <Skeleton className="h-12" />
                <div className="space-y-4">
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-20" />)}
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Users</h1>
                    <p className="text-muted-foreground">Manage user accounts and permissions.</p>
                </div>
                <Button onClick={fetchUsers} variant="outline" size="sm" className="gap-2">
                    <RefreshCw className="h-4 w-4" /> Refresh
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <Card className="p-4 bg-card border-border">
                    <div className="flex items-center gap-3">
                        <UsersIcon className="h-8 w-8 text-muted-foreground" />
                        <div>
                            <p className="text-2xl font-bold text-foreground">{roleStats.total}</p>
                            <p className="text-sm text-muted-foreground">Total</p>
                        </div>
                    </div>
                </Card>
                <Card className="p-4 bg-red-500/10 border-red-500/30">
                    <div className="flex items-center gap-3">
                        <Shield className="h-8 w-8 text-red-500" />
                        <div>
                            <p className="text-2xl font-bold text-foreground">{roleStats.admins}</p>
                            <p className="text-sm text-muted-foreground">Admins</p>
                        </div>
                    </div>
                </Card>
                <Card className="p-4 bg-blue-500/10 border-blue-500/30">
                    <div className="flex items-center gap-3">
                        <Building2 className="h-8 w-8 text-blue-500" />
                        <div>
                            <p className="text-2xl font-bold text-foreground">{roleStats.owners}</p>
                            <p className="text-sm text-muted-foreground">Owners</p>
                        </div>
                    </div>
                </Card>
                <Card className="p-4 bg-green-500/10 border-green-500/30">
                    <div className="flex items-center gap-3">
                        <User className="h-8 w-8 text-green-500" />
                        <div>
                            <p className="text-2xl font-bold text-foreground">{roleStats.customers}</p>
                            <p className="text-sm text-muted-foreground">Customers</p>
                        </div>
                    </div>
                </Card>
                {roleStats.disabled > 0 && (
                    <Card className="p-4 bg-muted/50 border-border">
                        <div className="flex items-center gap-3">
                            <Ban className="h-8 w-8 text-muted-foreground" />
                            <div>
                                <p className="text-2xl font-bold text-muted-foreground">{roleStats.disabled}</p>
                                <p className="text-sm text-muted-foreground">Disabled</p>
                            </div>
                        </div>
                    </Card>
                )}
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by email or venue..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1">
                    {['all', 'admin', 'owner', 'customer'].map(role => (
                        <Button
                            key={role}
                            variant={roleFilter === role ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setRoleFilter(role)}
                        >
                            {role.charAt(0).toUpperCase() + role.slice(1)}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Users List */}
            {filteredUsers.length === 0 ? (
                <Card className="p-12 text-center bg-card border-border">
                    <UsersIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium text-foreground">No users found</h3>
                    <p className="text-muted-foreground">Try adjusting your search or filters.</p>
                </Card>
            ) : (
                <div className="space-y-3">
                    {filteredUsers.map(user => (
                        <Card
                            key={user.id}
                            className={`p-4 bg-card border-border flex items-center gap-4 cursor-pointer hover:bg-muted/30 transition-colors ${user.is_disabled ? 'opacity-60' : ''
                                }`}
                            onClick={() => setSelectedUser(user)}
                        >
                            <div className={`h-10 w-10 rounded-full flex items-center justify-center ${user.role === 'admin'
                                ? 'bg-red-500/10'
                                : user.role === 'owner'
                                    ? 'bg-blue-500/10'
                                    : 'bg-muted'
                                }`}>
                                {user.role === 'admin' ? (
                                    <Shield className="h-5 w-5 text-red-500" />
                                ) : user.role === 'owner' ? (
                                    <Building2 className="h-5 w-5 text-blue-500" />
                                ) : (
                                    <User className="h-5 w-5 text-muted-foreground" />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <p className="text-foreground font-medium truncate">{user.email}</p>
                                    {user.is_disabled && (
                                        <Badge variant="outline" className="text-xs border-destructive/50 text-destructive">
                                            Disabled
                                        </Badge>
                                    )}
                                </div>
                                <p className="text-sm text-muted-foreground truncate">
                                    {user.venue_name ? `Owner of ${user.venue_name}` : `Joined ${new Date(user.created_at).toLocaleDateString()}`}
                                </p>
                            </div>
                            <Badge
                                variant="outline"
                                className={
                                    user.role === 'admin'
                                        ? 'border-red-500/50 text-red-500 bg-red-500/10'
                                        : user.role === 'owner'
                                            ? 'border-blue-500/50 text-blue-500 bg-blue-500/10'
                                            : 'border-border text-muted-foreground'
                                }
                            >
                                {user.role}
                            </Badge>
                            <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        </Card>
                    ))}
                </div>
            )}

            {/* User Detail Sheet */}
            {selectedUser && (
                <BottomSheet
                    isOpen={!!selectedUser}
                    onClose={() => setSelectedUser(null)}
                    title="User Details"
                >
                    <div className="space-y-6 p-4">
                        {/* User Header */}
                        <div className="flex items-start gap-4">
                            <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${selectedUser.role === 'admin'
                                ? 'bg-red-500/10'
                                : selectedUser.role === 'owner'
                                    ? 'bg-blue-500/10'
                                    : 'bg-muted'
                                }`}>
                                {selectedUser.role === 'admin' ? (
                                    <Shield className="h-7 w-7 text-red-500" />
                                ) : selectedUser.role === 'owner' ? (
                                    <Building2 className="h-7 w-7 text-blue-500" />
                                ) : (
                                    <User className="h-7 w-7 text-muted-foreground" />
                                )}
                            </div>
                            <div className="flex-1">
                                <h2 className="text-xl font-bold break-all">{selectedUser.email}</h2>
                                <div className="flex items-center gap-2 mt-1">
                                    <Badge variant="outline" className="capitalize">{selectedUser.role}</Badge>
                                    {selectedUser.is_disabled && (
                                        <Badge variant="outline" className="border-destructive/50 text-destructive">Disabled</Badge>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* User Info */}
                        <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                            <div className="flex items-center gap-3 text-sm">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <span className="break-all">{selectedUser.email}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span>Joined {new Date(selectedUser.created_at).toLocaleDateString()}</span>
                            </div>
                            {selectedUser.venue_name && (
                                <div className="flex items-center gap-3 text-sm">
                                    <Building2 className="h-4 w-4 text-muted-foreground" />
                                    <span>Owner of {selectedUser.venue_name}</span>
                                </div>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="space-y-3">
                            <Button
                                variant="outline"
                                className={`w-full justify-start ${selectedUser.is_disabled
                                    ? 'text-green-500 border-green-500/30 hover:bg-green-500/10'
                                    : 'text-destructive border-destructive/30 hover:bg-destructive/10'
                                    }`}
                                onClick={() => handleToggleDisabled(selectedUser)}
                                disabled={isUpdating || selectedUser.role === 'admin'}
                            >
                                {selectedUser.is_disabled ? (
                                    <>
                                        <CheckCircle className="h-4 w-4 mr-3" />
                                        {isUpdating ? 'Enabling...' : 'Enable User'}
                                    </>
                                ) : (
                                    <>
                                        <Ban className="h-4 w-4 mr-3" />
                                        {isUpdating ? 'Disabling...' : 'Disable User'}
                                    </>
                                )}
                            </Button>
                            {selectedUser.role === 'admin' && (
                                <p className="text-xs text-muted-foreground text-center">
                                    Admin users cannot be disabled from this interface.
                                </p>
                            )}
                        </div>
                    </div>
                </BottomSheet>
            )}
        </div>
    )
}
