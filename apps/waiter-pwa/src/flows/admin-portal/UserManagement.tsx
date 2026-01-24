import { useState } from 'react';
import { Search, Plus, MoreVertical, Mail, Store, Shield, UserX } from 'lucide-react';

type UserRole = 'admin' | 'vendor_admin' | 'vendor_staff';
type UserStatus = 'active' | 'inactive';

interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    vendor?: string;
    status: UserStatus;
    lastActive: string;
}

const DEMO_USERS: User[] = [
    { id: '1', name: 'Admin User', email: 'admin@dinein.rw', role: 'admin', status: 'active', lastActive: 'Just now' },
    { id: '2', name: 'Jean Pierre', email: 'jp@lapetitemaison.rw', role: 'vendor_admin', vendor: 'La Petite Maison', status: 'active', lastActive: '2 hours ago' },
    { id: '3', name: 'Marie Claire', email: 'marie@oceanbreeze.rw', role: 'vendor_staff', vendor: 'Ocean Breeze Bistro', status: 'active', lastActive: '1 day ago' },
    { id: '4', name: 'Patrick Mugabo', email: 'patrick@grillhouse.rw', role: 'vendor_admin', vendor: 'The Grill House', status: 'inactive', lastActive: '2 weeks ago' },
];

export function UserManagement() {
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');

    const filteredUsers = DEMO_USERS.filter(user => {
        if (roleFilter !== 'all' && user.role !== roleFilter) return false;
        if (searchQuery && !user.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
            !user.email.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        return true;
    });

    const getRoleConfig = (role: UserRole) => {
        switch (role) {
            case 'admin': return { color: 'bg-purple-500/20 text-purple-400', label: 'Admin', icon: Shield };
            case 'vendor_admin': return { color: 'bg-blue-500/20 text-blue-400', label: 'Vendor Admin', icon: Store };
            case 'vendor_staff': return { color: 'bg-slate-500/20 text-slate-400', label: 'Staff', icon: Store };
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 pb-28 animate-fade-in">
            {/* Header */}
            <div className="px-6 pt-6 pb-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <p className="text-slate-400 text-sm">Administration</p>
                        <h1 className="text-2xl font-bold text-white">Users</h1>
                    </div>
                    <button className="flex items-center gap-2 bg-purple-500 text-white px-4 py-2 rounded-xl font-semibold text-sm active:scale-95 transition-transform">
                        <Plus className="w-4 h-4" />
                        Invite
                    </button>
                </div>

                {/* Search */}
                <div className="flex items-center gap-3 bg-slate-800 rounded-xl px-4 py-3 border border-slate-700">
                    <Search className="w-5 h-5 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="flex-1 bg-transparent text-white placeholder:text-slate-500 outline-none"
                    />
                </div>
            </div>

            {/* Role Filter */}
            <div className="px-4">
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                    {[
                        { id: 'all' as const, label: 'All Users' },
                        { id: 'admin' as const, label: 'Admins' },
                        { id: 'vendor_admin' as const, label: 'Vendor Admins' },
                        { id: 'vendor_staff' as const, label: 'Staff' },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setRoleFilter(tab.id)}
                            className={`shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all ${roleFilter === tab.id
                                    ? 'bg-purple-500 text-white'
                                    : 'bg-slate-800 text-slate-400 border border-slate-700'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Users List */}
            <div className="px-6 mt-4 space-y-3">
                {filteredUsers.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-slate-500">No users found</p>
                    </div>
                ) : (
                    filteredUsers.map((user) => {
                        const config = getRoleConfig(user.role);
                        const Icon = config.icon;
                        return (
                            <div key={user.id} className={`bg-slate-800 rounded-2xl p-4 border border-slate-700 ${user.status === 'inactive' ? 'opacity-60' : ''
                                }`}>
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-gradient-to-br from-slate-600 to-slate-700 rounded-xl flex items-center justify-center text-white font-bold">
                                        {user.name.split(' ').map(n => n[0]).join('')}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h3 className="font-semibold text-white">{user.name}</h3>
                                                <div className="flex items-center gap-1 text-slate-400 text-xs mt-1">
                                                    <Mail className="w-3 h-3" />
                                                    <span>{user.email}</span>
                                                </div>
                                            </div>
                                            <button className="p-1 text-slate-500">
                                                <MoreVertical className="w-5 h-5" />
                                            </button>
                                        </div>

                                        <div className="flex items-center gap-3 mt-3">
                                            <span className={`px-2 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 ${config.color}`}>
                                                <Icon className="w-3 h-3" />
                                                {config.label}
                                            </span>
                                            {user.vendor && (
                                                <span className="text-slate-400 text-xs">{user.vendor}</span>
                                            )}
                                        </div>

                                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-700">
                                            <span className="text-xs text-slate-500">Last active: {user.lastActive}</span>
                                            {user.status === 'active' ? (
                                                <button className="text-xs text-red-400 flex items-center gap-1">
                                                    <UserX className="w-3 h-3" />
                                                    Deactivate
                                                </button>
                                            ) : (
                                                <span className="text-xs text-slate-500">Inactive</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
