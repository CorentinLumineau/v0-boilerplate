/**
 * @boilerplate/testing - Shared testing utilities for the monorepo
 * 
 * This package provides:
 * - Jest configurations
 * - Testing utilities and helpers
 * - Mock factories
 * - API testing helpers
 * - Component testing utilities
 */

// Re-export commonly used testing libraries
export * from '@testing-library/react'
export * from '@testing-library/user-event'
export { render as customRender } from './utils/custom-render'

// Export testing utilities
export * from './utils/test-helpers'
export * from './utils/api-test-helpers'

// Export types
export * from './types'

// Package metadata
export const version = '0.1.0'