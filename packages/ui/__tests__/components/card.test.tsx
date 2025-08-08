/**
 * Tests for Card components
 */

import React from 'react'
import { render, screen } from '@testing-library/react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/card'

describe('Card Components', () => {
  describe('Card', () => {
    it('should render card', () => {
      render(<Card>Card content</Card>)
      const card = screen.getByText('Card content')
      expect(card).toBeInTheDocument()
    })

    it('should apply default classes', () => {
      render(<Card>Card content</Card>)
      const card = screen.getByText('Card content')
      expect(card).toHaveClass('rounded-lg', 'border', 'bg-card', 'text-card-foreground', 'shadow-sm')
    })

    it('should apply custom className', () => {
      render(<Card className="custom-card">Card content</Card>)
      const card = screen.getByText('Card content')
      expect(card).toHaveClass('custom-card')
    })

    it('should forward ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>()
      render(<Card ref={ref}>Card content</Card>)
      expect(ref.current).toBeInstanceOf(HTMLDivElement)
    })

    it('should pass through additional props', () => {
      render(<Card data-testid="custom-card">Card content</Card>)
      const card = screen.getByTestId('custom-card')
      expect(card).toBeInTheDocument()
    })
  })

  describe('CardHeader', () => {
    it('should render card header', () => {
      render(<CardHeader>Header content</CardHeader>)
      const header = screen.getByText('Header content')
      expect(header).toBeInTheDocument()
    })

    it('should apply default classes', () => {
      render(<CardHeader>Header content</CardHeader>)
      const header = screen.getByText('Header content')
      expect(header).toHaveClass('flex', 'flex-col', 'space-y-1.5', 'p-6')
    })

    it('should apply custom className', () => {
      render(<CardHeader className="custom-header">Header content</CardHeader>)
      const header = screen.getByText('Header content')
      expect(header).toHaveClass('custom-header')
    })

    it('should forward ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>()
      render(<CardHeader ref={ref}>Header content</CardHeader>)
      expect(ref.current).toBeInstanceOf(HTMLDivElement)
    })
  })

  describe('CardTitle', () => {
    it('should render card title', () => {
      render(<CardTitle>Title content</CardTitle>)
      const title = screen.getByText('Title content')
      expect(title).toBeInTheDocument()
    })

    it('should apply default classes', () => {
      render(<CardTitle>Title content</CardTitle>)
      const title = screen.getByText('Title content')
      expect(title).toHaveClass('text-2xl', 'font-semibold', 'leading-none', 'tracking-tight')
    })

    it('should apply custom className', () => {
      render(<CardTitle className="custom-title">Title content</CardTitle>)
      const title = screen.getByText('Title content')
      expect(title).toHaveClass('custom-title')
    })

    it('should forward ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>()
      render(<CardTitle ref={ref}>Title content</CardTitle>)
      expect(ref.current).toBeInstanceOf(HTMLDivElement)
    })
  })

  describe('CardDescription', () => {
    it('should render card description', () => {
      render(<CardDescription>Description content</CardDescription>)
      const description = screen.getByText('Description content')
      expect(description).toBeInTheDocument()
    })

    it('should apply default classes', () => {
      render(<CardDescription>Description content</CardDescription>)
      const description = screen.getByText('Description content')
      expect(description).toHaveClass('text-sm', 'text-muted-foreground')
    })

    it('should apply custom className', () => {
      render(<CardDescription className="custom-description">Description content</CardDescription>)
      const description = screen.getByText('Description content')
      expect(description).toHaveClass('custom-description')
    })

    it('should forward ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>()
      render(<CardDescription ref={ref}>Description content</CardDescription>)
      expect(ref.current).toBeInstanceOf(HTMLDivElement)
    })
  })

  describe('CardContent', () => {
    it('should render card content', () => {
      render(<CardContent>Content text</CardContent>)
      const content = screen.getByText('Content text')
      expect(content).toBeInTheDocument()
    })

    it('should apply default classes', () => {
      render(<CardContent>Content text</CardContent>)
      const content = screen.getByText('Content text')
      expect(content).toHaveClass('p-6', 'pt-0')
    })

    it('should apply custom className', () => {
      render(<CardContent className="custom-content">Content text</CardContent>)
      const content = screen.getByText('Content text')
      expect(content).toHaveClass('custom-content')
    })

    it('should forward ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>()
      render(<CardContent ref={ref}>Content text</CardContent>)
      expect(ref.current).toBeInstanceOf(HTMLDivElement)
    })
  })

  describe('CardFooter', () => {
    it('should render card footer', () => {
      render(<CardFooter>Footer content</CardFooter>)
      const footer = screen.getByText('Footer content')
      expect(footer).toBeInTheDocument()
    })

    it('should apply default classes', () => {
      render(<CardFooter>Footer content</CardFooter>)
      const footer = screen.getByText('Footer content')
      expect(footer).toHaveClass('flex', 'items-center', 'p-6', 'pt-0')
    })

    it('should apply custom className', () => {
      render(<CardFooter className="custom-footer">Footer content</CardFooter>)
      const footer = screen.getByText('Footer content')
      expect(footer).toHaveClass('custom-footer')
    })

    it('should forward ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>()
      render(<CardFooter ref={ref}>Footer content</CardFooter>)
      expect(ref.current).toBeInstanceOf(HTMLDivElement)
    })
  })

  describe('Complete Card Example', () => {
    it('should render complete card with all components', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Card Title</CardTitle>
            <CardDescription>Card Description</CardDescription>
          </CardHeader>
          <CardContent>
            Main content area
          </CardContent>
          <CardFooter>
            Footer actions
          </CardFooter>
        </Card>
      )

      expect(screen.getByText('Card Title')).toBeInTheDocument()
      expect(screen.getByText('Card Description')).toBeInTheDocument()
      expect(screen.getByText('Main content area')).toBeInTheDocument()
      expect(screen.getByText('Footer actions')).toBeInTheDocument()
    })

    it('should maintain proper structure and styling', () => {
      render(
        <Card data-testid="card">
          <CardHeader data-testid="header">
            <CardTitle data-testid="title">Title</CardTitle>
          </CardHeader>
          <CardContent data-testid="content">Content</CardContent>
        </Card>
      )

      const card = screen.getByTestId('card')
      const header = screen.getByTestId('header')
      const title = screen.getByTestId('title')
      const content = screen.getByTestId('content')

      expect(card).toHaveClass('rounded-lg', 'border')
      expect(header).toHaveClass('flex', 'flex-col', 'p-6')
      expect(title).toHaveClass('text-2xl', 'font-semibold')
      expect(content).toHaveClass('p-6', 'pt-0')
    })
  })
})