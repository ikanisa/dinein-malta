import React from 'react';

type BadgeTone = 'primary' | 'secondary' | 'accent' | 'neutral';
type BadgeVariant = 'solid' | 'soft' | 'outline';

export interface BadgeProps {
  children: React.ReactNode;
  tone?: BadgeTone;
  variant?: BadgeVariant;
  className?: string;
}

const toneClasses: Record<BadgeTone, Record<BadgeVariant, string>> = {
  primary: {
    solid: 'bg-primary-500 text-white shadow-lg shadow-primary-500/20',
    soft: 'bg-primary-500/10 text-primary-600 border border-primary-500/20 backdrop-blur-sm',
    outline: 'border border-primary-500 text-primary-600 backdrop-blur-sm',
  },
  secondary: {
    solid: 'bg-secondary-500 text-white shadow-lg shadow-secondary-500/20',
    soft: 'bg-secondary-500/10 text-secondary-600 border border-secondary-500/20 backdrop-blur-sm',
    outline: 'border border-secondary-500 text-secondary-600 backdrop-blur-sm',
  },
  accent: {
    solid: 'bg-accent-500 text-white shadow-lg shadow-accent-500/20',
    soft: 'bg-accent-500/10 text-accent-500 border border-accent-500/20 backdrop-blur-sm',
    outline: 'border border-accent-500 text-accent-500 backdrop-blur-sm',
  },
  neutral: {
    solid: 'bg-foreground text-background shadow-lg shadow-foreground/20',
    soft: 'bg-surface-highlight/50 text-foreground border border-border backdrop-blur-sm',
    outline: 'border border-border text-foreground backdrop-blur-sm',
  },
};

export const Badge: React.FC<BadgeProps> = ({
  children,
  tone = 'neutral',
  variant = 'soft',
  className = '',
}) => {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${toneClasses[tone][variant]} ${className}`}
    >
      {children}
    </span>
  );
};
