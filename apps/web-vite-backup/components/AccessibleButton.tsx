/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Accessible Button Component
 * Ensures WCAG 2.1 AA compliance with proper ARIA attributes and keyboard navigation
 */

import React from 'react';
import { hapticButton } from '../utils/haptics';

export interface AccessibleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  ariaLabel?: string;
  ariaDescribedBy?: string;
}

export const AccessibleButton: React.FC<AccessibleButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  ariaLabel,
  ariaDescribedBy,
  className = '',
  onClick,
  disabled,
  ...props
}) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled && onClick) {
      hapticButton();
      onClick(e);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    // Handle keyboard activation (Space and Enter)
    if ((e.key === 'Enter' || e.key === ' ') && !disabled && onClick) {
      e.preventDefault();
      hapticButton();
      onClick(e as any);
    }
  };

  const baseClasses = `
    inline-flex items-center justify-center
    font-semibold
    transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
    min-h-[48px] min-w-[48px] /* WCAG 2.1 AA touch target minimum (48px recommended) */
    rounded-xl
    ${fullWidth ? 'w-full' : ''}
  `;

  const variantClasses = {
    primary: 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/25 hover:shadow-glow-primary hover:brightness-110 focus:ring-primary-500 active:scale-[0.98]',
    secondary: 'bg-gradient-to-r from-secondary-500 to-secondary-600 text-white shadow-lg shadow-secondary-500/25 hover:shadow-glow-secondary hover:brightness-110 focus:ring-secondary-500 active:scale-[0.98]',
    danger: 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-600/25 hover:shadow-red-600/40 hover:brightness-110 focus:ring-red-500 active:scale-[0.98]',
    ghost: 'bg-transparent text-foreground hover:bg-surface-highlight hover:backdrop-blur-sm focus:ring-secondary-500 active:scale-[0.98]',
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      type="button"
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      aria-disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};
