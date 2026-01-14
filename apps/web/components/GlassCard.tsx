import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { clsx } from 'clsx';

interface GlassCardProps extends Omit<HTMLMotionProps<'div'>, 'onClick'> {
  children: React.ReactNode;
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
  noPadding?: boolean;
  /** Visual variant */
  variant?: 'default' | 'elevated' | 'inset';
  /** Enable glow effect on hover */
  glow?: boolean;
  /** Border accent color */
  accent?: 'primary' | 'secondary' | 'none';
}

const variantClasses = {
  default: 'glass-panel rounded-2xl',
  elevated: 'glass-panel rounded-2xl shadow-glass-lg',
  inset: 'bg-surface-highlight/50 rounded-2xl border border-border shadow-glass-inset',
};

const accentClasses = {
  none: '',
  primary: 'border-l-4 border-l-primary-500',
  secondary: 'border-l-4 border-l-secondary-500',
};

export const GlassCard: React.FC<GlassCardProps> = React.memo(({
  children,
  className = '',
  onClick,
  noPadding = false,
  variant = 'default',
  glow = false,
  accent = 'none',
  ...rest
}) => {
  return (
    <motion.div
      whileTap={onClick ? { scale: 0.98 } : {}}
      whileHover={glow ? { boxShadow: 'var(--shadow-glow-primary)' } : {}}
      onClick={onClick}
      className={clsx(
        variantClasses[variant],
        accentClasses[accent],
        !noPadding && 'p-4',
        'transition-all duration-normal',
        onClick && 'cursor-pointer touch-manipulation touch-target',
        glow && 'hover:shadow-glow',
        className
      )}
      {...rest}
    >
      {children}
    </motion.div>
  );
});

GlassCard.displayName = 'GlassCard';