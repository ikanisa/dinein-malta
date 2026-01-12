/**
 * Tests for OptimizedImage component
 */

import { render, screen } from '@testing-library/react';
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

  it('shows placeholder while loading', () => {
    render(<OptimizedImage {...defaultProps} placeholder="data:image/jpeg;base64,..." />);
    const placeholder = screen.getByAltText('');
    expect(placeholder).toBeInTheDocument();
  });

  it('loads image with priority immediately', () => {
    render(<OptimizedImage {...defaultProps} priority />);
    const img = screen.getByAltText('Test image');
    expect(img).toHaveAttribute('loading', 'eager');
  });

  it('uses lazy loading when priority is false', async () => {
    const originalObserver = global.IntersectionObserver;
    global.IntersectionObserver = jest.fn((callback: IntersectionObserverCallback) => ({
      observe: (element: Element) => {
        callback([{ isIntersecting: true, target: element } as IntersectionObserverEntry], {} as IntersectionObserver);
      },
      unobserve: jest.fn(),
      disconnect: jest.fn(),
      root: null,
      rootMargin: '',
      thresholds: [],
    })) as unknown as typeof IntersectionObserver;

    render(<OptimizedImage {...defaultProps} priority={false} />);
    const img = await screen.findByAltText('Test image');
    expect(img).toHaveAttribute('loading', 'lazy');

    global.IntersectionObserver = originalObserver;
  });

  it('applies aspect ratio style', () => {
    const { container } = render(<OptimizedImage {...defaultProps} aspectRatio="4/3" />);
    const div = container.firstChild as HTMLElement;
    expect(div.style.aspectRatio).toBe('4/3');
  });
});
