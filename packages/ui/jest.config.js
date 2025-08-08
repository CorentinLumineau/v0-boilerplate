/** @type {import('jest').Config} */
module.exports = {
  displayName: 'UI Package Tests',
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testMatch: [
    '<rootDir>/**/__tests__/**/*.{ts,tsx}',
    '<rootDir>/**/*.{test,spec}.{ts,tsx}'
  ],
  // File extensions to consider
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  
  // Transform configuration
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  
  // Transform ignore patterns
  transformIgnorePatterns: [
    'node_modules/(?!(node-fetch)/)'
  ],
  
  // Coverage configuration
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/index.{ts,tsx}',
  ],
  
  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85,
    },
  },
  
  // TypeScript Jest configuration
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