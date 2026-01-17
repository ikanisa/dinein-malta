import React from 'react';
import { MenuItem } from '../../../types';

interface MenuItemRowProps {
  item: MenuItem;
  salesCount?: number; // Items sold today
  onToggleAvailability: (item: MenuItem) => void;
  onEdit: (item: MenuItem) => void;
}

export const MenuItemRow: React.FC<MenuItemRowProps> = ({
  item,
  salesCount = 0,
  onToggleAvailability,
  onEdit,
}) => {
  return (
    <div
      className={`bg-surface rounded-xl border border-border p-4 flex gap-4 items-center transition-all ${
        !item.available ? 'opacity-60' : ''
      }`}
    >
      {/* Image */}
      <div className="w-16 h-16 bg-surface-highlight rounded-lg overflow-hidden flex-shrink-0">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.name}
            className={`w-full h-full object-cover ${!item.available ? 'grayscale' : ''}`}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-2xl">🍽️</div>
        )}
        {!item.available && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-lg">
            <span className="text-[10px] font-bold text-white">OUT OF STOCK</span>
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start mb-1">
          <div>
            <h3 className="font-bold text-foreground truncate">{item.name}</h3>
            <p className="text-xs text-muted">€{item.price.toFixed(2)} • {item.category}</p>
          </div>
          {salesCount > 0 && (
            <div className="text-xs text-muted ml-2 whitespace-nowrap">
              {salesCount} sold today
            </div>
          )}
        </div>
        {item.description && (
          <p className="text-xs text-muted line-clamp-2 mt-1">{item.description}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-2 items-end">
        <button
          onClick={() => onToggleAvailability(item)}
          className={`w-12 h-6 rounded-full p-1 transition-colors flex-shrink-0 ${
            item.available ? 'bg-green-500' : 'bg-gray-600'
          }`}
          title={item.available ? 'Mark as Hidden (86)' : 'Mark as Available'}
          aria-label={item.available ? 'Disable item' : 'Enable item'}
        >
          <div
            className={`w-4 h-4 bg-white rounded-full shadow-md transition-transform ${
              item.available ? 'translate-x-6' : ''
            }`}
          />
        </button>
        <button
          onClick={() => onEdit(item)}
          className="text-xs text-muted hover:text-foreground transition-colors px-2 py-1 rounded touch-target"
          aria-label="Edit item"
        >
          ✏️ Edit
        </button>
      </div>
    </div>
  );
};
