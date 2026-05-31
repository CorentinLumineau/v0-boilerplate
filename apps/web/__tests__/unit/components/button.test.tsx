import { describe, it, expect, jest } from '@jest/globals';
import { render, screen } from '../../setup/test-utils';
import userEvent from '@testing-library/user-event';
import { Button } from '@/components/ui/button';

describe('Button Component', () => {
  it('should render with correct text', () => {
    render(<Button>Click me</Button>);
    
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  it('should render with different variants', () => {
    const { rerender } = render(<Button variant="default">Default</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-primary');

    rerender(<Button variant="destructive">Destructive</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-destructive');

    rerender(<Button variant="outline">Outline</Button>);
    expect(screen.getByRole('button')).toHaveClass('border-input');
  });

  it('should render with different sizes', () => {
    const { rerender } = render(<Button size="default">Default</Button>);
    expect(screen.getByRole('button')).toHaveClass('h-10');

    rerender(<Button size="sm">Small</Button>);
    expect(screen.getByRole('button')).toHaveClass('h-9');

    rerender(<Button size="lg">Large</Button>);
    expect(screen.getByRole('button')).toHaveClass('h-11');
  });

  it('should handle click events', async () => {
    const mockClick = jest.fn();
    const user = userEvent.setup();
    
    render(<Button onClick={mockClick}>Click me</Button>);
    
    await user.click(screen.getByRole('button'));
    expect(mockClick).toHaveBeenCalledTimes(1);
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled Button</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveClass('disabled:opacity-50');
  });

  it('should not call onClick when disabled', async () => {
    const mockClick = jest.fn();
    const user = userEvent.setup();
    
    render(
      <Button onClick={mockClick} disabled>
        Disabled Button
      </Button>
    );
    
    await user.click(screen.getByRole('button'));
    expect(mockClick).not.toHaveBeenCalled();
  });

  it('should render as different HTML elements when asChild is used', () => {
    render(
      <Button asChild>
        <a href="/test">Link Button</a>
      </Button>
    );
    
    const link = screen.getByRole('link');
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/test');
  });

  it('should pass through additional props', () => {
    render(
      <Button data-testid="custom-button" aria-label="Custom button">
        Custom Button
      </Button>
    );
    
    const button = screen.getByTestId('custom-button');
    expect(button).toHaveAttribute('aria-label', 'Custom button');
  });

  it('should apply custom className alongside default classes', () => {
    render(
      <Button className="custom-class">Custom Button</Button>
    );
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('custom-class');
    expect(button).toHaveClass('inline-flex'); // Default class
  });
});