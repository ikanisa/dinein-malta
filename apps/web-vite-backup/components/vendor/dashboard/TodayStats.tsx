import React from 'react';

interface TodayStatsProps {
  revenue: number;
  orderCount: number;
  averageOrderValue: number;
  className?: string;
}

export const TodayStats: React.FC<TodayStatsProps> = ({
  revenue,
  orderCount,
  averageOrderValue,
  className = '',
}) => {
  return (
    <div className={`grid grid-cols-3 gap-4 ${className}`}>
      <div className="bg-surface-highlight rounded-xl p-4 border border-border">
        <div className="text-xs text-muted uppercase tracking-wider mb-1">Today&apos;s Revenue</div>
        <div className="text-2xl font-bold text-green-500">€{revenue.toFixed(2)}</div>
      </div>
      <div className="bg-surface-highlight rounded-xl p-4 border border-border">
        <div className="text-xs text-muted uppercase tracking-wider mb-1">Orders</div>
        <div className="text-2xl font-bold text-foreground">{orderCount}</div>
      </div>
      <div className="bg-surface-highlight rounded-xl p-4 border border-border">
        <div className="text-xs text-muted uppercase tracking-wider mb-1">Avg Order</div>
        <div className="text-2xl font-bold text-foreground">€{averageOrderValue.toFixed(2)}</div>
      </div>
    </div>
  );
};
