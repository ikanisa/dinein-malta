/**
 * Optimized Image Component
 * Enhanced with react-lazy-load-image-component for blur-up effect
 * Supports WebP, responsive images, lazy loading, and placeholder
 */

import React, { useState } from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';

export interface OptimizedImageProps {
  src: string;
  alt: string;
  aspectRatio?: string; // e.g., "4/3", "16/9"
  placeholder?: string; // Base64 or URL for placeholder (LQIP)
  sizes?: string; // Responsive image sizes
  priority?: boolean; // Load immediately (skip lazy loading)
  className?: string;
  wrapperClassName?: string;
  width?: number | string;
  height?: number | string;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  onLoad?: () => void;
  onError?: () => void;
}

/**
 * Generate WebP/AVIF sources for modern image formats
 * Falls back to original format if not supported
 */
const generateModernFormatSrc = (src: string, format: 'webp' | 'avif'): string => {
  if (!src || src.startsWith('data:')) return src;
  
  // For Supabase Storage URLs, use format parameter
  if (src.includes('supabase.co/storage')) {
    const separator = src.includes('?') ? '&' : '?';
    return `${src}${separator}format=${format}`;
  }
  
  // For other URLs, try to replace extension (basic implementation)
  // In production, you'd want a more robust solution or use an image CDN
  const ext = src.split('.').pop()?.toLowerCase();
  if (ext && ['jpg', 'jpeg', 'png'].includes(ext)) {
    return src.replace(/\.(jpg|jpeg|png)$/i, `.${format}`);
  }
  
  return src;
};

/**
 * Generate srcset for responsive images
 */
const generateSrcSet = (src: string, format?: 'webp' | 'avif'): string | undefined => {
  if (!src || src.startsWith('data:')) {
    return undefined;
  }

  const baseSrc = format ? generateModernFormatSrc(src, format) : src;
  const widths = [320, 640, 960, 1280, 1920];

  // For Supabase Storage URLs, append width transforms
  if (src.includes('supabase.co/storage')) {
    const separator = baseSrc.includes('?') ? '&' : '?';
    return widths
      .map(w => `${baseSrc}${separator}width=${w}&quality=80 ${w}w`)
      .join(', ');
  }

  // For other URLs, generate responsive srcset
  // Note: This assumes your image service supports width parameters
  return widths
    .map(w => `${baseSrc}?w=${w} ${w}w`)
    .join(', ');
};

/**
 * Generate responsive sizes attribute
 */
const generateSizes = (customSizes?: string): string => {
  if (customSizes) return customSizes;
  return '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw';
};

export const OptimizedImage: React.FC<OptimizedImageProps> = React.memo(({
  src,
  alt,
  aspectRatio,
  placeholder,
  sizes,
  priority = false,
  className = '',
  wrapperClassName = '',
  width,
  height,
  objectFit = 'cover',
  onLoad,
  onError,
}) => {
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  const containerStyle: React.CSSProperties = {
    position: 'relative',
    overflow: 'hidden',
    ...(aspectRatio && { aspectRatio }),
  };

  const imageStyle: React.CSSProperties = {
    objectFit,
    width: '100%',
    height: '100%',
  };

  // For priority images, use picture element with WebP/AVIF support (optimized for LCP)
  if (priority) {
    const webpSrcSet = generateSrcSet(src, 'webp');
    const avifSrcSet = generateSrcSet(src, 'avif');
    const fallbackSrcSet = generateSrcSet(src);

    return (
      <div className={`relative ${wrapperClassName}`} style={containerStyle}>
        <picture>
          {/* AVIF format (best compression, modern browsers) */}
          {avifSrcSet && (
            <source
              type="image/avif"
              srcSet={avifSrcSet}
              sizes={generateSizes(sizes)}
            />
          )}
          {/* WebP format (good compression, wide support) */}
          {webpSrcSet && (
            <source
              type="image/webp"
              srcSet={webpSrcSet}
              sizes={generateSizes(sizes)}
            />
          )}
          {/* Fallback to original format */}
          <img
            src={src}
            alt={alt}
            className={`w-full h-full ${className}`}
            style={aspectRatio ? { ...imageStyle, aspectRatio } : imageStyle}
            loading="eager"
            decoding="async"
            fetchPriority="high"
            sizes={generateSizes(sizes)}
            srcSet={fallbackSrcSet}
            onLoad={onLoad}
            onError={handleError}
            width={width}
            height={height}
          />
        </picture>
        {hasError && (
          <div className="absolute inset-0 bg-gray-200 dark:bg-white/10 flex items-center justify-center" role="img" aria-label="Image failed to load">
            <span className="text-gray-400 text-xs">Failed to load</span>
          </div>
        )}
      </div>
    );
  }

  // For lazy images, use react-lazy-load-image-component with blur effect
  return (
    <div className={`relative ${wrapperClassName}`} style={containerStyle}>
      <LazyLoadImage
        src={src}
        alt={alt}
        effect="blur"
        className={`w-full h-full ${className}`}
        style={imageStyle}
        placeholderSrc={placeholder}
        threshold={100}
        afterLoad={onLoad}
        onError={handleError}
        width={width}
        height={height}
        wrapperClassName="!w-full !h-full"
      />
      {hasError && (
        <div className="absolute inset-0 bg-gray-200 dark:bg-white/10 flex items-center justify-center">
          <span className="text-gray-400 text-xs">Failed to load</span>
        </div>
      )}
    </div>
  );
});

OptimizedImage.displayName = 'OptimizedImage';

/**
 * Hero Image - Priority loaded, optimized for LCP
 */
export const HeroImage: React.FC<Omit<OptimizedImageProps, 'priority'>> = (props) => (
  <OptimizedImage {...props} priority />
);

/**
 * Thumbnail Image - Small, eager lazy loading with low threshold
 */
export const ThumbnailImage: React.FC<OptimizedImageProps> = (props) => (
  <OptimizedImage
    {...props}
    sizes="(max-width: 640px) 50vw, 150px"
  />
);

/**
 * Avatar Image - Circular, small
 */
export const AvatarImage: React.FC<OptimizedImageProps & { size?: number }> = ({
  size = 40,
  className = '',
  ...props
}) => (
  <OptimizedImage
    {...props}
    width={size}
    height={size}
    className={`rounded-full ${className}`}
    wrapperClassName="rounded-full overflow-hidden"
    aspectRatio="1/1"
  />
);
