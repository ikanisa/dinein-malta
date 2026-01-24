import { useState } from 'react';
import { Search, Plus, MoreVertical, MapPin, Star, Check, X, Eye } from 'lucide-react';

type VendorStatus = 'active' | 'pending' | 'inactive';

interface Vendor {
    id: string;
    name: string;
    emoji: string;
    location: string;
    rating: number;
    orders: number;
    status: VendorStatus;
    createdAt: string;
}

const DEMO_VENDORS: Vendor[] = [
    { id: '1', name: 'La Petite Maison', emoji: '🍽️', location: 'Kigali Downtown', rating: 4.8, orders: 1247, status: 'active', createdAt: 'Jan 2025' },
    { id: '2', name: 'Ocean Breeze Bistro', emoji: '🌊', location: 'Nyamirambo', rating: 4.6, orders: 856, status: 'active', createdAt: 'Feb 2025' },
    { id: '3', name: 'Sunrise Café', emoji: '☕', location: 'Kimironko', rating: 0, orders: 0, status: 'pending', createdAt: 'Jan 2026' },
    { id: '4', name: 'Mountain View Restaurant', emoji: '🏔️', location: 'Musanze', rating: 0, orders: 0, status: 'pending', createdAt: 'Jan 2026' },
    { id: '5', name: 'The Grill House', emoji: '🥩', location: 'Remera', rating: 4.2, orders: 423, status: 'inactive', createdAt: 'Dec 2024' },
];

const TABS: { id: VendorStatus | 'all'; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'active', label: 'Active' },
    { id: 'pending', label: 'Pending' },
    { id: 'inactive', label: 'Inactive' },
];

export function VendorManagement() {
    const [activeTab, setActiveTab] = useState<VendorStatus | 'all'>('all');
    const [searchQuery, setSearchQuery] = useState('');

    const filteredVendors = DEMO_VENDORS.filter(vendor => {
        if (activeTab !== 'all' && vendor.status !== activeTab) return false;
        if (searchQuery && !vendor.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        return true;
    });

    const getStatusConfig = (status: VendorStatus) => {
        switch (status) {
            case 'active': return { color: 'bg-emerald-500/20 text-emerald-400', label: 'Active' };
            case 'pending': return { color: 'bg-amber-500/20 text-amber-400', label: 'Pending' };
            case 'inactive': return { color: 'bg-slate-500/20 text-slate-400', label: 'Inactive' };
        }
    };

    const pendingCount = DEMO_VENDORS.filter(v => v.status === 'pending').length;

    return (
        <div className="min-h-screen bg-white dark:bg-slate-900 pb-28 animate-fade-in">
            {/* Header */}
            <div className="sticky top-0 z-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 px-6 pt-6 pb-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Administration</p>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Vendors</h1>
                    </div>
                    <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl font-semibold text-sm active:scale-95 transition-all shadow-lg shadow-indigo-500/20">
                        <Plus className="w-4 h-4" />
                        Add
                    </button>
                </div>

                {/* Search */}
                <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-3 border border-slate-200 dark:border-slate-700 transition-colors focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500">
                    <Search className="w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search vendors..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="flex-1 bg-transparent text-slate-900 dark:text-white placeholder:text-slate-400 outline-none"
                    />
                </div>
            </div>

            {/* Tabs */}
            <div className="px-4 mt-4">
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                    {TABS.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === tab.id
                                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                                }`}
                        >
                            {tab.label}
                            {tab.id === 'pending' && pendingCount > 0 && (
                                <span className={`ml-1 px-1.5 py-0.5 text-[10px] rounded-full ${activeTab === tab.id ? 'bg-indigo-500/40 text-white' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400'}`}>
                                    {pendingCount}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Vendors List */}
            <div className="px-4 mt-4 space-y-3">
                {filteredVendors.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-slate-400 dark:text-slate-500">No vendors found</p>
                    </div>
                ) : (
                    filteredVendors.map((vendor) => {
                        const config = getStatusConfig(vendor.status);
                        return (
                            <div key={vendor.id} className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-all">
                                <div className="flex items-start gap-4">
                                    <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-2xl shadow-inner">
                                        {vendor.emoji}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h3 className="font-bold text-slate-900 dark:text-white text-base">{vendor.name}</h3>
                                                <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 text-xs mt-1">
                                                    <MapPin className="w-3 h-3" />
                                                    <span>{vendor.location}</span>
                                                </div>
                                            </div>
                                            <button className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                                                <MoreVertical className="w-5 h-5" />
                                            </button>
                                        </div>

                                        <div className="flex items-center gap-3 mt-3">
                                            <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${config.color} uppercase tracking-wider`}>
                                                {config.label}
                                            </span>
                                            {vendor.rating > 0 && (
                                                <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 text-xs font-medium">
                                                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                                    <span>{vendor.rating}</span>
                                                </div>
                                            )}
                                            {vendor.orders > 0 && (
                                                <span className="text-slate-400 dark:text-slate-500 text-xs font-medium">{vendor.orders} orders</span>
                                            )}
                                        </div>

                                        {vendor.status === 'pending' && (
                                            <div className="flex gap-3 mt-4 pt-3 border-t border-slate-50 dark:border-slate-700/50">
                                                <button className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all">
                                                    <Check className="w-3.5 h-3.5" />
                                                    Approve
                                                </button>
                                                <button className="flex-1 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-slate-50 dark:hover:bg-slate-600 active:scale-95 transition-all">
                                                    <Eye className="w-3.5 h-3.5" />
                                                    Review
                                                </button>
                                                <button className="py-2 px-3 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/30 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors">
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        )}
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
