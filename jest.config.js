/** @type {import('jest').Config} */
const config = {
  // Global configuration
  clearMocks: true,
  verbose: true,
  
  // Coverage configuration
  coverageReporters: ['text', 'text-summary', 'lcov', 'html'],
  coverageDirectory: 'coverage',
  
  // Use projects to aggregate coverage across the monorepo
  projects: [
    // Web app API tests
    {
      displayName: 'Web API Tests',
      testEnvironment: 'node',
      rootDir: './apps/web',
      testMatch: [
        '<rootDir>/__tests__/api/**/*.{ts,tsx}',
        '<rootDir>/__tests__/lib/**/*.{ts,tsx}',
      ],
      setupFilesAfterEnv: ['<rootDir>/jest.setup.node.js'],
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/app/$1',
        '^@boilerplate/config/(.*)$': '<rootDir>/../../packages/config/$1',
        '^@boilerplate/(.*)$': '<rootDir>/../../packages/$1/src',
      },
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
    // Web app component and hook tests
    {
      displayName: 'Web Component & Hook Tests',
      testEnvironment: 'jsdom',
      rootDir: './apps/web',
      testMatch: [
        '<rootDir>/__tests__/components/**/*.{ts,tsx}',
        '<rootDir>/__tests__/hooks/**/*.{ts,tsx}',
        '<rootDir>/__tests__/utils/**/*.{ts,tsx}'
      ],
      setupFilesAfterEnv: ['<rootDir>/jest.setup.jsdom.js'],
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/app/$1',
        '^@boilerplate/config/(.*)$': '<rootDir>/../../packages/config/$1',
        '^@boilerplate/(.*)$': '<rootDir>/../../packages/$1/src',
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
    },
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