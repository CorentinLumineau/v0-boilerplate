/**
 * Comprehensive tests for breadcrumb components
 * Tests all components, variants, and edge cases for 100% coverage
 */

import React from 'react'
import { render, screen } from '@testing-library/react'
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
} from '@/components/breadcrumb'

describe('Breadcrumb Components', () => {
  describe('Breadcrumb', () => {
    it('should render as nav with proper attributes', () => {
      render(<Breadcrumb data-testid="breadcrumb" />)
      
      const breadcrumb = screen.getByTestId('breadcrumb')
      expect(breadcrumb).toBeInTheDocument()
      expect(breadcrumb.tagName).toBe('NAV')
      expect(breadcrumb).toHaveAttribute('aria-label', 'breadcrumb')
    })

    it('should forward all props', () => {
      render(
        <Breadcrumb 
          data-testid="breadcrumb" 
          className="custom-class"
          id="test-breadcrumb"
        />
      )
      
      const breadcrumb = screen.getByTestId('breadcrumb')
      expect(breadcrumb).toHaveClass('custom-class')
      expect(breadcrumb).toHaveAttribute('id', 'test-breadcrumb')
    })

    it('should forward ref properly', () => {
      const ref = React.createRef<HTMLElement>()
      render(<Breadcrumb ref={ref} />)
      
      expect(ref.current).toBeInstanceOf(HTMLElement)
      expect(ref.current?.tagName).toBe('NAV')
    })
  })

  describe('BreadcrumbList', () => {
    it('should render as ol with default classes', () => {
      render(<BreadcrumbList data-testid="breadcrumb-list" />)
      
      const list = screen.getByTestId('breadcrumb-list')
      expect(list).toBeInTheDocument()
      expect(list.tagName).toBe('OL')
      expect(list).toHaveClass('flex', 'flex-wrap', 'items-center', 'gap-1.5', 'break-words', 'text-sm', 'text-muted-foreground', 'sm:gap-2.5')
    })

    it('should merge custom className with default classes', () => {
      render(
        <BreadcrumbList 
          data-testid="breadcrumb-list" 
          className="custom-class"
        />
      )
      
      const list = screen.getByTestId('breadcrumb-list')
      expect(list).toHaveClass('flex', 'custom-class')
    })

    it('should forward ref properly', () => {
      const ref = React.createRef<HTMLOListElement>()
      render(<BreadcrumbList ref={ref} />)
      
      expect(ref.current).toBeInstanceOf(HTMLOListElement)
    })
  })

  describe('BreadcrumbItem', () => {
    it('should render as li with default classes', () => {
      render(<BreadcrumbItem data-testid="breadcrumb-item">Item</BreadcrumbItem>)
      
      const item = screen.getByTestId('breadcrumb-item')
      expect(item).toBeInTheDocument()
      expect(item.tagName).toBe('LI')
      expect(item).toHaveClass('inline-flex', 'items-center', 'gap-1.5')
      expect(item).toHaveTextContent('Item')
    })

    it('should merge custom className with default classes', () => {
      render(
        <BreadcrumbItem 
          data-testid="breadcrumb-item" 
          className="custom-class"
        >
          Item
        </BreadcrumbItem>
      )
      
      const item = screen.getByTestId('breadcrumb-item')
      expect(item).toHaveClass('inline-flex', 'custom-class')
    })

    it('should forward ref properly', () => {
      const ref = React.createRef<HTMLLIElement>()
      render(<BreadcrumbItem ref={ref}>Item</BreadcrumbItem>)
      
      expect(ref.current).toBeInstanceOf(HTMLLIElement)
    })
  })

  describe('BreadcrumbLink', () => {
    it('should render as anchor by default', () => {
      render(
        <BreadcrumbLink data-testid="breadcrumb-link" href="/test">
          Link
        </BreadcrumbLink>
      )
      
      const link = screen.getByTestId('breadcrumb-link')
      expect(link).toBeInTheDocument()
      expect(link.tagName).toBe('A')
      expect(link).toHaveAttribute('href', '/test')
      expect(link).toHaveTextContent('Link')
      expect(link).toHaveClass('transition-colors', 'hover:text-foreground')
    })

    it('should merge custom className with default classes', () => {
      render(
        <BreadcrumbLink 
          data-testid="breadcrumb-link" 
          className="custom-class"
          href="/test"
        >
          Link
        </BreadcrumbLink>
      )
      
      const link = screen.getByTestId('breadcrumb-link')
      expect(link).toHaveClass('transition-colors', 'custom-class')
    })

    it('should render as Slot when asChild is true', () => {
      render(
        <BreadcrumbLink asChild data-testid="breadcrumb-link">
          <button>Custom Link</button>
        </BreadcrumbLink>
      )
      
      const link = screen.getByTestId('breadcrumb-link')
      expect(link.tagName).toBe('BUTTON')
      expect(link).toHaveTextContent('Custom Link')
      expect(link).toHaveClass('transition-colors', 'hover:text-foreground')
    })

    it('should forward ref properly', () => {
      const ref = React.createRef<HTMLAnchorElement>()
      render(
        <BreadcrumbLink ref={ref} href="/test">
          Link
        </BreadcrumbLink>
      )
      
      expect(ref.current).toBeInstanceOf(HTMLAnchorElement)
    })
  })

  describe('BreadcrumbPage', () => {
    it('should render as span with proper attributes', () => {
      render(
        <BreadcrumbPage data-testid="breadcrumb-page">
          Current Page
        </BreadcrumbPage>
      )
      
      const page = screen.getByTestId('breadcrumb-page')
      expect(page).toBeInTheDocument()
      expect(page.tagName).toBe('SPAN')
      expect(page).toHaveAttribute('role', 'link')
      expect(page).toHaveAttribute('aria-disabled', 'true')
      expect(page).toHaveAttribute('aria-current', 'page')
      expect(page).toHaveTextContent('Current Page')
      expect(page).toHaveClass('font-normal', 'text-foreground')
    })

    it('should merge custom className with default classes', () => {
      render(
        <BreadcrumbPage 
          data-testid="breadcrumb-page" 
          className="custom-class"
        >
          Page
        </BreadcrumbPage>
      )
      
      const page = screen.getByTestId('breadcrumb-page')
      expect(page).toHaveClass('font-normal', 'custom-class')
    })

    it('should forward ref properly', () => {
      const ref = React.createRef<HTMLSpanElement>()
      render(<BreadcrumbPage ref={ref}>Page</BreadcrumbPage>)
      
      expect(ref.current).toBeInstanceOf(HTMLSpanElement)
    })
  })

  describe('BreadcrumbSeparator', () => {
    it('should render with default chevron icon', () => {
      render(<BreadcrumbSeparator data-testid="breadcrumb-separator" />)
      
      const separator = screen.getByTestId('breadcrumb-separator')
      expect(separator).toBeInTheDocument()
      expect(separator.tagName).toBe('LI')
      expect(separator).toHaveAttribute('role', 'presentation')
      expect(separator).toHaveAttribute('aria-hidden', 'true')
      expect(separator).toHaveClass('[&>svg]:w-3.5', '[&>svg]:h-3.5')
      
      // Check for ChevronRight icon (Lucide React icon)
      const icon = separator.querySelector('svg')
      expect(icon).toBeInTheDocument()
    })

    it('should render custom separator content', () => {
      render(
        <BreadcrumbSeparator data-testid="breadcrumb-separator">
          /
        </BreadcrumbSeparator>
      )
      
      const separator = screen.getByTestId('breadcrumb-separator')
      expect(separator).toHaveTextContent('/')
      // Should not have default icon when custom children provided
      const icon = separator.querySelector('svg')
      expect(icon).not.toBeInTheDocument()
    })

    it('should merge custom className with default classes', () => {
      render(
        <BreadcrumbSeparator 
          data-testid="breadcrumb-separator" 
          className="custom-class"
        />
      )
      
      const separator = screen.getByTestId('breadcrumb-separator')
      expect(separator).toHaveClass('[&>svg]:w-3.5', 'custom-class')
    })

    it('should forward all other props', () => {
      render(
        <BreadcrumbSeparator 
          data-testid="breadcrumb-separator"
          id="test-separator"
        />
      )
      
      const separator = screen.getByTestId('breadcrumb-separator')
      expect(separator).toHaveAttribute('id', 'test-separator')
    })
  })

  describe('BreadcrumbEllipsis', () => {
    it('should render with MoreHorizontal icon and screen reader text', () => {
      render(<BreadcrumbEllipsis data-testid="breadcrumb-ellipsis" />)
      
      const ellipsis = screen.getByTestId('breadcrumb-ellipsis')
      expect(ellipsis).toBeInTheDocument()
      expect(ellipsis.tagName).toBe('SPAN')
      expect(ellipsis).toHaveAttribute('role', 'presentation')
      expect(ellipsis).toHaveAttribute('aria-hidden', 'true')
      expect(ellipsis).toHaveClass('flex', 'h-9', 'w-9', 'items-center', 'justify-center')
      
      // Check for MoreHorizontal icon
      const icon = ellipsis.querySelector('svg')
      expect(icon).toBeInTheDocument()
      expect(icon).toHaveClass('h-4', 'w-4')
      
      // Check for screen reader text
      const srText = screen.getByText('More')
      expect(srText).toBeInTheDocument()
      expect(srText).toHaveClass('sr-only')
    })

    it('should merge custom className with default classes', () => {
      render(
        <BreadcrumbEllipsis 
          data-testid="breadcrumb-ellipsis" 
          className="custom-class"
        />
      )
      
      const ellipsis = screen.getByTestId('breadcrumb-ellipsis')
      expect(ellipsis).toHaveClass('flex', 'custom-class')
    })

    it('should forward all other props', () => {
      render(
        <BreadcrumbEllipsis 
          data-testid="breadcrumb-ellipsis"
          id="test-ellipsis"
        />
      )
      
      const ellipsis = screen.getByTestId('breadcrumb-ellipsis')
      expect(ellipsis).toHaveAttribute('id', 'test-ellipsis')
    })
  })

  describe('Integration', () => {
    it('should render complete breadcrumb structure', () => {
      render(
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/products">Products</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbEllipsis />
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Current</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      )
      
      // Check all elements are rendered
      expect(screen.getByRole('navigation')).toBeInTheDocument()
      expect(screen.getByRole('list')).toBeInTheDocument()
      expect(screen.getByText('Home')).toBeInTheDocument()
      expect(screen.getByText('Products')).toBeInTheDocument()
      expect(screen.getByText('Current')).toBeInTheDocument()
      expect(screen.getByText('More')).toBeInTheDocument() // Screen reader text
      
      // Check links
      const homeLink = screen.getByText('Home')
      expect(homeLink).toHaveAttribute('href', '/')
      const productsLink = screen.getByText('Products')
      expect(productsLink).toHaveAttribute('href', '/products')
      
      // Check current page
      const currentPage = screen.getByText('Current')
      expect(currentPage).toHaveAttribute('aria-current', 'page')
    })
  })
})