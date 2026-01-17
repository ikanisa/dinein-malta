/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@/src/test/utils';
import userEvent from '@testing-library/user-event';
import { GlassCard } from '@/components/GlassCard';

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, className, onClick, whileTap: _whileTap, ...props }: any) => (
            <div className={className} onClick={onClick} data-testid={props['data-testid']} {...props}>
                {children}
            </div>
        ),
    },
}));

describe('GlassCard', () => {
    it('renders children correctly', () => {
        render(
            <GlassCard>
                <span>Card Content</span>
            </GlassCard>
        );
        expect(screen.getByText('Card Content')).toBeInTheDocument();
    });

    it('applies default glass-panel styling', () => {
        render(<GlassCard data-testid="card">Content</GlassCard>);
        const card = screen.getByTestId('card');
        expect(card).toHaveClass('glass-panel', 'rounded-2xl');
    });

    it('applies padding by default', () => {
        render(<GlassCard data-testid="card">Content</GlassCard>);
        const card = screen.getByTestId('card');
        expect(card).toHaveClass('p-4');
    });

    it('removes padding when noPadding is true', () => {
        render(
            <GlassCard noPadding data-testid="card">
                Content
            </GlassCard>
        );
        const card = screen.getByTestId('card');
        expect(card).not.toHaveClass('p-4');
    });

    it('merges custom className', () => {
        render(
            <GlassCard className="custom-class" data-testid="card">
                Content
            </GlassCard>
        );
        const card = screen.getByTestId('card');
        expect(card).toHaveClass('custom-class');
    });

    it('calls onClick when provided and clicked', async () => {
        const user = userEvent.setup();
        const handleClick = vi.fn();

        render(
            <GlassCard onClick={handleClick} data-testid="card">
                Clickable
            </GlassCard>
        );

        await user.click(screen.getByTestId('card'));
        expect(handleClick).toHaveBeenCalledOnce();
    });

    it('applies cursor-pointer when onClick is provided', () => {
        const handleClick = vi.fn();
        render(
            <GlassCard onClick={handleClick} data-testid="card">
                Clickable
            </GlassCard>
        );
        const card = screen.getByTestId('card');
        expect(card).toHaveClass('cursor-pointer');
    });

    it('has touch-manipulation class when clickable', () => {
        const handleClick = vi.fn();
        render(
            <GlassCard onClick={handleClick} data-testid="card">
                Touchable
            </GlassCard>
        );
        const card = screen.getByTestId('card');
        expect(card).toHaveClass('touch-manipulation');
    });

    it('supports nested components', () => {
        render(
            <GlassCard>
                <h2>Header</h2>
                <p>Paragraph</p>
                <button>Button</button>
            </GlassCard>
        );
        expect(screen.getByText('Header')).toBeInTheDocument();
        expect(screen.getByText('Paragraph')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Button' })).toBeInTheDocument();
    });
});
