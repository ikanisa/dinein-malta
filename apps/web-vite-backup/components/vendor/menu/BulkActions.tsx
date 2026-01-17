import React from 'react';

interface BulkActionsProps {
  onDisableAllSpecials?: () => void;
  onEnableAllItems?: () => void;
  onSaveChanges?: () => void;
  className?: string;
}

export const BulkActions: React.FC<BulkActionsProps> = ({
  onDisableAllSpecials,
  onEnableAllItems,
  onSaveChanges,
  className = '',
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {(onDisableAllSpecials || onEnableAllItems) && (
        <div className="flex gap-2">
          {onDisableAllSpecials && (
            <button
              onClick={onDisableAllSpecials}
              className="flex-1 p-3 bg-red-500/20 hover:bg-red-500/30 text-red-500 rounded-lg font-semibold text-sm transition-colors min-h-[48px] touch-target"
              aria-label="Disable all special items"
            >
              🚫 Disable All Specials
            </button>
          )}
          {onEnableAllItems && (
            <button
              onClick={onEnableAllItems}
              className="flex-1 p-3 bg-green-500/20 hover:bg-green-500/30 text-green-500 rounded-lg font-semibold text-sm transition-colors min-h-[48px] touch-target"
              aria-label="Enable all items"
            >
              ✅ Enable All Items
            </button>
          )}
        </div>
      )}
      {onSaveChanges && (
        <button
          onClick={onSaveChanges}
          className="w-full p-3 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-bold text-sm transition-colors min-h-[48px] touch-target"
          aria-label="Save changes"
        >
          💾 Save Changes
        </button>
      )}
    </div>
  );
};
