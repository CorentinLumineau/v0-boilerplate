import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';

// Custom render function that includes providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  // Create a new QueryClient instance for each test
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        {children}
      </ThemeProvider>
    </QueryClientProvider>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => {
  return render(ui, { wrapper: AllTheProviders, ...options });
};

// Re-export everything from React Testing Library
export * from '@testing-library/react';
export { customRender as render };

// Test wrapper components for different scenarios
export const TestWrapper: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => <AllTheProviders>{children}</AllTheProviders>;

export const TestQueryWrapper: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

// Utility functions for common test scenarios
export const createMockUser = () => ({
  id: 'test-user-id',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  createdAt: new Date(),
  updatedAt: new Date(),
});

export const waitForLoadingToFinish = () => {
  return new Promise((resolve) => {
    setTimeout(resolve, 0);
  });
};

// Mock session for authenticated tests
export const createMockSession = (overrides = {}) => ({
  user: createMockUser(),
  expires: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours
  ...overrides,
});

// Helper for testing error boundaries
export class TestErrorBoundary extends React.Component<
  { 
    children: React.ReactNode;
    onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
    fallback?: React.ReactNode;
  },
  { hasError: boolean; error?: Error }
> {
  constructor(props: TestErrorBoundary['props']) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.props.onError?.(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div data-testid="error-boundary" role="alert">
          <h2>Something went wrong:</h2>
          <p>{this.state.error?.message}</p>
        </div>
      );
    }

    return (
      <div data-testid="error-boundary">
        {this.props.children}
      </div>
    );
  }
}

// Utility to trigger error boundary in tests
export const ThrowError: React.FC<{ shouldThrow?: boolean; message?: string }> = ({ 
  shouldThrow = true, 
  message = 'Test error' 
}) => {
  if (shouldThrow) {
    throw new Error(message);
  }
  return null;
};

// Additional test utilities for async operations
export const waitForNextTick = () => new Promise(resolve => setTimeout(resolve, 0));

export const waitForCondition = async (
  condition: () => boolean | Promise<boolean>,
  timeout = 5000,
  interval = 100
): Promise<void> => {
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    if (await condition()) {
      return;
    }
    await new Promise(resolve => setTimeout(resolve, interval));
  }
  
  throw new Error(`Condition not met within ${timeout}ms`);
};

// Mock implementation helpers
export const createMockFunction = <T extends (...args: any[]) => any>(
  implementation?: T
): jest.MockedFunction<T> => {
  return jest.fn(implementation) as jest.MockedFunction<T>;
};