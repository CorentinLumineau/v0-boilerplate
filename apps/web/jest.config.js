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
  
  // High coverage thresholds for specific files (extends base config)
  coverageThreshold: {
    ...baseConfig.coverageThreshold,
    // Specific thresholds for critical files
    'app/api/**/*.ts': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
    'app/lib/preferences.ts': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
    'app/hooks/use-settings-store.tsx': {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    }
  },
}

module.exports = config