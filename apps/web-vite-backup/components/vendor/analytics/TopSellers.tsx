import React from 'react';

interface TopSeller {
  name: string;
  quantity: number;
  revenue: number;
}

interface TopSellersProps {
  sellers: TopSeller[];
  className?: string;
}

export const TopSellers: React.FC<TopSellersProps> = ({ sellers, className = '' }) => {
  if (sellers.length === 0) {
    return (
      <div className={`text-center text-muted py-8 ${className}`}>
        No sales data available
      </div>
    );
  }

  const maxRevenue = Math.max(...sellers.map((s) => s.revenue), 1);

  return (
    <div className={className}>
      <h3 className="text-lg font-bold text-foreground mb-4">Top Sellers</h3>
      <div className="space-y-3">
        {sellers.map((seller, index) => (
          <div key={seller.name} className="bg-surface-highlight rounded-xl p-4 border border-border">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <span className="text-lg font-bold text-muted w-6">#{index + 1}</span>
                <span className="font-semibold text-foreground">{seller.name}</span>
              </div>
              <div className="text-right">
                <div className="font-bold text-foreground">€{seller.revenue.toFixed(2)}</div>
                <div className="text-xs text-muted">{seller.quantity} sold</div>
              </div>
            </div>
            <div className="w-full bg-surface rounded-full h-2">
              <div
                className="bg-primary-500 h-2 rounded-full transition-all"
                style={{ width: `${(seller.revenue / maxRevenue) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
