/**
 * Optimized Image Component
 * Supports WebP, responsive images, lazy loading, and placeholder
 */

import React, { useState, useEffect, useRef } from 'react';

export interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  aspectRatio?: string; // e.g., "4/3", "16/9"
  placeholder?: string; // Base64 or URL for placeholder
  sizes?: string; // Responsive image sizes
  priority?: boolean; // Load immediately (skip lazy loading)
  onLoad?: () => void;
  onError?: () => void;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = React.memo(({
  src,
  alt,
  aspectRatio,
  placeholder,
  sizes = '100vw',
  priority = false,
  className = '',
  onLoad,
  onError,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(priority);
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || shouldLoad) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShouldLoad(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '50px', // Start loading 50px before image enters viewport
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
      observerRef.current = observer;
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [priority, shouldLoad]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  // Generate WebP src if possible (browser supports WebP)
  const getOptimizedSrc = () => {
    if (!src) return '';
    
    // If already WebP or data URL, return as-is
    if (src.startsWith('data:') || src.includes('.webp')) {
      return src;
    }

    // For external URLs, try to use WebP if supported
    // Note: In production, you'd want server-side WebP conversion
    // For now, we'll use the original src
    return src;
  };

  const containerStyle: React.CSSProperties = {
    position: 'relative',
    overflow: 'hidden',
    ...(aspectRatio && {
      aspectRatio,
    }),
    ...(props.style || {}),
  };

  return (
    <div
      ref={imgRef}
      className={`relative ${className}`}
      style={containerStyle}
    >
      {/* Placeholder (blur-up effect) */}
      {placeholder && !isLoaded && (
        <img
          src={placeholder}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover blur-sm scale-110"
          style={{ filter: 'blur(10px)', transform: 'scale(1.1)' }}
        />
      )}

      {/* Skeleton while loading */}
      {!isLoaded && !placeholder && (
        <div className="absolute inset-0 bg-gray-200 dark:bg-white/10 animate-pulse" />
      )}

      {/* Actual image */}
      {(shouldLoad || priority) && (
        <img
          src={getOptimizedSrc()}
          alt={alt}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          sizes={sizes}
          onLoad={handleLoad}
          onError={handleError}
          {...props}
        />
      )}

      {/* Error state */}
      {hasError && (
        <div className="absolute inset-0 bg-gray-200 dark:bg-white/10 flex items-center justify-center">
          <span className="text-gray-400 text-xs">Failed to load image</span>
        </div>
      )}
    </div>
  );
});

OptimizedImage.displayName = 'OptimizedImage';

