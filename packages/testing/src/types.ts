/**
 * Common types used across testing utilities
 */

import { ReactElement } from 'react'
import { RenderOptions } from '@testing-library/react'

// Enhanced render options for custom render function
export interface CustomRenderOptions extends RenderOptions {
  // Mock session data
  session?: {
    user?: {
      id: string
      name?: string
      email: string
      image?: string
    }
    expires?: string
  } | null
  
  // Mock theme provider props
  theme?: {
    theme?: string
    forcedTheme?: string
    enableSystem?: boolean
  }
  
  // Mock preferences
  initialPreferences?: {
    colorTheme?: string
    language?: string 
    themeMode?: string
  }
  
  // Mock router
  router?: {
    pathname?: string
    query?: Record<string, string | string[]>
    push?: jest.Mock
    replace?: jest.Mock
    back?: jest.Mock
  }
}

// API test helpers types
export interface ApiTestContext {
  userId?: string
  sessionToken?: string
  adminUser?: boolean
}

export interface ApiTestExpectations {
  status: number
  body?: any
  headers?: Record<string, string>
}

// Database test helpers types
export interface DatabaseTestUser {
  id: string
  email: string
  name?: string
  emailVerified?: boolean
}

export interface DatabaseTestPreferences {
  id: string
  userId: string
  colorTheme: string
  language: string
  themeMode: string
}

// Mock factory types
export interface UserFactoryOptions {
  id?: string
  email?: string
  name?: string
  image?: string
  emailVerified?: boolean
  createdAt?: Date
  updatedAt?: Date
}

export interface PreferencesFactoryOptions {
  id?: string
  userId?: string
  colorTheme?: string
  language?: string
  themeMode?: string
  createdAt?: Date
  updatedAt?: Date
}

export interface NotificationFactoryOptions {
  id?: string
  userId?: string
  title?: string
  message?: string
  type?: string
  status?: string
  data?: any
  createdAt?: Date
  updatedAt?: Date
}

// Test environment types
export interface TestEnvironment {
  cleanup: () => Promise<void>
  reset: () => Promise<void>
}

// Component testing types
export interface ComponentTestProps {
  component: ReactElement
  props?: Record<string, any>
  renderOptions?: CustomRenderOptions
}

// Integration test types
export interface IntegrationTestContext {
  app: any // Express app instance
  request: any // Supertest request
  database: any // Database connection
}