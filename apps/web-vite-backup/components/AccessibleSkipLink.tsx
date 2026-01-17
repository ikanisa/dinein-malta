/**
 * Accessible Skip Link Component
 * Allows keyboard users to skip to main content
 */

import React from 'react';

export const SkipLink: React.FC<{ href?: string }> = ({ href = '#main-content' }) => {
  return (
    <a
      href={href}
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-primary-500 focus:text-white focus:rounded-lg focus:font-bold focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
      onClick={(e) => {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          (target as HTMLElement).focus();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }}
    >
      Skip to main content
    </a>
  );
};


