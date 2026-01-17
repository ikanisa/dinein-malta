import type { StorybookConfig } from '@storybook/react-vite';
import { mergeConfig } from 'vite';
import path from 'path';

const config: StorybookConfig = {
    stories: [
        '../components/**/*.stories.@(js|jsx|ts|tsx|mdx)',
        '../stories/**/*.stories.@(js|jsx|ts|tsx|mdx)',
    ],
    addons: [
        '@storybook/addon-essentials',
    ],
    framework: {
        name: '@storybook/react-vite',
        options: {},
    },
    viteFinal: async (config) => {
        return mergeConfig(config, {
            resolve: {
                alias: {
                    '@': path.resolve(__dirname, '..'),
                },
            },
        });
    },
    staticDirs: ['../public'],
};

export default config;
