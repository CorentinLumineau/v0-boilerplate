const baseConfig = require('@boilerplate/config/jest.base.config.js')

/** @type {import('jest').Config} */
const config = {
  // Global configuration
  clearMocks: true,
  verbose: true,
  
  // Coverage configuration
  coverageReporters: ['text', 'text-summary', 'lcov', 'html'],
  coverageDirectory: 'coverage',
  
  // Use projects to handle different test environments
  projects: [
    // Node environment for API tests and utility libraries
    {
      displayName: 'API Tests',
      testEnvironment: 'node',
      testMatch: [
        '<rootDir>/__tests__/api/**/*.{ts,tsx}',
        '<rootDir>/__tests__/lib/**/*.{ts,tsx}',
      ],
      setupFilesAfterEnv: ['<rootDir>/jest.setup.node.js'],
      ...baseConfig,
      transform: {
        '^.+\\.(ts|tsx)$': ['ts-jest', {
          useESM: false,
          tsconfig: {
            module: 'commonjs',
            target: 'ES2017'
          }
        }],
      },
      collectCoverageFrom: [
        'app/api/**/*.{ts,tsx}',
        'app/lib/**/*.{ts,tsx}',
        '!app/**/*.d.ts',
        '!app/**/index.{ts,tsx}',
      ],
    },
    // JSDOM environment for component and hook tests
    {
      displayName: 'Component & Hook Tests',
      testEnvironment: 'jsdom',
      testMatch: [
        '<rootDir>/__tests__/components/**/*.{ts,tsx}',
        '<rootDir>/__tests__/hooks/**/*.{ts,tsx}',
        '<rootDir>/__tests__/utils/**/*.{ts,tsx}'
      ],
      setupFilesAfterEnv: ['<rootDir>/jest.setup.jsdom.js'],
      ...baseConfig,
      moduleNameMapper: {
        ...baseConfig.moduleNameMapper,
        '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
      },
      transform: {
        '^.+\\.(ts|tsx)$': ['ts-jest', {
          useESM: false,
          tsconfig: {
            jsx: 'react-jsx',
            module: 'commonjs',
            target: 'ES2017'
          }
        }],
      },
      collectCoverageFrom: [
        'app/components/**/*.{ts,tsx}',
        'app/hooks/**/*.{ts,tsx}',
        'app/lib/**/*.{ts,tsx}',
        '!app/lib/prisma.ts', // Skip prisma client
        '!app/**/*.d.ts',
        '!app/**/index.{ts,tsx}',
        '!app/globals.css',
      ],
    }
  ],
}

module.exports = config