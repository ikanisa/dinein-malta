import React from 'react';
import { GlassCard } from '../GlassCard';

interface CartBarProps {
  itemCount: number;
  total: number;
  favoritesCount: number;
  showFavoritesOnly: boolean;
  onToggleFavorites: () => void;
  onReviewCart: () => void;
}

export const CartBar: React.FC<CartBarProps> = ({
  itemCount,
  total,
  favoritesCount,
  showFavoritesOnly,
  onToggleFavorites,
  onReviewCart,
}) => {
  if (itemCount === 0) {
    // Show only favorites filter when cart is empty
    return (
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-surface/95 backdrop-blur-xl border-t border-border pb-safe-bottom">
        <div className="flex items-center justify-center p-3">
          <button
            onClick={onToggleFavorites}
            className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium text-sm transition-all ${
              showFavoritesOnly
                ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30'
                : 'bg-surface-highlight text-muted hover:bg-black/10'
            }`}
            aria-label={showFavoritesOnly ? 'Show all items' : 'Show favorites only'}
          >
            <span className="text-lg">{showFavoritesOnly ? '⭐' : '☆'}</span>
            <span>{favoritesCount > 0 ? `${favoritesCount} Favorites` : 'Favorites'}</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 pb-safe-bottom">
      <GlassCard className="mx-4 mb-4 border border-border shadow-2xl">
        <div className="flex items-center gap-3 p-4">
          {/* Favorites Filter Button */}
          <button
            onClick={onToggleFavorites}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-medium text-xs transition-all flex-shrink-0 ${
              showFavoritesOnly
                ? 'bg-primary-500/20 text-primary-600'
                : 'bg-surface-highlight text-muted hover:bg-black/10'
            }`}
            aria-label={showFavoritesOnly ? 'Show all items' : 'Show favorites only'}
          >
            <span>{showFavoritesOnly ? '⭐' : '☆'}</span>
            {favoritesCount > 0 && (
              <span className="font-bold">{favoritesCount}</span>
            )}
          </button>

          {/* Cart Summary */}
          <div 
            onClick={onReviewCart}
            className="flex-1 flex items-center justify-between cursor-pointer active:scale-95 transition-transform"
          >
            <div className="flex items-center gap-3">
              <div className="bg-foreground text-background font-bold w-10 h-10 rounded-full flex items-center justify-center shadow-lg">
                {itemCount}
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-muted font-bold uppercase tracking-wider">Total</span>
                <span className="font-bold text-xl text-foreground">€{total.toFixed(2)}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 font-bold text-sm text-primary-600">
              <span>Review Order</span>
              <span className="text-xl">→</span>
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};
