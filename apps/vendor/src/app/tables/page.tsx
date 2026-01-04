'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import QRCode from 'qrcode';
import jsPDF from 'jspdf';
import JSZip from 'jszip';
import { supabase } from '../../../lib/supabase';
import { getVenueByOwner, getTablesForVenue, createTablesBatch, updateTableStatus, deleteTable, regenerateTableCode, Table } from '../../../lib/database';

export default function VendorTables() {
  const router = useRouter();
  const [tables, setTables] = useState<Table[]>([]);
  const [venueId, setVenueId] = useState<string | null>(null);
  const [venue, setVenue] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [qrCodes, setQrCodes] = useState<Record<string, string>>({});
  const [modalOpen, setModalOpen] = useState(false);
  const [tableCount, setTableCount] = useState(5);
  const [startNum, setStartNum] = useState(1);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (tables.length > 0 && venueId) {
      generateQRCodes();
    }
  }, [tables, venueId]);

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      const venueData = await getVenueByOwner(user.id);
      if (!venueData) {
        router.push('/onboarding');
        return;
      }

      setVenueId(venueData.id);
      setVenue(venueData);
      const tablesData = await getTablesForVenue(venueData.id);
      setTables(tablesData);
    } catch (error) {
      console.error('Error loading tables:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateQRCodes = async () => {
    if (!venueId) return;

    const codes: Record<string, string> = {};
    for (const table of tables) {
      const url = `${window.location.origin}/#/v/${venueId}/t/${table.code}`;
      try {
        const dataUrl = await QRCode.toDataURL(url, { margin: 2, width: 300 });
        codes[table.id] = dataUrl;
      } catch (error) {
        console.error('Error generating QR:', error);
      }
    }
    setQrCodes(codes);
  };

  const handleGenerateTables = async () => {
    if (!venueId) return;

    setGenerating(true);
    try {
      await createTablesBatch(venueId, tableCount, startNum);
      await loadData();
      setModalOpen(false);
    } catch (error) {
      console.error('Error generating tables:', error);
      alert('Failed to generate tables');
    } finally {
      setGenerating(false);
    }
  };

  const handleToggleTable = async (table: Table) => {
    try {
      await updateTableStatus(table.id, !table.is_active);
      await loadData();
    } catch (error) {
      console.error('Error toggling table:', error);
    }
  };

  const handleDeleteTable = async (tableId: string) => {
    if (!confirm('Delete this table? This will invalidate its QR code.')) return;

    try {
      await deleteTable(tableId);
      await loadData();
    } catch (error) {
      console.error('Error deleting table:', error);
      alert('Failed to delete table');
    }
  };

  const handleRegenerateCode = async (tableId: string) => {
    if (!confirm('Regenerating will invalidate the old QR code. Previous prints will stop working. Continue?')) return;

    try {
      await regenerateTableCode(tableId);
      await loadData();
    } catch (error) {
      console.error('Error regenerating code:', error);
      alert('Failed to regenerate code');
    }
  };

  const handleGeneratePDF = async () => {
    if (!venue) return;

    const doc = new jsPDF();
    let x = 20, y = 20;
    const colWidth = 80;
    const rowHeight = 100;

    doc.setFontSize(24);
    doc.text('Table QR Codes', 105, 15, { align: 'center' });

    for (let i = 0; i < tables.length; i++) {
      const table = tables[i];
      const qrData = qrCodes[table.id];
      if (!qrData) continue;

      if (i > 0 && i % 4 === 0) {
        doc.addPage();
        y = 20;
        x = 20;
      } else if (i > 0 && i % 2 === 0) {
        x = 20;
        y += rowHeight;
      } else if (i > 0) {
        x += colWidth + 10;
      }

      doc.setDrawColor(200);
      doc.rect(x, y, colWidth, 90);
      doc.setFontSize(18);
      doc.text(table.label, x + colWidth / 2, y + 15, { align: 'center' });
      doc.addImage(qrData, 'PNG', x + 15, y + 20, 50, 50);
      doc.setFontSize(10);
      doc.text('Scan to Order & Pay', x + colWidth / 2, y + 80, { align: 'center' });
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(`ID: ${table.code}`, x + colWidth / 2, y + 85, { align: 'center' });
      doc.setTextColor(0);
    }

    doc.save(`${venue.name.replace(/\s+/g, '_')}_QRs.pdf`);
  };

  const handleGenerateZIP = async () => {
    if (!venue || !venueId) return;

    const zip = new JSZip();
    const folder = zip.folder('qr-codes');

    for (const table of tables) {
      const qrData = qrCodes[table.id];
      if (!qrData) continue;

      const url = `${window.location.origin}/#/v/${venueId}/t/${table.code}`;
      const dataUrl = await QRCode.toDataURL(url, { width: 1000, margin: 2 });
      const base64Data = dataUrl.split(',')[1];
      folder?.file(`${table.label}_${table.code}.png`, base64Data, { base64: true });
    }

    const blob = await zip.generateAsync({ type: 'blob' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${venue.name.replace(/\s+/g, '_')}_QR_Pack.zip`;
    link.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Tables & QR Codes</h1>
            <p className="text-gray-400">Manage tables and generate QR codes</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setModalOpen(true)}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-colors"
            >
              + Generate Tables
            </button>
            {tables.length > 0 && (
              <>
                <button
                  onClick={handleGeneratePDF}
                  className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-xl transition-colors"
                >
                  Export PDF
                </button>
                <button
                  onClick={handleGenerateZIP}
                  className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-xl transition-colors"
                >
                  Export ZIP
                </button>
              </>
            )}
          </div>
        </div>

        {/* Tables Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tables.map((table) => (
            <div
              key={table.id}
              className={`bg-white/5 border border-white/10 rounded-xl p-6 ${
                !table.is_active ? 'opacity-50' : ''
              }`}
            >
              <div className="text-center mb-4">
                <h3 className="text-xl font-bold text-white mb-2">{table.label}</h3>
                <div className="text-xs text-gray-400 font-mono mb-4">{table.code}</div>
                {qrCodes[table.id] && (
                  <div className="bg-white p-2 rounded-lg inline-block">
                    <img src={qrCodes[table.id]} alt="QR Code" className="w-32 h-32" />
                  </div>
                )}
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => handleToggleTable(table)}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${
                    table.is_active
                      ? 'bg-green-600/20 text-green-400 border border-green-500/30'
                      : 'bg-gray-600/20 text-gray-400 border border-gray-500/30'
                  }`}
                >
                  {table.is_active ? 'Active' : 'Inactive'}
                </button>
                <button
                  onClick={() => handleRegenerateCode(table.id)}
                  className="flex-1 py-2 bg-orange-600/20 hover:bg-orange-600/30 text-orange-400 border border-orange-500/30 text-xs font-bold rounded-lg transition-colors"
                >
                  Regenerate
                </button>
                <button
                  onClick={() => handleDeleteTable(table.id)}
                  className="px-3 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 text-xs font-bold rounded-lg transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {tables.length === 0 && (
          <div className="text-center text-gray-400 py-12">
            No tables yet. Generate tables to get started.
          </div>
        )}
      </div>

      {/* Generate Tables Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-6">
          <div className="bg-black border border-white/10 rounded-2xl p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold text-white mb-6">Generate Tables</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Number of Tables</label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={tableCount}
                  onChange={(e) => setTableCount(parseInt(e.target.value) || 1)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Starting Number</label>
                <input
                  type="number"
                  min="1"
                  value={startNum}
                  onChange={(e) => setStartNum(parseInt(e.target.value) || 1)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setModalOpen(false)}
                className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleGenerateTables}
                disabled={generating}
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-colors disabled:opacity-50"
              >
                {generating ? 'Generating...' : 'Generate'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
