import React from 'react';
import { render, screen } from '@testing-library/react';
import { TestErrorBoundary, ThrowError } from '../../setup/test-utils';

describe('TestErrorBoundary', () => {
  const mockOnError = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    // Suppress console.error for these tests since we expect errors
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should render children when there is no error', () => {
    render(
      <TestErrorBoundary>
        <div>Normal content</div>
      </TestErrorBoundary>
    );

    expect(screen.getByText('Normal content')).toBeInTheDocument();
    expect(screen.getByTestId('error-boundary')).toBeInTheDocument();
  });

  it('should catch errors and display error message', () => {
    render(
      <TestErrorBoundary onError={mockOnError}>
        <ThrowError message="Test error occurred" />
      </TestErrorBoundary>
    );

    expect(screen.getByText('Something went wrong:')).toBeInTheDocument();
    expect(screen.getByText('Test error occurred')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('should call onError callback when error occurs', () => {
    render(
      <TestErrorBoundary onError={mockOnError}>
        <ThrowError message="Custom error" />
      </TestErrorBoundary>
    );

    expect(mockOnError).toHaveBeenCalledTimes(1);
    expect(mockOnError).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Custom error',
      }),
      expect.objectContaining({
        componentStack: expect.any(String),
      })
    );
  });

  it('should render custom fallback when provided', () => {
    const customFallback = <div data-testid="custom-fallback">Custom error UI</div>;

    render(
      <TestErrorBoundary fallback={customFallback}>
        <ThrowError message="Test error" />
      </TestErrorBoundary>
    );

    expect(screen.getByTestId('custom-fallback')).toBeInTheDocument();
    expect(screen.getByText('Custom error UI')).toBeInTheDocument();
    expect(screen.queryByText('Something went wrong:')).not.toBeInTheDocument();
  });

  it('should not throw when shouldThrow is false', () => {
    render(
      <TestErrorBoundary>
        <ThrowError shouldThrow={false} />
        <div>Content after component that doesn't throw</div>
      </TestErrorBoundary>
    );

    expect(screen.getByText('Content after component that doesn\'t throw')).toBeInTheDocument();
    expect(screen.queryByText('Something went wrong:')).not.toBeInTheDocument();
  });
});