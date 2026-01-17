import React from 'react';

interface HourlyStat {
  hour: number;
  orders: number;
  revenue: number;
}

interface RevenueChartProps {
  hourlyStats: HourlyStat[];
  className?: string;
}

export const RevenueChart: React.FC<RevenueChartProps> = ({ hourlyStats, className = '' }) => {
  const maxRevenue = Math.max(...hourlyStats.map((h) => h.revenue), 1);

  // Filter to show only hours with activity or key hours
  const activeHours = hourlyStats.filter((h) => h.revenue > 0 || h.orders > 0);

  if (activeHours.length === 0) {
    return (
      <div className={`text-center text-muted py-8 ${className}`}>
        No revenue data available
      </div>
    );
  }

  return (
    <div className={className}>
      <h3 className="text-lg font-bold text-foreground mb-4">Revenue by Hour</h3>
      <div className="bg-surface-highlight rounded-xl p-4 border border-border">
        <div className="flex items-end justify-between gap-1 h-48">
          {hourlyStats.map((stat) => {
            const height = maxRevenue > 0 ? (stat.revenue / maxRevenue) * 100 : 0;
            return (
              <div
                key={stat.hour}
                className="flex-1 flex flex-col items-center justify-end gap-1"
                title={`${stat.hour}:00 - €${stat.revenue.toFixed(2)} - ${stat.orders} orders`}
              >
                <div
                  className="w-full bg-primary-500 rounded-t transition-all hover:bg-primary-600"
                  style={{ height: `${height}%`, minHeight: height > 0 ? '4px' : '0' }}
                />
                <div className="text-[10px] text-muted">
                  {stat.hour === 0 ? '12a' : stat.hour < 12 ? `${stat.hour}a` : stat.hour === 12 ? '12p' : `${stat.hour - 12}p`}
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-4 flex items-center justify-center gap-4 text-xs text-muted">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-primary-500 rounded" />
            <span>Revenue</span>
          </div>
        </div>
      </div>
    </div>
  );
};
