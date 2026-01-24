import { useState, useRef, useCallback, ReactNode } from 'react';
import { RefreshCw } from 'lucide-react';

interface PullToRefreshProps {
    children: ReactNode;
    onRefresh: () => Promise<void>;
    disabled?: boolean;
}

const PULL_THRESHOLD = 80;
const RESISTANCE = 2.5;

export function PullToRefresh({ children, onRefresh, disabled = false }: PullToRefreshProps) {
    const [pullDistance, setPullDistance] = useState(0);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const startY = useRef(0);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        if (disabled || isRefreshing) return;

        const container = containerRef.current;
        if (!container || container.scrollTop > 0) return;

        startY.current = e.touches[0].clientY;
    }, [disabled, isRefreshing]);

    const handleTouchMove = useCallback((e: React.TouchEvent) => {
        if (disabled || isRefreshing || startY.current === 0) return;

        const container = containerRef.current;
        if (!container || container.scrollTop > 0) {
            startY.current = 0;
            setPullDistance(0);
            return;
        }

        const currentY = e.touches[0].clientY;
        const diff = currentY - startY.current;

        if (diff > 0) {
            // Apply resistance to make it feel natural
            const adjustedDiff = diff / RESISTANCE;
            setPullDistance(Math.min(adjustedDiff, PULL_THRESHOLD * 1.5));
        }
    }, [disabled, isRefreshing]);

    const handleTouchEnd = useCallback(async () => {
        if (disabled || isRefreshing) return;

        if (pullDistance >= PULL_THRESHOLD) {
            setIsRefreshing(true);
            try {
                await onRefresh();
            } catch (error) {
                console.error('Refresh failed:', error);
            } finally {
                setIsRefreshing(false);
            }
        }

        startY.current = 0;
        setPullDistance(0);
    }, [disabled, isRefreshing, pullDistance, onRefresh]);

    const progress = Math.min(pullDistance / PULL_THRESHOLD, 1);
    const showIndicator = pullDistance > 10 || isRefreshing;

    return (
        <div
            ref={containerRef}
            className="relative overflow-auto h-full"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            {/* Pull indicator */}
            <div
                className="absolute left-1/2 -translate-x-1/2 z-50 transition-all duration-200"
                style={{
                    top: isRefreshing ? 16 : pullDistance - 40,
                    opacity: showIndicator ? 1 : 0,
                    transform: `translateX(-50%) scale(${0.8 + progress * 0.2})`,
                }}
            >
                <div className={`
                    w-10 h-10 rounded-full bg-white shadow-lg border border-slate-100
                    flex items-center justify-center
                    ${isRefreshing ? 'animate-spin' : ''}
                `}>
                    <RefreshCw
                        className="w-5 h-5 text-orange-500"
                        style={{
                            transform: isRefreshing ? 'none' : `rotate(${progress * 180}deg)`,
                        }}
                    />
                </div>
            </div>

            {/* Content with pull offset */}
            <div
                style={{
                    transform: `translateY(${isRefreshing ? 48 : pullDistance}px)`,
                    transition: pullDistance === 0 && !isRefreshing ? 'transform 0.2s ease-out' : 'none',
                }}
            >
                {children}
            </div>
        </div>
    );
}
