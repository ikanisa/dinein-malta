import React from 'react';
import { GlassCard } from '../GlassCard';
import { Table } from '../../types';

interface VendorTablesTabProps {
  tables: Table[];
  qrCodes: Record<string, string>;
  onToggleTable: (table: Table) => Promise<void> | void;
}

export const VendorTablesTab: React.FC<VendorTablesTabProps> = ({
  tables,
  qrCodes,
  onToggleTable,
}) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {tables.map((table) => (
        <GlassCard
          key={table.id}
          className="relative group overflow-hidden border-t-4 border-t-primary-500 bg-surface"
        >
          <div className="flex justify-between items-start mb-2">
            <span className="font-bold text-lg text-foreground">{table.label}</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onToggleTable(table)}
                className={`w-2 h-2 rounded-full ${
                  table.active
                    ? 'bg-green-500 shadow-[0_0_8px_#22c55e]'
                    : 'bg-red-500'
                }`}
                title="Toggle Active"
              />
            </div>
          </div>
          <div className="bg-white p-2 rounded-lg mb-3 flex items-center justify-center aspect-square">
            {qrCodes[table.id] ? (
              <img
                src={qrCodes[table.id]}
                alt="QR"
                className={`w-full h-full object-contain ${
                  !table.active ? 'opacity-20 grayscale' : ''
                }`}
              />
            ) : (
              <div className="w-full h-full bg-gray-100 animate-pulse" />
            )}
          </div>
          <div className="bg-surface-highlight rounded p-2 text-center mb-2">
            <div className="font-mono text-xs font-bold text-secondary-600 tracking-wider">
              {table.code}
            </div>
          </div>
        </GlassCard>
      ))}
    </div>
  );
};
