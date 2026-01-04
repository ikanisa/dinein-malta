/**
 * Tests for OptimizedImage component
 */

import { render, screen, waitFor } from '@testing-library/react';
import { OptimizedImage } from '../../components/OptimizedImage';

describe('OptimizedImage', () => {
  const defaultProps = {
    src: 'https://example.com/image.jpg',
    alt: 'Test image',
  };

  it('renders with required props', () => {
    render(<OptimizedImage {...defaultProps} />);
    const container = screen.getByRole('img').closest('div');
    expect(container).toBeInTheDocument();
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

  it('uses lazy loading when priority is false', () => {
    render(<OptimizedImage {...defaultProps} priority={false} />);
    const img = screen.getByAltText('Test image');
    expect(img).toHaveAttribute('loading', 'lazy');
  });

  it('applies aspect ratio style', () => {
    const { container } = render(<OptimizedImage {...defaultProps} aspectRatio="4/3" />);
    const div = container.firstChild as HTMLElement;
    expect(div.style.aspectRatio).toBe('4 / 3');
  });
});

