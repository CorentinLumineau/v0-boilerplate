/**
 * Tests for Badge component
 */

import React from 'react'
import { render, screen } from '@testing-library/react'
import { Badge, badgeVariants } from '@/components/badge'

describe('Badge', () => {
  describe('component', () => {
    it('should render badge', () => {
      render(<Badge>Badge text</Badge>)
      const badge = screen.getByText('Badge text')
      expect(badge).toBeInTheDocument()
    })

    it('should apply default variant classes', () => {
      render(<Badge>Badge text</Badge>)
      const badge = screen.getByText('Badge text')
      expect(badge).toHaveClass(
        'inline-flex',
        'items-center',
        'rounded-full',
        'border',
        'px-2.5',
        'py-0.5',
        'text-xs',
        'font-semibold',
        'border-transparent',
        'bg-primary',
        'text-primary-foreground'
      )
    })

    it('should apply custom className', () => {
      render(<Badge className="custom-badge">Badge text</Badge>)
      const badge = screen.getByText('Badge text')
      expect(badge).toHaveClass('custom-badge')
    })

    it('should handle different variants', () => {
      const { rerender } = render(<Badge variant="default">Badge</Badge>)
      let badge = screen.getByText('Badge')
      expect(badge).toHaveClass('bg-primary', 'text-primary-foreground')

      rerender(<Badge variant="secondary">Badge</Badge>)
      badge = screen.getByText('Badge')
      expect(badge).toHaveClass('bg-secondary', 'text-secondary-foreground')

      rerender(<Badge variant="destructive">Badge</Badge>)
      badge = screen.getByText('Badge')
      expect(badge).toHaveClass('bg-red-500', 'text-white')

      rerender(<Badge variant="outline">Badge</Badge>)
      badge = screen.getByText('Badge')
      expect(badge).toHaveClass('text-foreground')
      expect(badge).not.toHaveClass('border-transparent')
    })

    it('should handle hover states', () => {
      render(<Badge variant="default">Hover Badge</Badge>)
      const badge = screen.getByText('Hover Badge')
      expect(badge).toHaveClass('hover:bg-primary/80')
    })

    it('should handle focus states', () => {
      render(<Badge tabIndex={0}>Focusable Badge</Badge>)
      const badge = screen.getByText('Focusable Badge')
      expect(badge).toHaveClass(
        'focus:outline-none',
        'focus:ring-2',
        'focus:ring-ring',
        'focus:ring-offset-2'
      )
    })

    it('should pass through additional props', () => {
      render(
        <Badge 
          data-testid="badge" 
          aria-label="Status Badge"
          title="Badge tooltip"
        >
          Status
        </Badge>
      )
      const badge = screen.getByTestId('badge')
      expect(badge).toHaveAttribute('aria-label', 'Status Badge')
      expect(badge).toHaveAttribute('title', 'Badge tooltip')
    })

    it('should handle click events', () => {
      const handleClick = jest.fn()
      render(<Badge onClick={handleClick}>Clickable Badge</Badge>)
      const badge = screen.getByText('Clickable Badge')
      
      badge.click()
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('should support different content types', () => {
      const { rerender } = render(<Badge>Text Badge</Badge>)
      expect(screen.getByText('Text Badge')).toBeInTheDocument()

      rerender(
        <Badge>
          <span>Icon</span> Badge
        </Badge>
      )
      expect(screen.getByText('Icon')).toBeInTheDocument()
      expect(screen.getByText('Badge')).toBeInTheDocument()

      rerender(<Badge>123</Badge>)
      expect(screen.getByText('123')).toBeInTheDocument()
    })
  })

  describe('badgeVariants', () => {
    it('should generate correct classes for default variant', () => {
      const classes = badgeVariants({ variant: 'default' })
      expect(classes).toContain('bg-primary')
      expect(classes).toContain('text-primary-foreground')
      expect(classes).toContain('hover:bg-primary/80')
    })

    it('should generate correct classes for all variants', () => {
      expect(badgeVariants({ variant: 'secondary' })).toContain('bg-secondary')
      expect(badgeVariants({ variant: 'destructive' })).toContain('bg-red-500')
      expect(badgeVariants({ variant: 'outline' })).toContain('text-foreground')
    })

    it('should use default variant when not specified', () => {
      const classes = badgeVariants({})
      expect(classes).toContain('bg-primary')
      expect(classes).toContain('text-primary-foreground')
    })

    it('should include base classes', () => {
      const classes = badgeVariants({})
      expect(classes).toContain('inline-flex')
      expect(classes).toContain('items-center')
      expect(classes).toContain('rounded-full')
      expect(classes).toContain('border')
      expect(classes).toContain('px-2.5')
      expect(classes).toContain('py-0.5')
      expect(classes).toContain('text-xs')
      expect(classes).toContain('font-semibold')
    })

    it('should include focus and transition classes', () => {
      const classes = badgeVariants({})
      expect(classes).toContain('transition-colors')
      expect(classes).toContain('focus:outline-none')
      expect(classes).toContain('focus:ring-2')
    })
  })

  describe('Use Cases', () => {
    it('should work as a status indicator', () => {
      render(
        <div>
          <span>Order Status:</span>
          <Badge variant="secondary">Pending</Badge>
        </div>
      )
      
      expect(screen.getByText('Order Status:')).toBeInTheDocument()
      expect(screen.getByText('Pending')).toBeInTheDocument()
    })

    it('should work as a notification count', () => {
      render(
        <div>
          <span>Messages</span>
          <Badge variant="destructive">5</Badge>
        </div>
      )
      
      expect(screen.getByText('Messages')).toBeInTheDocument()
      expect(screen.getByText('5')).toBeInTheDocument()
    })

    it('should work as a tag or category', () => {
      render(
        <div>
          <Badge variant="outline">React</Badge>
          <Badge variant="outline">TypeScript</Badge>
          <Badge variant="outline">Testing</Badge>
        </div>
      )
      
      expect(screen.getByText('React')).toBeInTheDocument()
      expect(screen.getByText('TypeScript')).toBeInTheDocument()
      expect(screen.getByText('Testing')).toBeInTheDocument()
    })
  })
})