import React from 'react';

interface QuickActionsProps {
  on86Item?: () => void;
  onViewMenu?: () => void;
  onTodayStats?: () => void;
  onPrintQR?: () => void;
  className?: string;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  on86Item,
  onViewMenu,
  onTodayStats,
  onPrintQR,
  className = '',
}) => {
  return (
    <div className={`grid grid-cols-2 gap-3 ${className}`}>
      {on86Item && (
        <button
          onClick={on86Item}
          className="p-4 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold text-sm uppercase transition-colors min-h-[56px] touch-target flex items-center justify-center gap-2"
          aria-label="Disable menu item"
        >
          <span>🚫</span>
          <span>86 Item</span>
        </button>
      )}
      {onViewMenu && (
        <button
          onClick={onViewMenu}
          className="p-4 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-bold text-sm uppercase transition-colors min-h-[56px] touch-target flex items-center justify-center gap-2"
          aria-label="View menu"
        >
          <span>📋</span>
          <span>View Menu</span>
        </button>
      )}
      {onTodayStats && (
        <button
          onClick={onTodayStats}
          className="p-4 bg-secondary-500 hover:bg-secondary-600 text-white rounded-xl font-bold text-sm uppercase transition-colors min-h-[56px] touch-target flex items-center justify-center gap-2"
          aria-label="Today's statistics"
        >
          <span>📊</span>
          <span>Today&apos;s Stats</span>
        </button>
      )}
      {onPrintQR && (
        <button
          onClick={onPrintQR}
          className="p-4 bg-accent-500 hover:bg-accent-600 text-white rounded-xl font-bold text-sm uppercase transition-colors min-h-[56px] touch-target flex items-center justify-center gap-2"
          aria-label="Print QR codes"
        >
          <span>🖨️</span>
          <span>Print QR</span>
        </button>
      )}
    </div>
  );
};
