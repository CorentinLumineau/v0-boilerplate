/**
 * Tests for Input component
 */

import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Input } from '@/components/input'

describe('Input', () => {
  it('should render input', () => {
    render(<Input placeholder="Enter text" />)
    const input = screen.getByPlaceholderText('Enter text')
    expect(input).toBeInTheDocument()
  })

  it('should apply default classes', () => {
    render(<Input data-testid="input" />)
    const input = screen.getByTestId('input')
    expect(input).toHaveClass(
      'flex',
      'h-10',
      'w-full',
      'rounded-md',
      'border',
      'border-input',
      'bg-background',
      'px-3',
      'py-2'
    )
  })

  it('should apply custom className', () => {
    render(<Input className="custom-input" data-testid="input" />)
    const input = screen.getByTestId('input')
    expect(input).toHaveClass('custom-input')
  })

  it('should handle different input types', () => {
    const { rerender } = render(<Input type="text" data-testid="input" />)
    let input = screen.getByTestId('input')
    expect(input).toHaveAttribute('type', 'text')

    rerender(<Input type="email" data-testid="input" />)
    input = screen.getByTestId('input')
    expect(input).toHaveAttribute('type', 'email')

    rerender(<Input type="password" data-testid="input" />)
    input = screen.getByTestId('input')
    expect(input).toHaveAttribute('type', 'password')

    rerender(<Input type="number" data-testid="input" />)
    input = screen.getByTestId('input')
    expect(input).toHaveAttribute('type', 'number')
  })

  it('should handle value changes', async () => {
    const handleChange = jest.fn()
    const user = userEvent.setup()
    
    render(<Input onChange={handleChange} data-testid="input" />)
    const input = screen.getByTestId('input')
    
    await user.type(input, 'test value')
    expect(handleChange).toHaveBeenCalled()
    expect(input).toHaveValue('test value')
  })

  it('should handle disabled state', () => {
    render(<Input disabled data-testid="input" />)
    const input = screen.getByTestId('input')
    expect(input).toBeDisabled()
    expect(input).toHaveClass('disabled:cursor-not-allowed', 'disabled:opacity-50')
  })

  it('should handle placeholder', () => {
    render(<Input placeholder="Enter your name" />)
    const input = screen.getByPlaceholderText('Enter your name')
    expect(input).toBeInTheDocument()
    expect(input).toHaveClass('placeholder:text-muted-foreground')
  })

  it('should handle focus states', async () => {
    const user = userEvent.setup()
    render(<Input data-testid="input" />)
    const input = screen.getByTestId('input')
    
    expect(input).toHaveClass('focus-visible:outline-none', 'focus-visible:ring-2')
    
    await user.click(input)
    expect(input).toHaveFocus()
  })

  it('should forward ref correctly', () => {
    const ref = React.createRef<HTMLInputElement>()
    render(<Input ref={ref} />)
    expect(ref.current).toBeInstanceOf(HTMLInputElement)
  })

  it('should pass through additional props', () => {
    render(
      <Input 
        data-testid="input" 
        aria-label="Custom Input" 
        maxLength={10}
        required
      />
    )
    const input = screen.getByTestId('input')
    expect(input).toHaveAttribute('aria-label', 'Custom Input')
    expect(input).toHaveAttribute('maxLength', '10')
    expect(input).toBeRequired()
  })

  it('should handle defaultValue', () => {
    render(<Input defaultValue="default text" data-testid="input" />)
    const input = screen.getByTestId('input')
    expect(input).toHaveValue('default text')
  })

  it('should handle controlled value', () => {
    const { rerender } = render(<Input value="controlled" data-testid="input" readOnly />)
    let input = screen.getByTestId('input')
    expect(input).toHaveValue('controlled')

    rerender(<Input value="updated" data-testid="input" readOnly />)
    input = screen.getByTestId('input')
    expect(input).toHaveValue('updated')
  })

  it('should handle file input styling', () => {
    render(<Input type="file" data-testid="input" />)
    const input = screen.getByTestId('input')
    expect(input).toHaveClass(
      'file:border-0',
      'file:bg-transparent',
      'file:text-sm',
      'file:font-medium',
      'file:text-foreground'
    )
  })

  it('should handle form integration', async () => {
    const handleSubmit = jest.fn((e) => e.preventDefault())
    const user = userEvent.setup()
    
    render(
      <form onSubmit={handleSubmit}>
        <Input name="username" data-testid="input" />
        <button type="submit">Submit</button>
      </form>
    )
    
    const input = screen.getByTestId('input')
    const button = screen.getByRole('button')
    
    await user.type(input, 'testuser')
    await user.click(button)
    
    expect(handleSubmit).toHaveBeenCalled()
    expect(input).toHaveValue('testuser')
  })
})