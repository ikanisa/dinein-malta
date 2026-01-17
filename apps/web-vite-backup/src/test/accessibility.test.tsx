/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Accessibility Tests using axe-core
 * 
 * These tests verify WCAG 2.1 AA compliance for critical components.
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@/src/test/utils';
import { axe, toHaveNoViolations } from 'jest-axe';

// Extend expect with axe matchers
expect.extend(toHaveNoViolations);

// Import components to test
import { GlassCard } from '@/components/GlassCard';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/ui/Input';
import EmptyState from '@/components/common/EmptyState';
import ErrorState from '@/components/common/ErrorState';

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, className, onClick, ...props }: any) => (
            <div className={className} onClick={onClick} {...props}>
                {children}
            </div>
        ),
        button: ({ children, className, onClick, disabled, ...props }: any) => (
            <button className={className} onClick={onClick} disabled={disabled} {...props}>
                {children}
            </button>
        ),
    },
    AnimatePresence: ({ children }: any) => children,
}));

// Mock haptics
vi.mock('@/utils/haptics', () => ({
    hapticButton: vi.fn(),
}));

describe('Accessibility Tests', () => {
    describe('GlassCard', () => {
        it('should have no accessibility violations', async () => {
            const { container } = render(
                <GlassCard>
                    <h2>Card Title</h2>
                    <p>Card content goes here</p>
                </GlassCard>
            );

            const results = await axe(container);
            expect(results).toHaveNoViolations();
        });

        it('should be accessible when used as a button', async () => {
            const { container } = render(
                <GlassCard onClick={() => { }} aria-label="Clickable card">
                    <span>Click me</span>
                </GlassCard>
            );

            const results = await axe(container);
            expect(results).toHaveNoViolations();
        });
    });

    describe('Button', () => {
        it('should have no accessibility violations with text', async () => {
            const { container } = render(
                <Button>Submit</Button>
            );

            const results = await axe(container);
            expect(results).toHaveNoViolations();
        });

        it('should have no violations with aria-label for icon buttons', async () => {
            const { container } = render(
                <Button aria-label="Close dialog">
                    <span aria-hidden="true">✕</span>
                </Button>
            );

            const results = await axe(container);
            expect(results).toHaveNoViolations();
        });

        it('should have no violations when disabled', async () => {
            const { container } = render(
                <Button disabled>Disabled Button</Button>
            );

            const results = await axe(container);
            expect(results).toHaveNoViolations();
        });
    });

    describe('Input', () => {
        it('should have no accessibility violations with label', async () => {
            const { container } = render(
                <Input label="Email Address" type="email" placeholder="you@example.com" />
            );

            const results = await axe(container);
            expect(results).toHaveNoViolations();
        });

        it('should have no violations with error state', async () => {
            const { container } = render(
                <Input
                    label="Password"
                    type="password"
                    error="Password must be at least 8 characters"
                />
            );

            const results = await axe(container);
            expect(results).toHaveNoViolations();
        });

        it('should have no violations with helper text', async () => {
            const { container } = render(
                <Input
                    label="Username"
                    helperText="Choose a unique username"
                />
            );

            const results = await axe(container);
            expect(results).toHaveNoViolations();
        });
    });

    describe('EmptyState', () => {
        it('should have no accessibility violations', async () => {
            const { container } = render(
                <EmptyState
                    icon="📭"
                    title="No items found"
                    description="Try adjusting your search or filters"
                />
            );

            const results = await axe(container);
            expect(results).toHaveNoViolations();
        });

        it('should have no violations with action button', async () => {
            const { container } = render(
                <EmptyState
                    icon="🔍"
                    title="No results"
                    description="We couldn't find what you're looking for"
                    action={{ label: 'Clear filters', onClick: () => { } }}
                />
            );

            const results = await axe(container);
            expect(results).toHaveNoViolations();
        });
    });

    describe('ErrorState', () => {
        it('should have no accessibility violations', async () => {
            const { container } = render(
                <ErrorState
                    error="Something went wrong. Please try again later."
                />
            );

            const results = await axe(container);
            expect(results).toHaveNoViolations();
        });

        it('should have no violations with retry button', async () => {
            const { container } = render(
                <ErrorState
                    error={new Error("Connection error: Unable to connect to server")}
                    onRetry={() => { }}
                />
            );

            const results = await axe(container);
            expect(results).toHaveNoViolations();
        });
    });
});

describe('Keyboard Navigation', () => {
    it('interactive elements should be focusable', async () => {
        const { container } = render(
            <div>
                <Button>Focusable Button</Button>
                <Input label="Focusable Input" />
                <a href="/test">Focusable Link</a>
            </div>
        );

        // Check that interactive elements exist and are accessible
        expect(screen.getByRole('button')).toBeInTheDocument();
        expect(screen.getByRole('textbox')).toBeInTheDocument();
        expect(screen.getByRole('link')).toBeInTheDocument();

        const results = await axe(container);
        expect(results).toHaveNoViolations();
    });
});
