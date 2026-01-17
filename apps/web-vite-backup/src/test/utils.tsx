import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

/**
 * Create a test-specific QueryClient with disabled retries
 */
const createTestQueryClient = () =>
    new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
                gcTime: 0,
                staleTime: 0,
            },
            mutations: {
                retry: false,
            },
        },
    });

interface AllTheProvidersProps {
    children: React.ReactNode;
}

/**
 * Wraps components with all necessary providers for testing
 */
const AllTheProviders = ({ children }: AllTheProvidersProps) => {
    const testQueryClient = createTestQueryClient();

    return (
        <QueryClientProvider client={testQueryClient}>
            <BrowserRouter>{children}</BrowserRouter>
        </QueryClientProvider>
    );
};

/**
 * Custom render function that wraps components with providers
 */
const customRender = (
    ui: ReactElement,
    options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

// Re-export everything from testing-library
export * from '@testing-library/react';
export { customRender as render };

/**
 * Utility to wait for async operations in tests
 */
export const waitForAsync = (ms = 0) =>
    new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Create a deferred promise for testing async flows
 */
export function createDeferred<T>() {
    let resolve: (value: T) => void;
    let reject: (reason?: unknown) => void;
    const promise = new Promise<T>((res, rej) => {
        resolve = res;
        reject = rej;
    });
    return { promise, resolve: resolve!, reject: reject! };
}
