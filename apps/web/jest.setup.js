import '@testing-library/jest-dom';
import { setupServer } from 'msw/node';
import { handlers } from './__tests__/setup/msw-setup';
import { TEST_DATABASE, TEST_AUTH } from './__tests__/config/test-credentials';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
}));

// Mock Next.js image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => {
    // eslint-disable-next-line jsx-a11y/alt-text, @next/next/no-img-element
    return <img {...props} />;
  },
}));

// Setup MSW server
export const server = setupServer(...handlers);

// Establish API mocking before all tests
beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' });
});

// Reset any request handlers that we may add during the tests,
// so they don't affect other tests
afterEach(() => {
  server.resetHandlers();
  jest.clearAllMocks();
});

// Clean up after the tests are finished
afterAll(() => {
  server.close();
});

// Mock environment variables - using secure test configuration
process.env.NODE_ENV = 'test';
process.env.NEXTAUTH_SECRET = TEST_AUTH.SECRET;
process.env.DATABASE_URL = TEST_DATABASE.URL;