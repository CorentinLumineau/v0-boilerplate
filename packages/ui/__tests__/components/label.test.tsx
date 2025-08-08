/**
 * Tests for Label component
 */

import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Label } from '@/components/label'

describe('Label', () => {
  it('should render label', () => {
    render(<Label>Label text</Label>)
    const label = screen.getByText('Label text')
    expect(label).toBeInTheDocument()
  })

  it('should apply default classes', () => {
    render(<Label>Label text</Label>)
    const label = screen.getByText('Label text')
    expect(label).toHaveClass(
      'text-sm',
      'font-medium',
      'leading-none',
      'peer-disabled:cursor-not-allowed',
      'peer-disabled:opacity-70'
    )
  })

  it('should apply custom className', () => {
    render(<Label className="custom-label">Label text</Label>)
    const label = screen.getByText('Label text')
    expect(label).toHaveClass('custom-label')
  })

  it('should handle htmlFor attribute', () => {
    render(<Label htmlFor="input-id">Label text</Label>)
    const label = screen.getByText('Label text')
    expect(label).toHaveAttribute('for', 'input-id')
  })

  it('should forward ref correctly', () => {
    const ref = React.createRef<HTMLLabelElement>()
    render(<Label ref={ref}>Label text</Label>)
    expect(ref.current).toBeInstanceOf(HTMLLabelElement)
  })

  it('should pass through additional props', () => {
    render(
      <Label 
        data-testid="label" 
        aria-label="Custom Label"
        title="Label tooltip"
      >
        Label text
      </Label>
    )
    const label = screen.getByTestId('label')
    expect(label).toHaveAttribute('aria-label', 'Custom Label')
    expect(label).toHaveAttribute('title', 'Label tooltip')
  })

  it('should work with form controls', () => {
    render(
      <div>
        <Label htmlFor="username">Username</Label>
        <input id="username" type="text" />
      </div>
    )
    
    const label = screen.getByText('Username')
    const input = screen.getByRole('textbox')
    
    expect(label).toHaveAttribute('for', 'username')
    expect(input).toHaveAttribute('id', 'username')
  })

  it('should handle peer disabled states', () => {
    render(
      <div>
        <Label>Disabled Label</Label>
        <input disabled className="peer" />
      </div>
    )
    
    const label = screen.getByText('Disabled Label')
    expect(label).toHaveClass('peer-disabled:cursor-not-allowed', 'peer-disabled:opacity-70')
  })

  it('should work as a clickable label', async () => {
    const user = userEvent.setup()
    
    render(
      <div>
        <Label htmlFor="clickable-input">
          Clickable Label
        </Label>
        <input id="clickable-input" type="checkbox" />
      </div>
    )
    
    const label = screen.getByText('Clickable Label')
    const checkbox = screen.getByRole('checkbox')
    
    // Clicking the label should activate the associated input
    await user.click(label)
    expect(checkbox).toBeChecked()
  })

  it('should support required field indicators', () => {
    render(
      <Label>
        Email <span className="text-red-500">*</span>
      </Label>
    )
    
    expect(screen.getByText('Email')).toBeInTheDocument()
    expect(screen.getByText('*')).toBeInTheDocument()
  })

  it('should maintain accessibility', () => {
    render(
      <div>
        <Label htmlFor="accessible-input">Accessible Label</Label>
        <input 
          id="accessible-input" 
          type="text" 
          aria-describedby="help-text"
        />
        <div id="help-text">Help text</div>
      </div>
    )
    
    const label = screen.getByText('Accessible Label')
    const input = screen.getByRole('textbox')
    
    expect(label).toHaveAttribute('for', 'accessible-input')
    expect(input).toHaveAttribute('aria-describedby', 'help-text')
  })
})