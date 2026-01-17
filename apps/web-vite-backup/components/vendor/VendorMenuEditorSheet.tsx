import React from 'react';
import { BottomSheet } from './BottomSheet';
import { Spinner } from '../Loading';
import { MenuItem } from '../../types';

interface VendorMenuEditorSheetProps {
  isOpen: boolean;
  title: string;
  editingItem: Partial<MenuItem>;
  onChange: (nextItem: Partial<MenuItem>) => void;
  onClose: () => void;
  onSave: () => void;
  onGenerateImage: () => void;
  isGeneratingImage: boolean;
  aiImagePrompt: string;
  onAiPromptChange: (value: string) => void;
}

export const VendorMenuEditorSheet: React.FC<VendorMenuEditorSheetProps> = ({
  isOpen,
  title,
  editingItem,
  onChange,
  onClose,
  onSave,
  onGenerateImage,
  isGeneratingImage,
  aiImagePrompt,
  onAiPromptChange,
}) => {
  if (!isOpen) return null;

  return (
    <BottomSheet title={title} onClose={onClose}>
      <div className="space-y-4">
        <div className="flex gap-4">
          <div className="w-24 h-24 bg-surface-highlight rounded-xl border border-border flex items-center justify-center overflow-hidden relative group">
            {editingItem.imageUrl ? (
              <img src={editingItem.imageUrl} className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl">📷</span>
            )}
          </div>
          <div className="flex-1 space-y-3">
            <input
              value={editingItem.name || ''}
              onChange={(event) => onChange({ ...editingItem, name: event.target.value })}
              placeholder="Item Name"
              className="w-full bg-surface-highlight border border-border p-3 rounded-xl text-foreground font-bold placeholder-muted"
            />
            <div className="flex gap-2">
              <input
                value={editingItem.price || ''}
                type="number"
                onChange={(event) =>
                  onChange({ ...editingItem, price: parseFloat(event.target.value) })
                }
                placeholder="Price €"
                className="w-1/2 bg-surface-highlight border border-border p-3 rounded-xl text-foreground placeholder-muted"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-widest text-muted">
                AI prompt
              </label>
              <textarea
                value={aiImagePrompt}
                onChange={(event) => onAiPromptChange(event.target.value)}
                rows={2}
                placeholder="Describe the dish in a few words"
                className="w-full bg-surface-highlight border border-border rounded-xl px-3 py-2 text-sm text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-secondary-500/40 focus:border-secondary-500"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={onGenerateImage}
                disabled={isGeneratingImage}
                className="flex-1 py-2 bg-gradient-to-r from-accent-500 to-primary-500 text-white rounded-lg text-xs font-bold shadow-lg"
              >
                {isGeneratingImage ? (
                  <Spinner className="w-3 h-3 mx-auto border-white" />
                ) : (
                  '✨ Generate Photo'
                )}
              </button>
            </div>
        </div>
        </div>
        <button
          onClick={onSave}
          className="w-full py-4 bg-foreground text-background font-bold rounded-xl shadow-lg active:scale-[0.98] transition-transform"
        >
          Save Item
        </button>
      </div>
    </BottomSheet>
  );
};
