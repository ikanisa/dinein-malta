import { useState, useMemo } from 'react';
import { Search, Plus, Edit, Trash2, ToggleLeft, ToggleRight, X, Loader2 } from 'lucide-react';
import { useVendorMenu } from '../../hooks/useVendorMenu';
import { EmptyState } from '@/components/ui/EmptyState';

const CATEGORIES_LIST = [
    { id: 'all', name: 'All Items' },
    { id: 'starters', name: 'Starters' },
    { id: 'mains', name: 'Mains' },
    { id: 'desserts', name: 'Desserts' },
    { id: 'drinks', name: 'Drinks' },
];

const getGradient = (name: string) => {
    const gradients = [
        'bg-gradient-to-br from-violet-500 to-fuchsia-500',
        'bg-gradient-to-br from-indigo-500 to-blue-500',
        'bg-gradient-to-br from-emerald-400 to-cyan-500',
        'bg-gradient-to-br from-amber-400 to-orange-500',
        'bg-gradient-to-br from-rose-400 to-pink-500',
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return gradients[Math.abs(hash) % gradients.length];
};

export function MenuManagement() {
    const { items, loading, error, toggleAvailability, deleteItem, addItem } = useVendorMenu();
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);

    // Form State
    const [newItemName, setNewItemName] = useState('');
    const [newItemPrice, setNewItemPrice] = useState('');
    const [newItemCategory, setNewItemCategory] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Compute categories with counts
    const categories = useMemo(() => {
        return CATEGORIES_LIST.map(cat => ({
            ...cat,
            count: cat.id === 'all'
                ? items.length
                : items.filter(i => i.category === cat.id).length
        }));
    }, [items]);

    const filteredItems = items.filter(item => {
        if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
        if (searchQuery && !item.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        return true;
    });

    const handleAddItem = async () => {
        if (!newItemName || !newItemPrice || !newItemCategory) return;
        setIsSubmitting(true);
        try {
            await addItem({
                name: newItemName,
                price: parseFloat(newItemPrice),
                category: newItemCategory
            });
            setShowAddModal(false);
            // Reset form
            setNewItemName('');
            setNewItemPrice('');
            setNewItemCategory('');
            setNewItemPrice('');
            setNewItemCategory('');
        } catch {
            alert('Failed to add item');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-28 animate-fade-in font-sans">
            {/* Sticky Glass Header */}
            <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 shadow-sm">
                <div className="px-6 py-4 flex items-center justify-between">
                    <h1 className="text-xl font-bold text-slate-900 leading-tight">Menu</h1>
                    <button
                        onClick={() => setShowAddModal(true)}
                        disabled={loading}
                        className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl font-bold text-xs shadow-lg shadow-slate-900/10 active:scale-95 transition-all disabled:opacity-50"
                    >
                        <Plus className="w-4 h-4" />
                        Add Item
                    </button>
                </div>

                {/* Search */}
                <div className="px-6 pb-4">
                    <div className="flex items-center gap-3 bg-slate-100 hover:bg-white transition-colors border border-transparent hover:border-indigo-100 rounded-xl px-4 py-3 group focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:bg-white focus-within:border-indigo-100">
                        <Search className="w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search menu items..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="flex-1 bg-transparent text-slate-900 placeholder:text-slate-400 outline-none text-sm font-medium"
                        />
                    </div>
                </div>

                {/* Categories */}
                <div className="px-6 pb-0 overflow-x-auto no-scrollbar">
                    <div className="flex gap-2 pb-4">
                        {categories.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setSelectedCategory(cat.id)}
                                className={`shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-all ${selectedCategory === cat.id
                                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 scale-105'
                                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                                    }`}
                            >
                                {cat.name}
                                <span className={`ml-1.5 ${selectedCategory === cat.id ? 'text-indigo-200' : 'text-slate-400'}`}>
                                    {cat.count}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Menu Items */}
            <div className="px-6 mt-6 space-y-3">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                        <Loader2 className="w-8 h-8 animate-spin mb-2 text-indigo-500" />
                        <p className="text-sm font-medium">Loading menu...</p>
                    </div>
                ) : error ? (
                    <div className="p-6 text-center text-rose-500 bg-rose-50 rounded-2xl border border-rose-100">
                        <p className="font-medium text-sm">{error}</p>
                    </div>
                ) : filteredItems.length === 0 ? (
                    <EmptyState
                        variant="no-results"
                        title="No items found"
                        description="Try adjusting your search or category filter."
                    />
                ) : (
                    filteredItems.map((item, idx) => (
                        <div
                            key={item.id}
                            className={`bg-white rounded-2xl p-3 shadow-sm border border-slate-100 flex items-center gap-4 group animate-fade-in-up transition-all ${!item.is_available ? 'opacity-60 grayscale-[0.5]' : 'hover:border-indigo-100 duration-300'}`}
                            style={{ animationDelay: `${idx * 50}ms` }}
                        >
                            {/* Image / Placeholder */}
                            <div className={`w-20 h-20 shrink-0 ${getGradient(item.name)} rounded-xl flex items-center justify-center text-3xl shadow-inner relative overflow-hidden`}>
                                <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <span className="relative transform group-hover:scale-110 transition-transform duration-300 drop-shadow-md">
                                    {item.emoji || item.name[0]}
                                </span>
                            </div>

                            <div className="flex-1 min-w-0 py-1">
                                <div className="flex flex-col h-full justify-between">
                                    <div>
                                        <h3 className="font-bold text-slate-900 truncate text-base mb-1">{item.name}</h3>
                                        <p className="text-xs font-medium text-slate-500 bg-slate-100 inline-block px-2 py-0.5 rounded-md truncate max-w-full">
                                            {CATEGORIES_LIST.find(c => c.id === item.category)?.name || item.category}
                                        </p>
                                    </div>
                                    <p className="text-slate-900 font-bold mt-2">
                                        €{item.price.toFixed(2)}
                                    </p>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col gap-2 shrink-0">
                                <button
                                    onClick={() => toggleAvailability(item.id, item.is_available)}
                                    className={`p-2 rounded-xl transition-all active:scale-95 shadow-sm border ${item.is_available
                                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100'
                                        : 'bg-slate-50 text-slate-400 border-slate-100 hover:bg-slate-100'}`}
                                    title={item.is_available ? "Mark as unavailable" : "Mark as available"}
                                >
                                    {item.is_available ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                                </button>
                                <div className="flex gap-2">
                                    <button className="p-[7px] text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors border border-transparent hover:border-indigo-100">
                                        <Edit className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => deleteItem(item.id)}
                                        className="p-[7px] text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-100"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Add Item Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
                    <div className="bg-white w-full sm:max-w-md sm:rounded-3xl rounded-t-[2.5rem] p-6 animate-slide-up shadow-2xl">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-slate-900">Add New Item</h2>
                            <button onClick={() => setShowAddModal(false)} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors">
                                <X className="w-5 h-5 text-slate-600" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-slate-500 ml-1 mb-1.5 block uppercase tracking-wide">Item Name</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Truffle Burger"
                                    value={newItemName}
                                    onChange={e => setNewItemName(e.target.value)}
                                    className="w-full bg-slate-50 rounded-xl px-4 py-3.5 border border-slate-100 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 font-medium transition-all"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 ml-1 mb-1.5 block uppercase tracking-wide">Price (€)</label>
                                <input
                                    type="number"
                                    placeholder="0.00"
                                    value={newItemPrice}
                                    onChange={e => setNewItemPrice(e.target.value)}
                                    className="w-full bg-slate-50 rounded-xl px-4 py-3.5 border border-slate-100 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 font-medium transition-all"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 ml-1 mb-1.5 block uppercase tracking-wide">Category</label>
                                <div className="relative">
                                    <select
                                        value={newItemCategory}
                                        onChange={e => setNewItemCategory(e.target.value)}
                                        className="w-full bg-slate-50 rounded-xl px-4 py-3.5 border border-slate-100 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 font-medium appearance-none transition-all"
                                    >
                                        <option value="">Select Category</option>
                                        {CATEGORIES_LIST.filter(c => c.id !== 'all').map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={handleAddItem}
                                disabled={isSubmitting}
                                className="w-full py-4 mt-2 bg-slate-900 text-white font-bold rounded-2xl text-base shadow-lg shadow-slate-900/20 active:scale-[0.98] transition-all disabled:opacity-50 hover:bg-slate-800"
                            >
                                {isSubmitting ? 'Adding...' : 'Add Item'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}


