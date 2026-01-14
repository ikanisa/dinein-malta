import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@/src/test/utils';
import userEvent from '@testing-library/user-event';
import { AccessibleButton } from '@/components/AccessibleButton';

// Mock haptics
vi.mock('@/utils/haptics', () => ({
    hapticButton: vi.fn(),
}));

describe('AccessibleButton', () => {
    it('renders button with text', () => {
        render(<AccessibleButton>Click me</AccessibleButton>);
        expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
    });

    it('calls onClick when clicked', async () => {
        const user = userEvent.setup();
        const handleClick = vi.fn();

        render(<AccessibleButton onClick={handleClick}>Click</AccessibleButton>);
        await user.click(screen.getByRole('button', { name: 'Click' }));

        expect(handleClick).toHaveBeenCalledOnce();
    });

    it('does not call onClick when disabled', async () => {
        const user = userEvent.setup();
        const handleClick = vi.fn();

        render(
            <AccessibleButton onClick={handleClick} disabled>
                Click
            </AccessibleButton>
        );
        await user.click(screen.getByRole('button', { name: 'Click' }));

        expect(handleClick).not.toHaveBeenCalled();
    });

    it('has correct aria-disabled when disabled', () => {
        render(<AccessibleButton disabled>Disabled</AccessibleButton>);
        expect(screen.getByRole('button', { name: 'Disabled' })).toHaveAttribute(
            'aria-disabled',
            'true'
        );
    });

    it('applies variant styles correctly', () => {
        const { rerender } = render(
            <AccessibleButton variant="primary">Primary</AccessibleButton>
        );
        expect(screen.getByRole('button')).toHaveClass('bg-primary-500');

        rerender(<AccessibleButton variant="secondary">Secondary</AccessibleButton>);
        expect(screen.getByRole('button')).toHaveClass('bg-secondary-500');

        rerender(<AccessibleButton variant="danger">Danger</AccessibleButton>);
        expect(screen.getByRole('button')).toHaveClass('bg-red-600');

        rerender(<AccessibleButton variant="ghost">Ghost</AccessibleButton>);
        expect(screen.getByRole('button')).toHaveClass('bg-transparent');
    });

    it('applies size styles correctly', () => {
        const { rerender } = render(
            <AccessibleButton size="sm">Small</AccessibleButton>
        );
        expect(screen.getByRole('button')).toHaveClass('px-3', 'py-1.5');

        rerender(<AccessibleButton size="md">Medium</AccessibleButton>);
        expect(screen.getByRole('button')).toHaveClass('px-4', 'py-2');

        rerender(<AccessibleButton size="lg">Large</AccessibleButton>);
        expect(screen.getByRole('button')).toHaveClass('px-6', 'py-3');
    });

    it('applies fullWidth style', () => {
        render(<AccessibleButton fullWidth>Full Width</AccessibleButton>);
        expect(screen.getByRole('button')).toHaveClass('w-full');
    });

    it('supports custom aria-label', () => {
        render(
            <AccessibleButton ariaLabel="Custom label">Button</AccessibleButton>
        );
        expect(screen.getByRole('button')).toHaveAttribute(
            'aria-label',
            'Custom label'
        );
    });

    it('meets WCAG touch target minimum (44px)', () => {
        render(<AccessibleButton>Touch</AccessibleButton>);
        expect(screen.getByRole('button')).toHaveClass('min-h-[44px]', 'min-w-[44px]');
    });

    it('handles keyboard activation with Enter', async () => {
        const user = userEvent.setup();
        const handleClick = vi.fn();

        render(<AccessibleButton onClick={handleClick}>Key</AccessibleButton>);
        const button = screen.getByRole('button');
        button.focus();
        await user.keyboard('{Enter}');

        expect(handleClick).toHaveBeenCalledOnce();
    });

    it('handles keyboard activation with Space', async () => {
        const user = userEvent.setup();
        const handleClick = vi.fn();

        render(<AccessibleButton onClick={handleClick}>Space</AccessibleButton>);
        const button = screen.getByRole('button');
        button.focus();
        await user.keyboard(' ');

        expect(handleClick).toHaveBeenCalledOnce();
    });
});
