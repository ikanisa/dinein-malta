import { useCallback, useRef } from 'react';
import { LONG_PRESS_DURATION_MS } from './useGestureThresholds';

export interface UseLongPressOptions {
    /** Callback when long-press is detected */
    onLongPress: () => void;
    /** Duration in ms before triggering (default: 400ms) */
    duration?: number;
    /** Callback on regular press (short tap) */
    onPress?: () => void;
    /** Disable long-press detection */
    disabled?: boolean;
}

export interface LongPressHandlers {
    onPointerDown: (e: React.PointerEvent) => void;
    onPointerUp: (e: React.PointerEvent) => void;
    onPointerLeave: (e: React.PointerEvent) => void;
    onPointerCancel: (e: React.PointerEvent) => void;
    onContextMenu: (e: React.MouseEvent) => void;
}

/**
 * Hook for detecting long-press gestures.
 * Returns pointer handlers to attach to an element.
 * Cancels on pointer leave, scroll, or early release.
 */
export function useLongPress({
    onLongPress,
    duration = LONG_PRESS_DURATION_MS,
    onPress,
    disabled = false,
}: UseLongPressOptions): LongPressHandlers {
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isLongPressTriggered = useRef(false);
    const startPosition = useRef<{ x: number; y: number } | null>(null);

    const clear = useCallback(() => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
    }, []);

    const onPointerDown = useCallback(
        (e: React.PointerEvent) => {
            if (disabled) return;

            // Store initial position to detect scroll
            startPosition.current = { x: e.clientX, y: e.clientY };
            isLongPressTriggered.current = false;

            timerRef.current = setTimeout(() => {
                isLongPressTriggered.current = true;
                onLongPress();
            }, duration);
        },
        [disabled, duration, onLongPress]
    );

    const onPointerUp = useCallback(
        (e: React.PointerEvent) => {
            if (disabled) return;

            clear();

            // If long-press wasn't triggered, treat as regular press
            if (!isLongPressTriggered.current && onPress) {
                // Only trigger if pointer didn't move much
                if (startPosition.current) {
                    const dx = Math.abs(e.clientX - startPosition.current.x);
                    const dy = Math.abs(e.clientY - startPosition.current.y);
                    if (dx < 10 && dy < 10) {
                        onPress();
                    }
                }
            }

            startPosition.current = null;
        },
        [disabled, clear, onPress]
    );

    const onPointerLeave = useCallback(() => {
        clear();
        startPosition.current = null;
    }, [clear]);

    const onPointerCancel = useCallback(() => {
        clear();
        startPosition.current = null;
    }, [clear]);

    // Prevent context menu on long-press (especially on mobile)
    const onContextMenu = useCallback((e: React.MouseEvent) => {
        if (isLongPressTriggered.current) {
            e.preventDefault();
        }
    }, []);

    return {
        onPointerDown,
        onPointerUp,
        onPointerLeave,
        onPointerCancel,
        onContextMenu,
    };
}
