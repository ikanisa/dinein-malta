import React from 'react';
import { Table } from '../../../types';
import { Order } from '../../../types';

interface TableStatusProps {
  tables: Table[];
  orders: Order[];
  className?: string;
  onTableClick?: (table: Table) => void;
}

export const TableStatus: React.FC<TableStatusProps> = ({
  tables,
  orders,
  className = '',
  onTableClick,
}) => {
  const getTableStatus = (table: Table): 'available' | 'occupied' | 'has-order' => {
    // Find active orders for this table
    const tableOrders = orders.filter(
      (order) =>
        order.tableNumber === table.label ||
        order.tableNumber === table.code ||
        order.tableNumber === table.id
    );

    if (tableOrders.length === 0) {
      return 'available';
    }

    // Check if any order is new or preparing (has active order)
    const hasActiveOrder = tableOrders.some(
      (order) =>
        order.status === 'NEW' ||
        order.status === 'PREPARING' ||
        order.status === 'READY' ||
        order.status === 'RECEIVED' // Legacy
    );

    return hasActiveOrder ? 'has-order' : 'occupied';
  };

  const getStatusColor = (status: 'available' | 'occupied' | 'has-order'): string => {
    switch (status) {
      case 'available':
        return 'bg-green-500/20 border-green-500 text-green-500';
      case 'occupied':
        return 'bg-gray-500/20 border-gray-500 text-gray-500';
      case 'has-order':
        return 'bg-yellow-500/20 border-yellow-500 text-yellow-500';
      default:
        return 'bg-gray-500/20 border-gray-500 text-gray-500';
    }
  };

  const getStatusIcon = (status: 'available' | 'occupied' | 'has-order'): string => {
    switch (status) {
      case 'available':
        return '🟢';
      case 'occupied':
        return '🔴';
      case 'has-order':
        return '🟡';
      default:
        return '⚪';
    }
  };

  const getStatusLabel = (status: 'available' | 'occupied' | 'has-order'): string => {
    switch (status) {
      case 'available':
        return 'Available';
      case 'occupied':
        return 'Occupied';
      case 'has-order':
        return 'Has Order';
      default:
        return 'Unknown';
    }
  };

  if (tables.length === 0) {
    return (
      <div className={`text-center text-muted py-8 ${className}`}>
        No tables configured
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-3">
        Tables Status
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {tables.map((table) => {
          const status = getTableStatus(table);
          const statusColor = getStatusColor(status);
          const statusIcon = getStatusIcon(status);
          const statusLabel = getStatusLabel(status);

          return (
            <button
              key={table.id}
              onClick={() => onTableClick?.(table)}
              className={`p-4 rounded-xl border-2 ${statusColor} transition-all hover:scale-105 touch-target min-h-[80px] flex flex-col items-center justify-center gap-2`}
              aria-label={`Table ${table.label || table.code}: ${statusLabel}`}
            >
              <span className="text-2xl">{statusIcon}</span>
              <div className="text-sm font-bold">{table.label || table.code}</div>
              <div className="text-xs opacity-75">{statusLabel}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
