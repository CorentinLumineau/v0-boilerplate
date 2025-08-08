/**
 * Enhanced render function with provider mocking
 * Provides a custom render that sets up all necessary providers
 */

import React from 'react'
import { render, RenderResult } from '@testing-library/react'
import { CustomRenderOptions } from '../types'

// Mock providers
const MockSessionProvider: React.FC<{ session?: any; children: React.ReactNode }> = ({ 
  session, 
  children 
}: { session?: any; children: React.ReactNode }) => {
  // Mock useSession hook behavior
  React.useEffect(() => {
    // Set up mock session data
    (global as any).mockSession = session
  }, [session])
  
  return <>{children}</>
}

const MockThemeProvider: React.FC<{ 
  themeProps?: any;
  children: React.ReactNode 
}> = ({ themeProps, children }: { themeProps?: any; children: React.ReactNode }) => {
  // Mock useTheme hook behavior
  React.useEffect(() => {
    (global as any).mockTheme = {
      theme: 'light',
      setTheme: jest.fn(),
      resolvedTheme: 'light',
      ...themeProps
    }
  }, [themeProps])
  
  return <>{children}</>
}

const MockPreferencesProvider: React.FC<{ 
  initialPreferences?: any;
  children: React.ReactNode 
}> = ({ initialPreferences, children }: { initialPreferences?: any; children: React.ReactNode }) => {
  // Mock preferences context
  React.useEffect(() => {
    (global as any).mockPreferences = {
      colorTheme: 'default',
      language: 'en', 
      themeMode: 'system',
      ...initialPreferences
    }
  }, [initialPreferences])
  
  return <>{children}</>
}

const MockRouterProvider: React.FC<{ 
  routerProps?: any;
  children: React.ReactNode 
}> = ({ routerProps, children }: { routerProps?: any; children: React.ReactNode }) => {
  // Mock useRouter hook behavior
  React.useEffect(() => {
    (global as any).mockRouter = {
      pathname: '/',
      query: {},
      push: jest.fn(),
      replace: jest.fn(),
      back: jest.fn(),
      ...routerProps
    }
  }, [routerProps])
  
  return <>{children}</>
}

/**
 * Custom render function that wraps components with necessary providers
 */
export function customRender(
  ui: React.ReactElement,
  options: CustomRenderOptions = {}
): RenderResult {
  const {
    session,
    theme,
    initialPreferences,
    router,
    ...renderOptions
  } = options

  const AllProviders: React.FC<{ children: React.ReactNode }> = ({ children }: { children: React.ReactNode }) => {
    return (
      <MockSessionProvider session={session}>
        <MockThemeProvider themeProps={theme}>
          <MockPreferencesProvider initialPreferences={initialPreferences}>
            <MockRouterProvider routerProps={router}>
              {children}
            </MockRouterProvider>
          </MockPreferencesProvider>
        </MockThemeProvider>
      </MockSessionProvider>
    )
  }

  return render(ui, { wrapper: AllProviders, ...renderOptions })
}

// Re-export everything from testing-library/react except render
export * from '@testing-library/react'
export { customRender as render }