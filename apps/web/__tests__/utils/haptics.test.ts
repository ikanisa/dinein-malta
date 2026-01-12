/**
 * Basic test for haptics utility
 * Phase 1: Basic testing setup
 */

import { haptic, hapticButton, hapticSuccess, hapticError } from '../../utils/haptics';

// Mock navigator.vibrate
const mockVibrate = jest.fn();
Object.defineProperty(navigator, 'vibrate', {
  writable: true,
  value: mockVibrate,
});

describe('Haptics Utilities', () => {
  beforeEach(() => {
    mockVibrate.mockClear();
  });

  it('should vibrate on haptic() call', () => {
    haptic('medium');
    expect(mockVibrate).toHaveBeenCalledWith(10);
  });

  it('should vibrate on hapticButton() call', () => {
    hapticButton();
    expect(mockVibrate).toHaveBeenCalledWith(5);
  });

  it('should vibrate success pattern on hapticSuccess() call', () => {
    hapticSuccess();
    expect(mockVibrate).toHaveBeenCalledWith([10, 50, 10]);
  });

  it('should vibrate error pattern on hapticError() call', () => {
    hapticError();
    expect(mockVibrate).toHaveBeenCalledWith([30, 100, 30]);
  });

  it('should handle missing vibrate support gracefully', () => {
    const originalVibrate = navigator.vibrate;
    // @ts-expect-error -- navigator.vibrate can be undefined
    navigator.vibrate = undefined;
    
    expect(() => hapticButton()).not.toThrow();
    
    // Restore
    // @ts-expect-error -- restore to the original mocked function
    navigator.vibrate = originalVibrate;
  });
});
