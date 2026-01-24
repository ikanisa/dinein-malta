import { useState } from 'react';
import { QrCode, Plus, Download, Trash2, X } from 'lucide-react';
import { useVendorTables } from '../../hooks/useVendorTables';
import { useToast } from '../../components/Toast';

export function TableManagement() {
    const { tables, addTable, deleteTable } = useVendorTables();
    const { showToast } = useToast();
    const [showQRModal, setShowQRModal] = useState<string | null>(null);
    const [isAdding, setIsAdding] = useState(false);
    const [newTableNum, setNewTableNum] = useState('');

    const handleAdd = async () => {
        if (!newTableNum) return;
        try {
            await addTable(parseInt(newTableNum), `Table ${newTableNum}`);
            setNewTableNum('');
            setIsAdding(false);
            showToast(`Table ${newTableNum} added successfully`, 'success');
        } catch {
            showToast('Failed to add table', 'error');
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('Delete this table?')) {
            try {
                await deleteTable(id);
                showToast('Table deleted', 'success');
            } catch {
                showToast('Failed to delete table', 'error');
            }
        }
    };

    return (
        <div className="min-h-screen bg-white pb-28">
            {/* Header */}
            <div className="sticky top-0 z-30 bg-white border-b border-slate-100/80 px-6 py-4 flex items-center justify-between backdrop-blur">
                <div className="flex items-center gap-4">
                    <h1 className="text-xl font-bold tracking-tight text-slate-900">Tables</h1>
                    <div className="h-6 w-px bg-slate-200" />
                    <span className="text-sm font-medium text-slate-500">{tables.length} Total</span>
                </div>

                <button
                    onClick={() => setIsAdding(true)}
                    className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg font-bold text-sm active:scale-95 transition-transform hover:bg-slate-800"
                >
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">Add Table</span>
                </button>
            </div>


            {/* Add Table Input */}
            {isAdding && (
                <div className="px-6 mt-6 mb-4 animate-fade-in">
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-2 flex gap-2">
                        <input
                            type="number"
                            placeholder="Table Number (e.g. 5)"
                            value={newTableNum}
                            onChange={(e) => setNewTableNum(e.target.value)}
                            className="flex-1 bg-white border border-slate-200 px-3 py-2 rounded-lg outline-none focus:ring-2 ring-indigo-500/20 focus:border-indigo-500 font-medium text-sm transition-all"
                            autoFocus
                        />
                        <button
                            onClick={handleAdd}
                            className="bg-indigo-600 text-white rounded-lg font-bold text-sm px-4 shadow-sm hover:bg-indigo-700 active:scale-95 transition-all"
                        >
                            Save
                        </button>
                        <button
                            onClick={() => setIsAdding(false)}
                            className="bg-white border border-slate-200 text-slate-500 px-3 rounded-lg hover:bg-slate-50 hover:text-slate-700 active:scale-95 transition-all"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* Tables Grid */}
            <div className="px-6 mt-6">
                {tables.length === 0 && !isAdding ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">
                            <QrCode className="w-12 h-12" />
                        </div>
                        <h3 className="empty-state-title">No tables yet</h3>
                        <p className="empty-state-description">
                            Add tables to generate QR codes.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-3">
                        {tables.map((table) => {
                            return (
                                <div
                                    key={table.id}
                                    className="bg-white border border-slate-200 rounded-xl p-4 hover:border-indigo-300 transition-colors group relative"
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="w-12 h-12 bg-slate-50 rounded-lg flex items-center justify-center border border-slate-100">
                                            <span className="text-xl font-bold text-slate-900">{table.table_number}</span>
                                        </div>
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 uppercase tracking-wide">
                                            Active
                                        </span>
                                    </div>

                                    <div className="border-t border-slate-100 pt-3 flex gap-2">
                                        <button
                                            onClick={() => setShowQRModal(table.public_code)}
                                            className="flex-1 py-1.5 bg-indigo-50 text-indigo-700 rounded-md text-xs font-bold hover:bg-indigo-100 transition-colors"
                                        >
                                            QR Code
                                        </button>
                                        <button
                                            onClick={() => handleDelete(table.id)}
                                            className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-md transition-colors"
                                            title="Delete Table"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* QR Modal */}
            {showQRModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
                    <div className="bg-white rounded-[2rem] p-6 w-full max-w-sm animate-scale-in shadow-2xl">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-slate-900">Table QR Code</h2>
                            <button onClick={() => setShowQRModal(null)} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors">
                                <X className="w-5 h-5 text-slate-600" />
                            </button>
                        </div>

                        {/* QR Placeholder */}
                        <div className="bg-slate-50 rounded-3xl p-8 flex items-center justify-center mb-6 border border-slate-100">
                            {/* In real app, render actual QR code here */}
                            <div className="w-48 h-48 bg-white rounded-2xl flex items-center justify-center shadow-sm p-4">
                                <QrCode className="w-full h-full text-slate-900" />
                            </div>
                        </div>

                        <div className="mb-6 text-center">
                            <p className="text-sm text-slate-500 mb-1">Public Code</p>
                            <span className="font-mono text-lg font-bold text-slate-900 bg-slate-100 px-3 py-1 rounded-lg tracking-wider select-all">
                                {showQRModal}
                            </span>
                        </div>

                        <button className="w-full py-4 btn-primary !rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20">
                            <Download className="w-5 h-5" />
                            Download QR Code
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
