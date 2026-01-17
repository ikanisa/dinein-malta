import React from 'react';
import { SwipeableCard } from '../common/SwipeableCard';
import { MenuItem } from '../../types';

interface CartItemProps {
  item: MenuItem;
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
  onRemove: () => void;
}

export const CartItem: React.FC<CartItemProps> = ({
  item,
  quantity,
  onIncrement,
  onDecrement,
  onRemove,
}) => {
  return (
    <SwipeableCard
      onSwipeLeft={onRemove}
      threshold={100}
      className="mb-3"
    >
      <div className="flex justify-between items-center bg-surface-highlight p-3 rounded-xl border border-border">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="flex items-center gap-1 bg-background rounded-lg p-1 border border-border flex-shrink-0">
            <button
              onClick={onDecrement}
              aria-label={`Remove one ${item.name}`}
              className="min-w-[48px] min-h-[48px] w-12 h-12 flex items-center justify-center text-muted hover:text-foreground font-bold active:scale-90 transition touch-target"
            >
              −
            </button>
            <span className="font-bold w-8 text-center text-sm text-foreground" aria-label={`Quantity: ${quantity}`}>
              {quantity}
            </span>
            <button
              onClick={onIncrement}
              aria-label={`Add one more ${item.name}`}
              className="min-w-[48px] min-h-[48px] w-12 h-12 flex items-center justify-center text-foreground font-bold active:scale-90 transition touch-target"
            >
              +
            </button>
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-bold text-sm truncate pr-2 text-foreground">{item.name}</div>
            <div className="text-xs text-muted">€{item.price.toFixed(2)} each</div>
          </div>
        </div>
        <div className="font-bold text-foreground flex-shrink-0 ml-2" aria-label={`Total: €${(item.price * quantity).toFixed(2)}`}>
          €{(item.price * quantity).toFixed(2)}
        </div>
      </div>
    </SwipeableCard>
  );
};
