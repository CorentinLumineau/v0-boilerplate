/**
 * Comprehensive tests for dialog components
 * Tests all components, variants, and edge cases for 100% coverage
 */

import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from '@/components/dialog'

describe('Dialog Components', () => {
  describe('Dialog Root', () => {
    it('should render dialog root component', () => {
      render(
        <Dialog>
          <DialogTrigger asChild>
            <button>Open</button>
          </DialogTrigger>
        </Dialog>
      )
      
      const trigger = screen.getByText('Open')
      expect(trigger).toBeInTheDocument()
    })

    it('should handle open/close state', async () => {
      const user = userEvent.setup()
      
      render(
        <Dialog>
          <DialogTrigger asChild>
            <button>Open Dialog</button>
          </DialogTrigger>
          <DialogContent>
            <DialogTitle>Test Dialog</DialogTitle>
            <DialogDescription>Test description</DialogDescription>
          </DialogContent>
        </Dialog>
      )
      
      // Dialog should be closed initially
      expect(screen.queryByText('Test Dialog')).not.toBeInTheDocument()
      
      // Click trigger to open
      const trigger = screen.getByText('Open Dialog')
      await user.click(trigger)
      
      // Dialog should be open
      expect(screen.getByText('Test Dialog')).toBeInTheDocument()
    })
  })

  describe('DialogTrigger', () => {
    it('should render trigger button', () => {
      render(
        <Dialog>
          <DialogTrigger asChild>
            <button data-testid="dialog-trigger">Open</button>
          </DialogTrigger>
        </Dialog>
      )
      
      const trigger = screen.getByTestId('dialog-trigger')
      expect(trigger).toBeInTheDocument()
      expect(trigger.tagName).toBe('BUTTON')
    })
  })

  describe('DialogOverlay', () => {
    it('should render overlay with default classes', () => {
      render(
        <Dialog open>
          <DialogOverlay data-testid="dialog-overlay" />
        </Dialog>
      )
      
      const overlay = screen.getByTestId('dialog-overlay')
      expect(overlay).toBeInTheDocument()
      expect(overlay).toHaveClass(
        'fixed',
        'inset-0',
        'z-50',
        'bg-black/80',
        'data-[state=open]:animate-in',
        'data-[state=closed]:animate-out',
        'data-[state=closed]:fade-out-0',
        'data-[state=open]:fade-in-0'
      )
    })

    it('should merge custom className with default classes', () => {
      render(
        <Dialog open>
          <DialogOverlay 
            data-testid="dialog-overlay" 
            className="custom-class"
          />
        </Dialog>
      )
      
      const overlay = screen.getByTestId('dialog-overlay')
      expect(overlay).toHaveClass('fixed', 'custom-class')
    })

    it('should forward ref properly', () => {
      const ref = React.createRef<HTMLDivElement>()
      render(
        <Dialog open>
          <DialogOverlay ref={ref} />
        </Dialog>
      )
      
      expect(ref.current).toBeInstanceOf(HTMLDivElement)
    })
  })

  describe('DialogContent', () => {
    it('should render content with overlay and close button', () => {
      render(
        <Dialog open>
          <DialogContent data-testid="dialog-content">
            <DialogTitle>Test Title</DialogTitle>
            <p>Test content</p>
          </DialogContent>
        </Dialog>
      )
      
      const content = screen.getByTestId('dialog-content')
      expect(content).toBeInTheDocument()
      expect(content).toHaveClass(
        'fixed',
        'left-[50%]',
        'top-[50%]',
        'z-50',
        'grid',
        'w-full',
        'max-w-lg',
        'translate-x-[-50%]',
        'translate-y-[-50%]',
        'gap-4',
        'border',
        'bg-background',
        'p-6',
        'shadow-lg',
        'duration-200'
      )
      
      // Should have title and content
      expect(screen.getByText('Test Title')).toBeInTheDocument()
      expect(screen.getByText('Test content')).toBeInTheDocument()
      
      // Should have close button
      expect(screen.getByText('Close')).toBeInTheDocument() // Screen reader text
      const closeIcon = content.querySelector('svg')
      expect(closeIcon).toBeInTheDocument()
    })

    it('should merge custom className with default classes', () => {
      render(
        <Dialog open>
          <DialogContent 
            data-testid="dialog-content" 
            className="custom-class"
          >
            Content
          </DialogContent>
        </Dialog>
      )
      
      const content = screen.getByTestId('dialog-content')
      expect(content).toHaveClass('fixed', 'custom-class')
    })

    it('should forward ref properly', () => {
      const ref = React.createRef<HTMLDivElement>()
      render(
        <Dialog open>
          <DialogContent ref={ref}>Content</DialogContent>
        </Dialog>
      )
      
      expect(ref.current).toBeInstanceOf(HTMLDivElement)
    })

    it('should close dialog when close button is clicked', async () => {
      const user = userEvent.setup()
      
      render(
        <Dialog defaultOpen>
          <DialogContent>
            <DialogTitle>Test Dialog</DialogTitle>
          </DialogContent>
        </Dialog>
      )
      
      // Dialog should be open
      expect(screen.getByText('Test Dialog')).toBeInTheDocument()
      
      // Click close button
      const closeButton = screen.getByRole('button', { name: 'Close' })
      await user.click(closeButton)
      
      // Dialog should be closed
      expect(screen.queryByText('Test Dialog')).not.toBeInTheDocument()
    })
  })

  describe('DialogHeader', () => {
    it('should render header with default classes', () => {
      render(
        <Dialog open>
          <DialogHeader data-testid="dialog-header">
            <DialogTitle>Header Title</DialogTitle>
          </DialogHeader>
        </Dialog>
      )
      
      const header = screen.getByTestId('dialog-header')
      expect(header).toBeInTheDocument()
      expect(header.tagName).toBe('DIV')
      expect(header).toHaveClass(
        'flex',
        'flex-col',
        'space-y-1.5',
        'text-center',
        'sm:text-left'
      )
      expect(screen.getByText('Header Title')).toBeInTheDocument()
    })

    it('should merge custom className with default classes', () => {
      render(
        <DialogHeader 
          data-testid="dialog-header" 
          className="custom-class"
        >
          Header
        </DialogHeader>
      )
      
      const header = screen.getByTestId('dialog-header')
      expect(header).toHaveClass('flex', 'custom-class')
    })

    it('should forward all props', () => {
      render(
        <DialogHeader 
          data-testid="dialog-header"
          id="test-header"
        >
          Header
        </DialogHeader>
      )
      
      const header = screen.getByTestId('dialog-header')
      expect(header).toHaveAttribute('id', 'test-header')
    })
  })

  describe('DialogFooter', () => {
    it('should render footer with default classes', () => {
      render(
        <DialogFooter data-testid="dialog-footer">
          <button>Cancel</button>
          <button>Save</button>
        </DialogFooter>
      )
      
      const footer = screen.getByTestId('dialog-footer')
      expect(footer).toBeInTheDocument()
      expect(footer.tagName).toBe('DIV')
      expect(footer).toHaveClass(
        'flex',
        'flex-col-reverse',
        'sm:flex-row',
        'sm:justify-end',
        'sm:space-x-2'
      )
      expect(screen.getByText('Cancel')).toBeInTheDocument()
      expect(screen.getByText('Save')).toBeInTheDocument()
    })

    it('should merge custom className with default classes', () => {
      render(
        <DialogFooter 
          data-testid="dialog-footer" 
          className="custom-class"
        >
          Footer
        </DialogFooter>
      )
      
      const footer = screen.getByTestId('dialog-footer')
      expect(footer).toHaveClass('flex', 'custom-class')
    })

    it('should forward all props', () => {
      render(
        <DialogFooter 
          data-testid="dialog-footer"
          id="test-footer"
        >
          Footer
        </DialogFooter>
      )
      
      const footer = screen.getByTestId('dialog-footer')
      expect(footer).toHaveAttribute('id', 'test-footer')
    })
  })

  describe('DialogTitle', () => {
    it('should render title with default classes', () => {
      render(
        <Dialog open>
          <DialogTitle data-testid="dialog-title">Dialog Title</DialogTitle>
        </Dialog>
      )
      
      const title = screen.getByTestId('dialog-title')
      expect(title).toBeInTheDocument()
      expect(title).toHaveClass(
        'text-lg',
        'font-semibold',
        'leading-none',
        'tracking-tight'
      )
      expect(title).toHaveTextContent('Dialog Title')
    })

    it('should merge custom className with default classes', () => {
      render(
        <Dialog open>
          <DialogTitle 
            data-testid="dialog-title" 
            className="custom-class"
          >
            Title
          </DialogTitle>
        </Dialog>
      )
      
      const title = screen.getByTestId('dialog-title')
      expect(title).toHaveClass('text-lg', 'custom-class')
    })

    it('should forward ref properly', () => {
      const ref = React.createRef<HTMLHeadingElement>()
      render(
        <Dialog open>
          <DialogTitle ref={ref}>Title</DialogTitle>
        </Dialog>
      )
      
      expect(ref.current).toBeInstanceOf(HTMLHeadingElement)
    })
  })

  describe('DialogDescription', () => {
    it('should render description with default classes', () => {
      render(
        <Dialog open>
          <DialogDescription data-testid="dialog-description">
            This is a description
          </DialogDescription>
        </Dialog>
      )
      
      const description = screen.getByTestId('dialog-description')
      expect(description).toBeInTheDocument()
      expect(description).toHaveClass('text-sm', 'text-muted-foreground')
      expect(description).toHaveTextContent('This is a description')
    })

    it('should merge custom className with default classes', () => {
      render(
        <Dialog open>
          <DialogDescription 
            data-testid="dialog-description" 
            className="custom-class"
          >
            Description
          </DialogDescription>
        </Dialog>
      )
      
      const description = screen.getByTestId('dialog-description')
      expect(description).toHaveClass('text-sm', 'custom-class')
    })

    it('should forward ref properly', () => {
      const ref = React.createRef<HTMLParagraphElement>()
      render(
        <Dialog open>
          <DialogDescription ref={ref}>Description</DialogDescription>
        </Dialog>
      )
      
      expect(ref.current).toBeInstanceOf(HTMLParagraphElement)
    })
  })

  describe('DialogClose', () => {
    it('should close dialog when clicked', async () => {
      const user = userEvent.setup()
      
      render(
        <Dialog defaultOpen>
          <DialogContent>
            <DialogTitle>Test Dialog</DialogTitle>
            <DialogClose asChild>
              <button>Close Dialog</button>
            </DialogClose>
          </DialogContent>
        </Dialog>
      )
      
      // Dialog should be open
      expect(screen.getByText('Test Dialog')).toBeInTheDocument()
      
      // Click custom close button
      const closeButton = screen.getByText('Close Dialog')
      await user.click(closeButton)
      
      // Dialog should be closed
      expect(screen.queryByText('Test Dialog')).not.toBeInTheDocument()
    })
  })

  describe('DialogPortal', () => {
    it('should render children in portal', () => {
      render(
        <Dialog open>
          <DialogPortal>
            <div data-testid="portal-content">Portal Content</div>
          </DialogPortal>
        </Dialog>
      )
      
      const content = screen.getByTestId('portal-content')
      expect(content).toBeInTheDocument()
      expect(content).toHaveTextContent('Portal Content')
    })
  })

  describe('Integration', () => {
    it('should render complete dialog structure', async () => {
      const user = userEvent.setup()
      
      render(
        <Dialog>
          <DialogTrigger asChild>
            <button>Open Complete Dialog</button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Complete Dialog</DialogTitle>
              <DialogDescription>
                This is a complete dialog with all components
              </DialogDescription>
            </DialogHeader>
            <div>Dialog body content</div>
            <DialogFooter>
              <DialogClose asChild>
                <button>Cancel</button>
              </DialogClose>
              <button>Save</button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )
      
      // Initially closed
      expect(screen.queryByText('Complete Dialog')).not.toBeInTheDocument()
      
      // Open dialog
      const trigger = screen.getByText('Open Complete Dialog')
      await user.click(trigger)
      
      // Check all components are rendered
      expect(screen.getByText('Complete Dialog')).toBeInTheDocument()
      expect(screen.getByText('This is a complete dialog with all components')).toBeInTheDocument()
      expect(screen.getByText('Dialog body content')).toBeInTheDocument()
      expect(screen.getByText('Cancel')).toBeInTheDocument()
      expect(screen.getByText('Save')).toBeInTheDocument()
      
      // Close with custom close button
      const cancelButton = screen.getByText('Cancel')
      await user.click(cancelButton)
      
      // Dialog should be closed
      expect(screen.queryByText('Complete Dialog')).not.toBeInTheDocument()
    })

    it('should handle keyboard interactions', async () => {
      const user = userEvent.setup()
      
      render(
        <Dialog defaultOpen>
          <DialogContent>
            <DialogTitle>Keyboard Test</DialogTitle>
            <button>Focusable element</button>
          </DialogContent>
        </Dialog>
      )
      
      // Dialog should be open
      expect(screen.getByText('Keyboard Test')).toBeInTheDocument()
      
      // Should be able to close with Escape key
      await user.keyboard('{Escape}')
      
      // Dialog should be closed
      expect(screen.queryByText('Keyboard Test')).not.toBeInTheDocument()
    })
  })
})