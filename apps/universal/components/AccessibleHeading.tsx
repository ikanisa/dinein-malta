/**
 * Accessible Heading Component
 * Ensures proper heading hierarchy for screen readers
 */

import React from 'react';

export interface AccessibleHeadingProps {
  level: 1 | 2 | 3 | 4 | 5 | 6;
  children: React.ReactNode;
  className?: string;
  id?: string;
}

export const AccessibleHeading: React.FC<AccessibleHeadingProps> = ({
  level,
  children,
  className = '',
  id,
}) => {
  const HeadingTag = `h${level}` as keyof JSX.IntrinsicElements;
  
  return (
    <HeadingTag
      id={id}
      className={className}
      role="heading"
      aria-level={level}
    >
      {children}
    </HeadingTag>
  );
};



