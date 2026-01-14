import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Skeleton, Spinner, CardSkeleton, VenueListSkeleton, MenuListSkeleton } from '@/components/Loading';

// Mock GlassCard which is used by some Loading components
vi.mock('@/components/GlassCard', () => ({
    GlassCard: ({ children, className }: { children: React.ReactNode; className?: string }) => (
        <div className={`glass-card ${className || ''}`} data-testid="glass-card">
            {children}
        </div>
    ),
}));

import { vi } from 'vitest';

describe('Loading Components', () => {
    describe('Skeleton', () => {
        it('renders with default styling', () => {
            render(<Skeleton />);
            const skeleton = document.querySelector('.animate-pulse');
            expect(skeleton).toBeInTheDocument();
        });

        it('applies custom className', () => {
            render(<Skeleton className="w-40 h-6" />);
            const skeleton = document.querySelector('.animate-pulse');
            expect(skeleton).toHaveClass('w-40', 'h-6');
        });

        it('has correct background colors for light/dark mode', () => {
            render(<Skeleton />);
            const skeleton = document.querySelector('.animate-pulse');
            expect(skeleton).toHaveClass('bg-gray-200', 'dark:bg-white/10');
        });
    });

    describe('Spinner', () => {
        it('renders with default size', () => {
            render(<Spinner />);
            const spinner = document.querySelector('.animate-spin');
            expect(spinner).toBeInTheDocument();
            expect(spinner).toHaveClass('w-5', 'h-5');
        });

        it('applies custom size', () => {
            render(<Spinner className="w-10 h-10" />);
            const spinner = document.querySelector('.animate-spin');
            expect(spinner).toHaveClass('w-10', 'h-10');
        });

        it('applies custom color', () => {
            render(<Spinner color="border-blue-500" />);
            const spinner = document.querySelector('.animate-spin');
            expect(spinner).toHaveClass('border-blue-500');
        });
    });

    describe('CardSkeleton', () => {
        it('renders skeleton card structure', () => {
            render(<CardSkeleton />);
            // Check for aspect ratio container
            const imageSection = document.querySelector('.aspect-\\[4\\/3\\]');
            expect(imageSection).toBeInTheDocument();
        });

        it('has animated pulse elements', () => {
            render(<CardSkeleton />);
            const pulsingElements = document.querySelectorAll('.animate-pulse');
            expect(pulsingElements.length).toBeGreaterThan(0);
        });
    });

    describe('VenueListSkeleton', () => {
        it('renders inside GlassCard wrapper', () => {
            render(<VenueListSkeleton />);
            expect(screen.getByTestId('glass-card')).toBeInTheDocument();
        });

        it('has skeleton placeholders', () => {
            render(<VenueListSkeleton />);
            const skeletons = document.querySelectorAll('.animate-pulse');
            expect(skeletons.length).toBeGreaterThan(0);
        });
    });

    describe('MenuListSkeleton', () => {
        it('renders 3 skeleton cards', () => {
            render(<MenuListSkeleton />);
            const glassCards = screen.getAllByTestId('glass-card');
            expect(glassCards).toHaveLength(3);
        });

        it('has image placeholder for each item', () => {
            render(<MenuListSkeleton />);
            const imagePlaceholders = document.querySelectorAll('.w-28.h-28');
            expect(imagePlaceholders.length).toBeGreaterThanOrEqual(3);
        });
    });
});
