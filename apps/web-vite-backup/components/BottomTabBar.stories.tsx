import type { Meta, StoryObj } from '@storybook/react';
import { BottomTabBar } from './BottomTabBar';
import { MemoryRouter } from 'react-router-dom';

const meta: Meta<typeof BottomTabBar> = {
    title: 'Navigation/BottomTabBar',
    component: BottomTabBar,
    parameters: {
        layout: 'fullscreen',
    },
    tags: ['autodocs'],
    decorators: [
        (Story) => (
            <MemoryRouter>
                <div className="h-screen relative">
                    <div className="p-4 pb-24">
                        <p className="text-muted">Page content goes here...</p>
                    </div>
                    <Story />
                </div>
            </MemoryRouter>
        ),
    ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {},
};

export const WithCartCount: Story = {
    args: {
        cartCount: 5,
    },
};

export const WithLargeCartCount: Story = {
    args: {
        cartCount: 150,
    },
};

export const WithVenueId: Story = {
    args: {
        cartCount: 3,
        venueId: 'demo-restaurant',
    },
};

export const Hidden: Story = {
    args: {
        visible: false,
    },
};
