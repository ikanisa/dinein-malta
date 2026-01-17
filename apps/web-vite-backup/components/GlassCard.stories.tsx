import type { Meta, StoryObj } from '@storybook/react';
import { GlassCard } from './GlassCard';

const meta: Meta<typeof GlassCard> = {
    title: 'UI/GlassCard',
    component: GlassCard,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
    argTypes: {
        variant: {
            control: 'select',
            options: ['default', 'elevated', 'inset'],
        },
        noPadding: {
            control: 'boolean',
        },
        glow: {
            control: 'boolean',
        },
        accent: {
            control: 'select',
            options: ['none', 'primary', 'secondary'],
        },
    },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        children: (
            <div className="text-center min-w-[200px]">
                <h3 className="text-lg font-semibold mb-2">Glass Card</h3>
                <p className="text-muted">A glass morphism card component.</p>
            </div>
        ),
    },
};

export const Elevated: Story = {
    args: {
        variant: 'elevated',
        children: (
            <div className="text-center min-w-[200px]">
                <h3 className="text-lg font-semibold mb-2">Elevated</h3>
                <p className="text-muted">More prominent shadow.</p>
            </div>
        ),
    },
};

export const Inset: Story = {
    args: {
        variant: 'inset',
        children: (
            <div className="text-center min-w-[200px]">
                <h3 className="text-lg font-semibold mb-2">Inset</h3>
                <p className="text-muted">Inset appearance.</p>
            </div>
        ),
    },
};

export const WithGlow: Story = {
    args: {
        glow: true,
        children: (
            <div className="text-center min-w-[200px]">
                <h3 className="text-lg font-semibold mb-2">Glow Effect</h3>
                <p className="text-muted">Hover to see glow.</p>
            </div>
        ),
    },
};

export const PrimaryAccent: Story = {
    args: {
        accent: 'primary',
        children: (
            <div className="text-center min-w-[200px]">
                <h3 className="text-lg font-semibold mb-2">Primary Accent</h3>
                <p className="text-muted">Left border accent.</p>
            </div>
        ),
    },
};
