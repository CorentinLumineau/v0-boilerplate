/** @type {import('jest').Config} */
const baseConfig = {
  
  // Common module name mappings
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/app/$1',
    '^@boilerplate/types$': '<rootDir>/../../packages/types/src',
    '^@boilerplate/config/(.*)$': '<rootDir>/../../packages/config/$1',
    '^@boilerplate/ui$': '<rootDir>/../../packages/ui/src',
  },
  
  // File extensions to consider
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  
  // Transform ignore patterns
  transformIgnorePatterns: [
    'node_modules/(?!(node-fetch)/)'
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
  
  
  // Common collect coverage patterns
  collectCoverageFrom: [
    'app/**/*.{ts,tsx}',
    '!app/**/*.d.ts',
    '!app/**/index.{ts,tsx}',
    '!app/globals.css',
  ],
}

module.exports = baseConfig