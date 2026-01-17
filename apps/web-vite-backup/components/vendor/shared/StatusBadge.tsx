import React from 'react';
import { OrderStatus } from '../../../types';

interface StatusBadgeProps {
  status: OrderStatus;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const config = {
    [OrderStatus.NEW]: {
      icon: '🔴',
      label: 'NEW',
      colorClass: 'bg-red-500 text-white border-red-600',
      bgClass: 'bg-red-500/10'
    },
    [OrderStatus.PREPARING]: {
      icon: '🟡',
      label: 'PREPARING',
      colorClass: 'bg-yellow-500 text-white border-yellow-600',
      bgClass: 'bg-yellow-500/10'
    },
    [OrderStatus.READY]: {
      icon: '🟢',
      label: 'READY',
      colorClass: 'bg-green-500 text-white border-green-600',
      bgClass: 'bg-green-500/10'
    },
    [OrderStatus.COMPLETED]: {
      icon: '✓',
      label: 'COMPLETED',
      colorClass: 'bg-gray-500 text-white border-gray-600',
      bgClass: 'bg-gray-500/10'
    },
    [OrderStatus.CANCELLED]: {
      icon: '✕',
      label: 'CANCELLED',
      colorClass: 'bg-red-600 text-white border-red-700',
      bgClass: 'bg-red-600/10'
    },
    // Legacy support
    [OrderStatus.RECEIVED]: {
      icon: '🔴',
      label: 'NEW',
      colorClass: 'bg-red-500 text-white border-red-600',
      bgClass: 'bg-red-500/10'
    },
    [OrderStatus.SERVED]: {
      icon: '✓',
      label: 'COMPLETED',
      colorClass: 'bg-gray-500 text-white border-gray-600',
      bgClass: 'bg-gray-500/10'
    }
  };

  const statusConfig = config[status] || config[OrderStatus.NEW];
  
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5'
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-bold uppercase tracking-wider rounded-full border ${statusConfig.colorClass} ${sizeClasses[size]}`}
      role="status"
      aria-label={`Order status: ${statusConfig.label}`}
    >
      <span className="text-base">{statusConfig.icon}</span>
      <span>{statusConfig.label}</span>
    </span>
  );
};
