import { useState, useEffect } from 'react'
import { Card, Button, Badge, Input, Skeleton } from '@dinein/ui'
import { Users as UsersIcon, Search, Shield, User, Building2 } from 'lucide-react'
import { supabase } from '../shared/services/supabase'

interface UserProfile {
    id: string
    email: string
    role: 'admin' | 'owner' | 'customer'
    created_at: string
    venue_name?: string
}

export default function Users() {
    const [users, setUsers] = useState<UserProfile[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [roleFilter, setRoleFilter] = useState<string>('all')

    useEffect(() => {
        fetchUsers()
    }, [])

    const fetchUsers = async () => {
        try {
            // Fetch profiles with role info
            const { data: profiles, error } = await supabase
                .from('profiles')
                .select('id, email, role, created_at')
                .order('created_at', { ascending: false })

            if (error) {
                console.error('Error fetching users:', error)
                return
            }

            // For owners, get their venue names
            const usersWithVenues: UserProfile[] = await Promise.all(
                (profiles || []).map(async (profile: { id: string; email: string; role: string; created_at: string }) => {
                    let venue_name: string | undefined

                    if (profile.role === 'owner') {
                        const { data: vendor } = await supabase
                            .from('vendors')
                            .select('name')
                            .eq('contact_email', profile.email)
                            .single()
                        venue_name = vendor?.name
                    }

                    return {
                        ...profile,
                        role: profile.role || 'customer',
                        venue_name
                    } as UserProfile
                })
            )

            setUsers(usersWithVenues)
        } catch (error) {
            console.error('Error:', error)
        } finally {
            setLoading(false)
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
    }

    if (loading) {
        return (
            <div className="space-y-6">
                <h1 className="text-3xl font-bold tracking-tight text-white">Users</h1>
                <div className="grid grid-cols-4 gap-4">
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
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-white">Users</h1>
                <p className="text-zinc-400">Manage user accounts and permissions.</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="p-4 bg-zinc-900 border-zinc-800">
                    <div className="flex items-center gap-3">
                        <UsersIcon className="h-8 w-8 text-zinc-400" />
                        <div>
                            <p className="text-2xl font-bold text-white">{roleStats.total}</p>
                            <p className="text-sm text-zinc-500">Total Users</p>
                        </div>
                    </div>
                </Card>
                <Card className="p-4 bg-zinc-900 border-zinc-800">
                    <div className="flex items-center gap-3">
                        <Shield className="h-8 w-8 text-red-400" />
                        <div>
                            <p className="text-2xl font-bold text-white">{roleStats.admins}</p>
                            <p className="text-sm text-zinc-500">Admins</p>
                        </div>
                    </div>
                </Card>
                <Card className="p-4 bg-zinc-900 border-zinc-800">
                    <div className="flex items-center gap-3">
                        <Building2 className="h-8 w-8 text-blue-400" />
                        <div>
                            <p className="text-2xl font-bold text-white">{roleStats.owners}</p>
                            <p className="text-sm text-zinc-500">Venue Owners</p>
                        </div>
                    </div>
                </Card>
                <Card className="p-4 bg-zinc-900 border-zinc-800">
                    <div className="flex items-center gap-3">
                        <User className="h-8 w-8 text-green-400" />
                        <div>
                            <p className="text-2xl font-bold text-white">{roleStats.customers}</p>
                            <p className="text-sm text-zinc-500">Customers</p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                    <Input
                        placeholder="Search by email or venue..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 bg-zinc-900 border-zinc-700"
                    />
                </div>
                <div className="flex gap-2">
                    {['all', 'admin', 'owner', 'customer'].map(role => (
                        <Button
                            key={role}
                            variant={roleFilter === role ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setRoleFilter(role)}
                            className={roleFilter === role ? '' : 'border-zinc-700 text-zinc-400'}
                        >
                            {role.charAt(0).toUpperCase() + role.slice(1)}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Users List */}
            {filteredUsers.length === 0 ? (
                <Card className="p-12 text-center bg-zinc-900 border-zinc-800">
                    <UsersIcon className="mx-auto h-12 w-12 text-zinc-600 mb-4" />
                    <h3 className="text-lg font-medium text-zinc-200">No users found</h3>
                    <p className="text-zinc-500">Try adjusting your search or filters.</p>
                </Card>
            ) : (
                <div className="space-y-3">
                    {filteredUsers.map(user => (
                        <Card key={user.id} className="p-4 bg-zinc-900 border-zinc-800 flex items-center gap-4">
                            <div className="h-10 w-10 rounded-full bg-zinc-800 flex items-center justify-center">
                                {user.role === 'admin' ? (
                                    <Shield className="h-5 w-5 text-red-400" />
                                ) : user.role === 'owner' ? (
                                    <Building2 className="h-5 w-5 text-blue-400" />
                                ) : (
                                    <User className="h-5 w-5 text-zinc-400" />
                                )}
                            </div>
                            <div className="flex-1">
                                <p className="text-white font-medium">{user.email}</p>
                                <p className="text-sm text-zinc-500">
                                    {user.venue_name ? `Owner of ${user.venue_name}` : `Joined ${new Date(user.created_at).toLocaleDateString()}`}
                                </p>
                            </div>
                            <Badge
                                variant="outline"
                                className={
                                    user.role === 'admin'
                                        ? 'border-red-500/50 text-red-400 bg-red-500/10'
                                        : user.role === 'owner'
                                            ? 'border-blue-500/50 text-blue-400 bg-blue-500/10'
                                            : 'border-zinc-600 text-zinc-400'
                                }
                            >
                                {user.role}
                            </Badge>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
