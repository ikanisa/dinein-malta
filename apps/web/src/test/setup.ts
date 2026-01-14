import '@testing-library/jest-dom';
import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers);

// Cleanup after each test
afterEach(() => {
    cleanup();
});

// Mock Capacitor core
vi.mock('@capacitor/core', () => ({
    Capacitor: {
        isNativePlatform: () => false,
        getPlatform: () => 'web',
    },
}));

// Mock Capacitor Haptics
vi.mock('@capacitor/haptics', () => ({
    Haptics: {
        impact: vi.fn(),
        notification: vi.fn(),
        selectionStart: vi.fn(),
        selectionChanged: vi.fn(),
        selectionEnd: vi.fn(),
    },
    ImpactStyle: {
        Light: 'LIGHT',
        Medium: 'MEDIUM',
        Heavy: 'HEAVY',
    },
    NotificationType: {
        Success: 'SUCCESS',
        Warning: 'WARNING',
        Error: 'ERROR',
    },
}));

// Mock Capacitor StatusBar
vi.mock('@capacitor/status-bar', () => ({
    StatusBar: {
        setStyle: vi.fn(),
        setBackgroundColor: vi.fn(),
        hide: vi.fn(),
        show: vi.fn(),
    },
    Style: {
        Light: 'LIGHT',
        Dark: 'DARK',
    },
}));

// Mock haptics utility
vi.mock('@/utils/haptics', () => ({
    hapticButton: vi.fn(),
    hapticSuccess: vi.fn(),
    hapticError: vi.fn(),
    hapticSelection: vi.fn(),
}));

// Mock IntersectionObserver
class MockIntersectionObserver implements IntersectionObserver {
    readonly root: Element | Document | null = null;
    readonly rootMargin: string = '';
    readonly thresholds: ReadonlyArray<number> = [];

    constructor() { }
    disconnect() { }
    observe() { }
    takeRecords(): IntersectionObserverEntry[] {
        return [];
    }
    unobserve() { }
}

global.IntersectionObserver = MockIntersectionObserver as unknown as typeof IntersectionObserver;

// Mock ResizeObserver
class MockResizeObserver implements ResizeObserver {
    constructor() { }
    disconnect() { }
    observe() { }
    unobserve() { }
}

global.ResizeObserver = MockResizeObserver as unknown as typeof ResizeObserver;

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
    })),
});

// Mock localStorage
const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
    length: 0,
    key: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
});
