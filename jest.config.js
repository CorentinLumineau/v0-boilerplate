/** @type {import('jest').Config} */
const config = {
  // Global configuration
  clearMocks: true,
  verbose: true,
  
  // Coverage configuration
  coverageReporters: ['text', 'text-summary', 'lcov', 'html'],
  coverageDirectory: 'coverage',
  
  // Use projects to aggregate coverage across the monorepo
  // Note: Web app tests are currently deleted. When added back, include them here.
  projects: [
    // UI package tests
    {
      displayName: 'UI Package Tests',
      preset: 'ts-jest',
      testEnvironment: 'jsdom',
      rootDir: './packages/ui',
      setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
      },
      testMatch: [
        '<rootDir>/**/__tests__/**/*.{ts,tsx}',
        '<rootDir>/**/*.{test,spec}.{ts,tsx}'
      ],
      transform: {
        '^.+\\.(ts|tsx)$': 'ts-jest',
      },
      transformIgnorePatterns: [
        'node_modules/(?!(node-fetch)/)'
      ],
      collectCoverageFrom: [
        'src/**/*.{ts,tsx}',
        '!src/**/*.d.ts',
        '!src/**/index.{ts,tsx}',
      ],
      // Remove individual coverage thresholds to use global ones
      globals: {
        'ts-jest': {
          useESM: false,
          isolatedModules: true,
          tsconfig: {
            jsx: 'react-jsx',
            jsxImportSource: 'react',
            esModuleInterop: true,
            allowSyntheticDefaultImports: true,
          }
        }
      }
    }
  ],
  
  // Global coverage thresholds (aggregated across all projects)
  coverageThreshold: {
    global: {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85,
    },
  },
}

module.exports = config