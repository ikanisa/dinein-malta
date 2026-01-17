import type { Preview } from '@storybook/react';
import '../index.css';
import '../design-tokens.css';

const preview: Preview = {
    parameters: {
        controls: {
            matchers: {
                color: /(background|color)$/i,
                date: /Date$/i,
            },
        },
        backgrounds: {
            default: 'dark',
            values: [
                { name: 'dark', value: '#0E1120' },
                { name: 'light', value: '#ffffff' },
            ],
        },
    },
    decorators: [
        (Story) => (
            <div className="min-h-screen bg-background text-foreground p-4">
                <Story />
            </div>
        ),
    ],
};

export default preview;
