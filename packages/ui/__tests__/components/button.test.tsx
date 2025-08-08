/**
 * Tests for Button component
 */

import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button, buttonVariants } from '@/components/button'

describe('Button', () => {
  describe('component', () => {
    it('should render button', () => {
      render(<Button>Click me</Button>)
      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
      expect(button).toHaveTextContent('Click me')
    })

    it('should apply default variant and size classes', () => {
      render(<Button>Button</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('border', 'border-input', 'bg-background', 'h-10', 'px-4')
    })

    it('should apply custom className', () => {
      render(<Button className="custom-class">Button</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('custom-class')
    })

    it('should handle different variants', () => {
      const { rerender } = render(<Button variant="default">Button</Button>)
      let button = screen.getByRole('button')
      expect(button).toHaveClass('bg-primary', 'text-primary-foreground')

      rerender(<Button variant="destructive">Button</Button>)
      button = screen.getByRole('button')
      expect(button).toHaveClass('bg-red-500', 'text-white')

      rerender(<Button variant="outline">Button</Button>)
      button = screen.getByRole('button')
      expect(button).toHaveClass('border', 'border-input', 'bg-background')

      rerender(<Button variant="secondary">Button</Button>)
      button = screen.getByRole('button')
      expect(button).toHaveClass('bg-secondary', 'text-secondary-foreground')

      rerender(<Button variant="ghost">Button</Button>)
      button = screen.getByRole('button')
      expect(button).toHaveClass('hover:bg-accent')

      rerender(<Button variant="link">Button</Button>)
      button = screen.getByRole('button')
      expect(button).toHaveClass('text-primary', 'underline-offset-4')
    })

    it('should handle different sizes', () => {
      const { rerender } = render(<Button size="sm">Button</Button>)
      let button = screen.getByRole('button')
      expect(button).toHaveClass('h-9', 'rounded-md', 'px-3')

      rerender(<Button size="default">Button</Button>)
      button = screen.getByRole('button')
      expect(button).toHaveClass('h-10', 'px-4')

      rerender(<Button size="lg">Button</Button>)
      button = screen.getByRole('button')
      expect(button).toHaveClass('h-11', 'rounded-md', 'px-8')

      rerender(<Button size="icon">Button</Button>)
      button = screen.getByRole('button')
      expect(button).toHaveClass('h-10', 'w-10')
    })

    it('should handle click events', async () => {
      const handleClick = jest.fn()
      const user = userEvent.setup()
      
      render(<Button onClick={handleClick}>Click me</Button>)
      const button = screen.getByRole('button')
      
      await user.click(button)
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('should handle disabled state', () => {
      render(<Button disabled>Button</Button>)
      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
      expect(button).toHaveClass('disabled:pointer-events-none', 'disabled:opacity-50')
    })

    it('should forward ref correctly', () => {
      const ref = React.createRef<HTMLButtonElement>()
      render(<Button ref={ref}>Button</Button>)
      expect(ref.current).toBeInstanceOf(HTMLButtonElement)
    })

    it('should work as different elements with asChild', () => {
      render(
        <Button asChild>
          <a href="/test">Link Button</a>
        </Button>
      )
      const link = screen.getByRole('link')
      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute('href', '/test')
    })

    it('should pass through additional props', () => {
      render(
        <Button data-testid="custom-button" aria-label="Custom Button">
          Button
        </Button>
      )
      const button = screen.getByTestId('custom-button')
      expect(button).toHaveAttribute('aria-label', 'Custom Button')
    })
  })

  describe('buttonVariants', () => {
    it('should generate correct classes for default variant', () => {
      const classes = buttonVariants({ variant: 'default', size: 'default' })
      expect(classes).toContain('bg-primary')
      expect(classes).toContain('text-primary-foreground')
      expect(classes).toContain('h-10')
    })

    it('should generate correct classes for all variants', () => {
      expect(buttonVariants({ variant: 'destructive' })).toContain('bg-red-500')
      expect(buttonVariants({ variant: 'outline' })).toContain('border')
      expect(buttonVariants({ variant: 'secondary' })).toContain('bg-secondary')
      expect(buttonVariants({ variant: 'ghost' })).toContain('hover:bg-accent')
      expect(buttonVariants({ variant: 'link' })).toContain('text-primary')
    })

    it('should generate correct classes for all sizes', () => {
      expect(buttonVariants({ size: 'sm' })).toContain('h-9')
      expect(buttonVariants({ size: 'default' })).toContain('h-10')
      expect(buttonVariants({ size: 'lg' })).toContain('h-11')
      expect(buttonVariants({ size: 'icon' })).toContain('w-10')
    })

    it('should use default variants when not specified', () => {
      const classes = buttonVariants({})
      expect(classes).toContain('border')
      expect(classes).toContain('border-input')
      expect(classes).toContain('bg-background')
      expect(classes).toContain('h-10')
    })

    it('should include base classes', () => {
      const classes = buttonVariants({})
      expect(classes).toContain('inline-flex')
      expect(classes).toContain('items-center')
      expect(classes).toContain('justify-center')
      expect(classes).toContain('rounded-md')
    })
  })
})