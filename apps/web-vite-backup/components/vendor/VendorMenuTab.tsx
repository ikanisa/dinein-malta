import React from 'react';
import { GlassCard } from '../GlassCard';
import { Spinner } from '../Loading';
import { MenuItem } from '../../types';

interface VendorMenuTabProps {
  menuItems: MenuItem[];
  isProcessingMenu: boolean;
  fileInputRef: React.RefObject<HTMLInputElement>;
  onManualAdd: () => void;
  onSmartImport: () => void;
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onEditItem: (item: MenuItem) => void;
  onToggleItemAvailability: (event: React.MouseEvent, item: MenuItem) => void;
  searchValue: string;
  onSearchChange: (value: string) => void;
  categories: string[];
  activeCategory: string;
  onCategoryChange: (value: string) => void;
  statusFilter: 'all' | 'active' | 'hidden';
  onStatusFilterChange: (value: 'all' | 'active' | 'hidden') => void;
  tags: string[];
  activeTag: string;
  onTagChange: (value: string) => void;
  parsedItems: MenuItem[] | null;
  generatingImages: boolean;
  onGenerateImages: () => void;
  onConfirmImport: () => void;
  isImporting: boolean;
}

export const VendorMenuTab: React.FC<VendorMenuTabProps> = ({
  menuItems,
  isProcessingMenu,
  fileInputRef,
  onManualAdd,
  onSmartImport,
  onFileChange,
  onEditItem,
  onToggleItemAvailability,
  searchValue,
  onSearchChange,
  categories,
  activeCategory,
  onCategoryChange,
  statusFilter,
  onStatusFilterChange,
  tags,
  activeTag,
  onTagChange,
  parsedItems,
  generatingImages,
  onGenerateImages,
  onConfirmImport,
  isImporting,
}) => {
  const statusOptions: Array<{ value: 'all' | 'active' | 'hidden'; label: string }> = [
    { value: 'all', label: 'All' },
    { value: 'active', label: 'Active' },
    { value: 'hidden', label: 'Hidden' },
  ];

  return (
    <div className="p-4">
      <div className="grid grid-cols-2 gap-3 mb-4">
        <button
          onClick={onManualAdd}
          className="py-4 bg-surface-highlight rounded-xl border border-border font-bold hover:bg-black/10 transition text-foreground"
        >
          + Manual Add
        </button>
        <button
          onClick={onSmartImport}
          className="py-4 bg-gradient-to-r from-secondary-500 to-primary-500 text-white rounded-xl font-bold shadow-lg flex items-center justify-center gap-2"
        >
          {isProcessingMenu ? <Spinner className="w-4 h-4" /> : <span>📄 Smart Import</span>}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,application/pdf"
          onChange={onFileChange}
          className="hidden"
        />
      </div>
      <div className="mb-4 rounded-2xl border border-border bg-surface p-3 space-y-3">
        <input
          type="search"
          value={searchValue}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search menu items"
          className="w-full rounded-xl border border-border bg-surface-highlight px-3 py-2 text-sm text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-secondary-500/40 focus:border-secondary-500"
        />
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {categories.map((category) => {
            const isActive = category === activeCategory;
            return (
              <button
                key={category}
                onClick={() => onCategoryChange(category)}
                className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold border transition ${
                  isActive
                    ? 'bg-primary-500 text-white border-primary-500 shadow-lg shadow-primary-500/20'
                    : 'bg-surface-highlight text-muted border-border hover:text-foreground'
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-2">
          {statusOptions.map((option) => {
            const isActive = option.value === statusFilter;
            return (
              <button
                key={option.value}
                onClick={() => onStatusFilterChange(option.value)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold border transition ${
                  isActive
                    ? 'bg-secondary-500 text-white border-secondary-500 shadow-lg shadow-secondary-500/20'
                    : 'bg-surface-highlight text-muted border-border hover:text-foreground'
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
        {tags.length > 1 ? (
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            {tags.map((tag) => {
              const isActive = tag === activeTag;
              return (
                <button
                  key={tag}
                  onClick={() => onTagChange(tag)}
                  className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-semibold border transition ${
                    isActive
                      ? 'bg-accent-500 text-white border-accent-500 shadow-lg shadow-accent-500/20'
                      : 'bg-surface-highlight text-muted border-border hover:text-foreground'
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        ) : null}
      </div>
      {parsedItems && parsedItems.length > 0 ? (
        <div className="mb-4 rounded-2xl border border-primary-500/30 bg-surface p-4">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div>
              <p className="text-sm font-semibold text-foreground">Import preview</p>
              <p className="text-xs text-muted">{parsedItems.length} items ready to add</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onGenerateImages}
                disabled={generatingImages || isImporting}
                className="px-3 py-1.5 text-xs font-semibold rounded-full border border-accent-500/40 text-accent-500 hover:bg-accent-500/10 disabled:opacity-60"
              >
                {generatingImages ? 'Generating...' : 'Auto-generate images'}
              </button>
              <button
                onClick={onConfirmImport}
                disabled={isImporting}
                className={`px-3 py-1.5 text-xs font-semibold rounded-full ${isImporting ? 'bg-secondary-500/60 text-white cursor-wait' : 'bg-primary-500 text-white shadow-lg shadow-primary-500/20'}`}
              >
                {isImporting ? 'Adding...' : 'Add to menu'}
              </button>
            </div>
          </div>
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {parsedItems.map((item) => (
              <div key={item.id} className="flex items-center gap-3 rounded-xl border border-border bg-surface-highlight px-3 py-2">
                <div className="h-10 w-10 rounded-lg bg-surface flex items-center justify-center overflow-hidden">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-sm">🍽️</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground truncate">{item.name}</p>
                  <p className="text-xs text-muted truncate">{item.category || 'Uncategorized'}</p>
                </div>
                <p className="text-sm font-semibold text-foreground">€{item.price}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}
      <div className="grid grid-cols-1 gap-3">
        {menuItems.map((item) => (
          <GlassCard
            key={item.id}
            onClick={() => onEditItem(item)}
            className="flex gap-3 p-3 bg-surface border-border items-center"
          >
            <div className="w-16 h-16 bg-surface-highlight rounded-lg overflow-hidden flex-shrink-0 relative">
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  className={`w-full h-full object-cover ${!item.available ? 'grayscale opacity-50' : ''}`}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xl">🍽️</div>
              )}
              {!item.available ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-black/60 px-1 text-[10px] font-bold text-white rounded">
                    HIDDEN
                  </div>
                </div>
              ) : null}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-bold truncate text-foreground">{item.name}</div>
                  <div className="text-xs text-muted">€{item.price} • {item.category}</div>
                </div>
                <button
                  onClick={(event) => onToggleItemAvailability(event, item)}
                  className={`w-10 h-6 rounded-full p-1 transition-colors flex-shrink-0 ml-2 ${
                    item.available ? 'bg-green-500' : 'bg-gray-600'
                  }`}
                  title={item.available ? 'Mark as Hidden' : 'Mark as Active'}
                >
                  <div
                    className={`w-4 h-4 bg-white rounded-full shadow-md transition-transform ${
                      item.available ? 'translate-x-4' : ''
                    }`}
                  />
                </button>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
};
