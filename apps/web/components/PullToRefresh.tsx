import React, { useState, useRef } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { hapticButton, hapticSuccess } from '../utils/haptics';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  scrollContainerId?: string; // ID of the scrolling element to check scrollTop
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({ onRefresh, children, scrollContainerId = 'main-scroll' }) => {
  const [isPulling, setIsPulling] = useState(false);
  const [pullHeight, setPullHeight] = useState(0);
  const [loading, setLoading] = useState(false);
  const contentControls = useAnimation();
  const indicatorControls = useAnimation();
  
  const startY = useRef(0);
  const currentY = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Configuration
  const THRESHOLD = 80;
  const MAX_PULL = 120;

  const handleTouchStart = (e: React.TouchEvent) => {
    const scrollEl = document.getElementById(scrollContainerId);
    // Only enable pull if we are at the very top of the scroll container
    if (scrollEl && scrollEl.scrollTop <= 0 && !loading) {
        startY.current = e.touches[0].clientY;
        setIsPulling(true);
    } else {
        setIsPulling(false);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isPulling || loading) return;
    
    currentY.current = e.touches[0].clientY;
    const delta = currentY.current - startY.current;

    // Apply resistance (logarithmic) to mimic native feel
    if (delta > 0) {
        // Prevent default browser refresh if we are handling it
        if (e.cancelable) {
            // e.preventDefault(); // Careful with this on passive listeners
        }
        
        const damped = Math.min(delta * 0.4, MAX_PULL);
        setPullHeight(damped);
        
        // Visual feedback
        contentControls.set({ y: damped });
        indicatorControls.set({ y: damped / 2, opacity: Math.min(damped / THRESHOLD, 1) });
    }
  };

  const handleTouchEnd = async () => {
    if (!isPulling || loading) return;
    setIsPulling(false);

    if (pullHeight > THRESHOLD) {
        // Trigger Refresh
        setLoading(true);
        hapticButton();
        
        // Snap to loading position
        contentControls.start({ y: 50, transition: { type: "spring", stiffness: 300, damping: 30 } });
        
        try {
            await onRefresh();
        } finally {
            // Reset
            setLoading(false);
            setPullHeight(0);
            contentControls.start({ y: 0 });
            hapticSuccess();
        }
    } else {
        // Snap back if not enough pull
        setPullHeight(0);
        contentControls.start({ y: 0 });
    }
  };

  return (
    <div 
        ref={containerRef}
        className="relative w-full h-full"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
    >
        {/* Dynamic Island Loading Indicator */}
        <motion.div 
            initial={{ y: -50, opacity: 0 }}
            animate={loading ? { y: 20, opacity: 1 } : indicatorControls}
            className="absolute top-0 left-0 right-0 z-50 flex justify-center pointer-events-none"
        >
            <div className={`
                bg-black/80 backdrop-blur-md rounded-full flex items-center justify-center transition-all duration-300
                ${loading ? 'w-10 h-10' : 'w-8 h-8'}
                shadow-xl border border-white/10
            `}>
                {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                    <span className={`text-white text-xs transform transition-transform ${pullHeight > THRESHOLD ? 'rotate-180' : ''}`}>
                        ⬇
                    </span>
                )}
            </div>
        </motion.div>

        {/* Content Wrapper */}
        <motion.div animate={contentControls} className="w-full h-full">
            {children}
        </motion.div>
    </div>
  );
};
