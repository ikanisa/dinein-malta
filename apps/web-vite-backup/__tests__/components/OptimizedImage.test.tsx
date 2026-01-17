/**
 * Tests for OptimizedImage component
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

// Mock react-lazy-load-image-component to avoid issues with IntersectionObserver
vi.mock('react-lazy-load-image-component', () => ({
  LazyLoadImage: ({ src, alt, onError, afterLoad, className, style, ...props }: {
    src: string;
    alt: string;
    onError?: () => void;
    afterLoad?: () => void;
    className?: string;
    style?: React.CSSProperties;
  }) => (
    <img
      src={src}
      alt={alt}
      className={className}
      style={style}
      loading="lazy"
      onLoad={afterLoad}
      onError={onError}
      {...props}
    />
  ),
}));

import { OptimizedImage } from '../../components/OptimizedImage';

describe('OptimizedImage', () => {
  const defaultProps = {
    src: 'https://example.com/image.jpg',
    alt: 'Test image',
  };

  it('renders with required props', () => {
    render(<OptimizedImage {...defaultProps} priority />);
    const img = screen.getByAltText('Test image');
    expect(img).toBeInTheDocument();
  });

  it('renders placeholder when provided (priority mode)', () => {
    render(<OptimizedImage {...defaultProps} priority placeholder="data:image/jpeg;base64,..." />);
    const img = screen.getByAltText('Test image');
    expect(img).toBeInTheDocument();
  });

  it('loads image with priority immediately using eager loading', () => {
    render(<OptimizedImage {...defaultProps} priority />);
    const img = screen.getByAltText('Test image');
    expect(img).toHaveAttribute('loading', 'eager');
  });

  it('uses lazy loading when priority is false', () => {
    render(<OptimizedImage {...defaultProps} priority={false} />);
    const img = screen.getByAltText('Test image');
    expect(img).toHaveAttribute('loading', 'lazy');
  });

  it('applies aspect ratio style', () => {
    const { container } = render(<OptimizedImage {...defaultProps} aspectRatio="4/3" priority />);
    const div = container.firstChild as HTMLElement;
    expect(div.style.aspectRatio).toBe('4/3');
  });

  it('applies object-fit style', () => {
    render(<OptimizedImage {...defaultProps} objectFit="contain" priority />);
    const img = screen.getByAltText('Test image');
    expect(img).toHaveStyle({ objectFit: 'contain' });
  });

  it('applies custom className', () => {
    render(<OptimizedImage {...defaultProps} className="my-custom-class" priority />);
    const img = screen.getByAltText('Test image');
    expect(img).toHaveClass('my-custom-class');
  });
});
