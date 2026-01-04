import React, { useRef, ReactNode, MouseEvent, TouchEvent } from 'react';
import { hapticButton } from '../utils/haptics';
import { addTouchRipple } from '../utils/touch';

interface TouchableProps {
  children: ReactNode;
  onClick?: (e: MouseEvent | TouchEvent) => void;
  onLongPress?: () => void;
  disabled?: boolean;
  className?: string;
  haptic?: boolean;
  ripple?: boolean;
  role?: string;
  tabIndex?: number;
}

/**
 * Touchable component - Provides native-like touch feedback
 * Wraps any element to add haptic feedback and touch ripple effects
 */
export const Touchable: React.FC<TouchableProps> = React.memo(({
  children,
  onClick,
  onLongPress,
  disabled = false,
  className = '',
  haptic: enableHaptic = true,
  ripple: enableRipple = true,
  role = 'button',
  tabIndex = 0,
  ...props
}) => {
  const touchableRef = useRef<HTMLDivElement>(null);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const touchStartTimeRef = useRef<number>(0);

  const handleTouchStart = (e: TouchEvent) => {
    if (disabled) return;
    touchStartTimeRef.current = Date.now();
    
    if (onLongPress) {
      longPressTimerRef.current = setTimeout(() => {
        if (onLongPress) {
          enableHaptic && hapticButton();
          onLongPress();
        }
      }, 500); // 500ms for long press
    }
  };

  const handleTouchEnd = (e: TouchEvent) => {
    if (disabled) return;
    
    // Clear long press timer
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    
    // Check if it was a tap (not long press)
    const touchDuration = Date.now() - touchStartTimeRef.current;
    if (touchDuration < 500 && onClick) {
      if (touchableRef.current) {
        enableRipple && addTouchRipple(e, touchableRef.current);
        enableHaptic && hapticButton();
      }
      onClick(e);
    }
  };

  const handleClick = (e: MouseEvent) => {
    if (disabled) return;
    
    if (touchableRef.current) {
      enableRipple && addTouchRipple(e, touchableRef.current);
      enableHaptic && hapticButton();
    }
    
    if (onClick) {
      onClick(e);
    }
  };

  const handleTouchCancel = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  return (
    <div
      ref={touchableRef}
      role={role}
      tabIndex={disabled ? -1 : tabIndex}
      onClick={handleClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchCancel}
      className={`
        touch-target
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      style={{
        touchAction: 'manipulation',
        WebkitTapHighlightColor: 'transparent',
      }}
      {...props}
    >
      {children}
    </div>
  );
};

