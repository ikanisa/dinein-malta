import React from 'react';
import { motion } from 'framer-motion';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
  noPadding?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = React.memo(({ children, className = '', onClick, noPadding = false }) => {
  return (
    <motion.div 
      whileTap={onClick ? { scale: 0.98 } : {}}
      onClick={onClick}
      className={`glass-panel rounded-2xl ${noPadding ? '' : 'p-4'} transition-colors duration-200 
        ${onClick ? 'cursor-pointer touch-manipulation touch-target' : ''} 
        ${className}`}
    >
      {children}
    </motion.div>
  );
});

GlassCard.displayName = 'GlassCard';