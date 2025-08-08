/**
 * Tests for Toggle component
 */

import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Toggle, toggleVariants } from '@/components/toggle'
import * as TogglePrimitive from '@radix-ui/react-toggle'

describe('Toggle', () => {
  describe('component', () => {
    it('should render toggle button', () => {
      render(<Toggle>Toggle</Toggle>)
      const toggle = screen.getByRole('button')
      expect(toggle).toBeInTheDocument()
      expect(toggle).toHaveTextContent('Toggle')
    })

    it('should apply default variant and size classes', () => {
      render(<Toggle>Toggle</Toggle>)
      const toggle = screen.getByRole('button')
      expect(toggle).toHaveClass('border', 'border-input', 'h-10', 'px-3')
    })

    it('should apply custom className', () => {
      render(<Toggle className="custom-class">Toggle</Toggle>)
      const toggle = screen.getByRole('button')
      expect(toggle).toHaveClass('custom-class')
    })

    it('should handle different variants', () => {
      const { rerender } = render(<Toggle variant="default">Toggle</Toggle>)
      let toggle = screen.getByRole('button')
      expect(toggle).toHaveClass('bg-transparent')
      expect(toggle).not.toHaveClass('border')

      rerender(<Toggle variant="outline">Toggle</Toggle>)
      toggle = screen.getByRole('button')
      expect(toggle).toHaveClass('border', 'border-input')
    })

    it('should handle different sizes', () => {
      const { rerender } = render(<Toggle size="sm">Toggle</Toggle>)
      let toggle = screen.getByRole('button')
      expect(toggle).toHaveClass('h-9', 'px-2.5')

      rerender(<Toggle size="default">Toggle</Toggle>)
      toggle = screen.getByRole('button')
      expect(toggle).toHaveClass('h-10', 'px-3')

      rerender(<Toggle size="lg">Toggle</Toggle>)
      toggle = screen.getByRole('button')
      expect(toggle).toHaveClass('h-11', 'px-5')
    })

    it('should toggle state on click', async () => {
      const user = userEvent.setup()
      render(<Toggle>Toggle</Toggle>)
      const toggle = screen.getByRole('button')

      expect(toggle).toHaveAttribute('data-state', 'off')
      
      await user.click(toggle)
      expect(toggle).toHaveAttribute('data-state', 'on')
      
      await user.click(toggle)
      expect(toggle).toHaveAttribute('data-state', 'off')
    })

    it('should forward ref correctly', () => {
      const ref = React.createRef<HTMLButtonElement>()
      render(<Toggle ref={ref}>Toggle</Toggle>)
      expect(ref.current).toBeInstanceOf(HTMLButtonElement)
    })

    it('should pass through additional props', () => {
      render(<Toggle data-testid="custom-toggle" aria-label="Custom Toggle">Toggle</Toggle>)
      const toggle = screen.getByTestId('custom-toggle')
      expect(toggle).toHaveAttribute('aria-label', 'Custom Toggle')
    })

    it('should handle disabled state', () => {
      render(<Toggle disabled>Toggle</Toggle>)
      const toggle = screen.getByRole('button')
      expect(toggle).toBeDisabled()
      expect(toggle).toHaveClass('disabled:pointer-events-none', 'disabled:opacity-50')
    })

    it('should have correct displayName', () => {
      expect(Toggle.displayName).toBe(TogglePrimitive.Root.displayName)
    })
  })

  describe('toggleVariants', () => {
    it('should generate correct classes for default variant', () => {
      const classes = toggleVariants({ variant: 'default', size: 'default' })
      expect(classes).toContain('bg-transparent')
      expect(classes).toContain('h-10')
      expect(classes).toContain('px-3')
    })

    it('should generate correct classes for outline variant', () => {
      const classes = toggleVariants({ variant: 'outline', size: 'default' })
      expect(classes).toContain('border')
      expect(classes).toContain('border-input')
    })

    it('should generate correct classes for different sizes', () => {
      expect(toggleVariants({ size: 'sm' })).toContain('h-9')
      expect(toggleVariants({ size: 'default' })).toContain('h-10')
      expect(toggleVariants({ size: 'lg' })).toContain('h-11')
    })

    it('should use default variants when not specified', () => {
      const classes = toggleVariants({})
      expect(classes).toContain('border') // outline variant
      expect(classes).toContain('h-10') // default size
    })

    it('should include base classes', () => {
      const classes = toggleVariants({})
      expect(classes).toContain('inline-flex')
      expect(classes).toContain('items-center')
      expect(classes).toContain('justify-center')
      expect(classes).toContain('rounded-md')
    })
  })
})