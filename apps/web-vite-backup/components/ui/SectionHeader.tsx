import React from 'react';
import { AccessibleHeading } from '../AccessibleHeading';

export interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  level?: 1 | 2 | 3 | 4;
  action?: React.ReactNode;
  className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  level = 2,
  action,
  className = '',
}) => {
  return (
    <div className={`flex items-end justify-between gap-4 ${className}`}>
      <div>
        <AccessibleHeading
          level={level}
          className="text-3xl font-display font-bold text-foreground tracking-tight"
        >
          {title}
        </AccessibleHeading>
        {subtitle ? (
          <p className="text-sm text-muted mt-1">{subtitle}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
};
