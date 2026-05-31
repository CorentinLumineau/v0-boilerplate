/**
 * Test credentials and constants
 * These are safe to use in testing environments only
 */

export const TEST_CREDENTIALS = {
  ADMIN: {
    EMAIL: process.env.TEST_ADMIN_EMAIL || 'admin@test.local',
    PASSWORD: process.env.TEST_ADMIN_PASSWORD || 'test-password-admin',
  },
  USER: {
    EMAIL: process.env.TEST_USER_EMAIL || 'user@test.local',
    PASSWORD: process.env.TEST_USER_PASSWORD || 'test-password-user',
  },
} as const;

export const TEST_DATABASE = {
  URL: process.env.TEST_DATABASE_URL || 'postgresql://test_user:test_pass@localhost:5432/test_db',
} as const;

export const TEST_AUTH = {
  SECRET: process.env.TEST_AUTH_SECRET || 'test-secret-key-for-testing-only',
  TOKEN: 'mock-jwt-token-for-testing',
} as const;

// Validate we're in test environment
if (process.env.NODE_ENV !== 'test') {
  throw new Error('Test credentials should only be used in test environment');
}