/**
 * Tests for Alert components
 */

import React from 'react'
import { render, screen } from '@testing-library/react'
import { Alert, AlertTitle, AlertDescription, alertVariants } from '@/components/alert'

describe('Alert Components', () => {
  describe('Alert', () => {
    it('should render alert with default variant', () => {
      render(<Alert>Alert content</Alert>)
      const alert = screen.getByRole('alert')
      expect(alert).toBeInTheDocument()
      expect(alert).toHaveTextContent('Alert content')
    })

    it('should apply default variant classes', () => {
      render(<Alert>Alert content</Alert>)
      const alert = screen.getByRole('alert')
      expect(alert).toHaveClass('bg-background', 'text-foreground')
    })

    it('should apply destructive variant classes', () => {
      render(<Alert variant="destructive">Alert content</Alert>)
      const alert = screen.getByRole('alert')
      expect(alert).toHaveClass('border-red-500/50', 'text-red-500')
    })

    it('should apply custom className', () => {
      render(<Alert className="custom-class">Alert content</Alert>)
      const alert = screen.getByRole('alert')
      expect(alert).toHaveClass('custom-class')
    })

    it('should forward ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>()
      render(<Alert ref={ref}>Alert content</Alert>)
      expect(ref.current).toBeInstanceOf(HTMLDivElement)
    })

    it('should pass through additional props', () => {
      render(<Alert data-testid="custom-alert">Alert content</Alert>)
      const alert = screen.getByTestId('custom-alert')
      expect(alert).toBeInTheDocument()
    })
  })

  describe('AlertTitle', () => {
    it('should render alert title', () => {
      render(<AlertTitle>Alert Title</AlertTitle>)
      const title = screen.getByRole('heading')
      expect(title).toBeInTheDocument()
      expect(title).toHaveTextContent('Alert Title')
    })

    it('should apply correct classes', () => {
      render(<AlertTitle>Alert Title</AlertTitle>)
      const title = screen.getByRole('heading')
      expect(title).toHaveClass('mb-1', 'font-medium', 'leading-none', 'tracking-tight')
    })

    it('should apply custom className', () => {
      render(<AlertTitle className="custom-title">Alert Title</AlertTitle>)
      const title = screen.getByRole('heading')
      expect(title).toHaveClass('custom-title')
    })

    it('should forward ref correctly', () => {
      const ref = React.createRef<HTMLParagraphElement>()
      render(<AlertTitle ref={ref}>Alert Title</AlertTitle>)
      expect(ref.current).toBeInstanceOf(HTMLHeadingElement)
    })
  })

  describe('AlertDescription', () => {
    it('should render alert description', () => {
      render(<AlertDescription>Alert description content</AlertDescription>)
      const description = screen.getByText('Alert description content')
      expect(description).toBeInTheDocument()
    })

    it('should apply correct classes', () => {
      render(<AlertDescription>Alert description</AlertDescription>)
      const description = screen.getByText('Alert description')
      expect(description).toHaveClass('text-sm', '[&_p]:leading-relaxed')
    })

    it('should apply custom className', () => {
      render(<AlertDescription className="custom-desc">Alert description</AlertDescription>)
      const description = screen.getByText('Alert description')
      expect(description).toHaveClass('custom-desc')
    })

    it('should forward ref correctly', () => {
      const ref = React.createRef<HTMLParagraphElement>()
      render(<AlertDescription ref={ref}>Alert description</AlertDescription>)
      expect(ref.current).toBeInstanceOf(HTMLDivElement)
    })
  })

  describe('Complete Alert Example', () => {
    it('should render complete alert with title and description', () => {
      render(
        <Alert>
          <AlertTitle>Warning</AlertTitle>
          <AlertDescription>This is a warning message.</AlertDescription>
        </Alert>
      )

      expect(screen.getByRole('alert')).toBeInTheDocument()
      expect(screen.getByRole('heading', { name: 'Warning' })).toBeInTheDocument()
      expect(screen.getByText('This is a warning message.')).toBeInTheDocument()
    })

    it('should work with destructive variant', () => {
      render(
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Something went wrong.</AlertDescription>
        </Alert>
      )

      const alert = screen.getByRole('alert')
      expect(alert).toHaveClass('border-red-500/50', 'text-red-500')
    })
  })

  describe('alertVariants', () => {
    it('should generate correct classes for default variant', () => {
      const classes = alertVariants({ variant: 'default' })
      expect(classes).toContain('bg-background')
      expect(classes).toContain('text-foreground')
    })

    it('should generate correct classes for destructive variant', () => {
      const classes = alertVariants({ variant: 'destructive' })
      expect(classes).toContain('border-red-500/50')
      expect(classes).toContain('text-red-500')
    })

    it('should use default variant when not specified', () => {
      const classes = alertVariants({})
      expect(classes).toContain('bg-background')
      expect(classes).toContain('text-foreground')
    })

    it('should include base classes', () => {
      const classes = alertVariants({})
      expect(classes).toContain('relative')
      expect(classes).toContain('w-full')
      expect(classes).toContain('rounded-lg')
      expect(classes).toContain('border')
      expect(classes).toContain('p-4')
    })
  })
})