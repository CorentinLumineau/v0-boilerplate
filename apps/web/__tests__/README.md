# Testing Guide

This document provides comprehensive guidelines for testing in our Next.js application following the testing manifest and Milestone 01 requirements.

## Table of Contents

- [Testing Philosophy](#testing-philosophy)
- [Testing Stack](#testing-stack)
- [Directory Structure](#directory-structure)
- [Writing Tests](#writing-tests)
- [Running Tests](#running-tests)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## Testing Philosophy

We follow the testing pyramid with the following distribution:
- **70% Unit Tests**: Fast, isolated tests for individual functions/components
- **20% Integration Tests**: Tests that verify multiple components working together
- **10% E2E Tests**: Complete user workflow tests

### Core Principles

- **Fast Feedback**: Unit tests complete in milliseconds
- **Reliable**: Tests are deterministic and stable
- **Maintainable**: Tests are easy to read and update
- **Isolated**: Tests don't depend on external services
- **Representative**: Tests mirror real-world usage

## Testing Stack

### Core Tools
- **Jest**: Test runner and assertion library
- **React Testing Library**: Component testing
- **MSW (Mock Service Worker)**: API mocking
- **Playwright**: End-to-end testing
- **@faker-js/faker**: Test data generation

### Supporting Tools
- **@testing-library/jest-dom**: Custom DOM matchers
- **@testing-library/user-event**: User interaction simulation
- **supertest**: API testing

## Directory Structure

```
__tests__/
├── __mocks__/          # Global mocks
├── setup/              # Test configuration
│   ├── test-utils.tsx  # Custom render functions
│   └── msw-setup.ts    # API mocking setup
├── fixtures/           # Static test data
├── factories/          # Dynamic test data generators
├── unit/               # Unit tests
├── integration/        # Integration tests
└── e2e/                # End-to-end tests
```

## Writing Tests

### Unit Tests

**Location**: `__tests__/unit/`

Test individual components, functions, or hooks in isolation:

```typescript
// __tests__/unit/components/button.test.tsx
import { render, screen } from '../setup/test-utils';
import { Button } from '@/components/ui/button';

describe('Button', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  it('handles click events', async () => {
    const mockClick = jest.fn();
    const user = userEvent.setup();
    
    render(<Button onClick={mockClick}>Click me</Button>);
    
    await user.click(screen.getByRole('button'));
    expect(mockClick).toHaveBeenCalledTimes(1);
  });
});
```

### Integration Tests

**Location**: `__tests__/integration/`

Test API routes and feature interactions:

```typescript
// __tests__/integration/api/users.test.ts
import { GET } from '@/app/api/users/route';
import { setupMSW, teardownMSW } from '../setup/msw-setup';

describe('/api/users', () => {
  beforeEach(() => setupMSW());
  afterEach(() => teardownMSW());

  it('should return users list', async () => {
    const request = new NextRequest('http://localhost:3000/api/users');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(Array.isArray(data.data.users)).toBe(true);
  });
});
```

### E2E Tests

**Location**: `__tests__/e2e/`

Test complete user workflows:

```typescript
// __tests__/e2e/user-flow.spec.ts
import { test, expect } from '@playwright/test';

test('complete user registration flow', async ({ page }) => {
  await page.goto('/signup');
  
  await page.getByRole('textbox', { name: /email/i }).fill('test@example.com');
  await page.getByRole('textbox', { name: /password/i }).fill('password123');
  await page.getByRole('button', { name: /sign up/i }).click();
  
  await expect(page).toHaveURL('/dashboard');
});
```

## Running Tests

### Available Scripts

```bash
# All tests
pnpm test

# Watch mode (development)
pnpm test:watch

# CI mode with coverage
pnpm test:ci

# Unit tests only
pnpm test:unit

# Integration tests only
pnpm test:integration

# E2E tests
pnpm test:e2e

# Coverage report
pnpm test:coverage
```

### Environment Setup

Tests require proper environment variables. Create `.env.test`:

```env
NODE_ENV=test
DATABASE_URL=postgresql://test:test@localhost:5432/test_db
NEXTAUTH_SECRET=test-secret
```

## Best Practices

### Test Organization

1. **Group related tests** using `describe` blocks
2. **Use descriptive test names** that explain the scenario
3. **Follow AAA pattern**: Arrange, Act, Assert

```typescript
describe('UserForm', () => {
  describe('validation', () => {
    it('should show error when email is invalid', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<UserForm onSubmit={jest.fn()} />);

      // Act
      await user.type(screen.getByLabelText(/email/i), 'invalid-email');
      await user.click(screen.getByRole('button', { name: /submit/i }));

      // Assert
      await expect(screen.getByText(/invalid email/i)).toBeVisible();
    });
  });
});
```

### Mock Strategy

1. **Mock external dependencies** at service boundaries
2. **Use MSW** for API mocking in integration tests
3. **Reset mocks** between tests

```typescript
beforeEach(() => {
  jest.clearAllMocks();
  server.resetHandlers();
});
```

### Data Management

1. **Use factories** for generating test data
2. **Use fixtures** for static test data
3. **Keep test data minimal** but realistic

```typescript
// Good: Use factory with minimal data
const user = createUserFactory({ email: 'test@example.com' });

// Better: Use factory with specific scenario
const scenarios = createTestUserScenarios();
const adminUser = scenarios.adminUser;
```

### Assertions

1. **Be specific** in assertions
2. **Test both success and failure paths**
3. **Use appropriate matchers**

```typescript
// Good
expect(response.status).toBe(200);
expect(data.users).toHaveLength(5);
expect(screen.getByRole('button')).toBeDisabled();

// Better with custom matchers
expect(apiResponse).toMatchSuccessResponse();
expect(userForm).toHaveValidationError('email');
```

## Coverage Requirements

We enforce **90% coverage** across all metrics:
- **Branches**: 90%
- **Functions**: 90% 
- **Lines**: 90%
- **Statements**: 90%

### Coverage Exclusions

The following files are excluded from coverage:
- Configuration files (`*.config.{js,ts}`)
- Story files (`*.stories.{js,ts,tsx}`)
- Type definition files (`*.d.ts`)
- Next.js special files (`layout.tsx`, `loading.tsx`, `error.tsx`)

## Troubleshooting

### Common Issues

#### Jest Configuration Issues

```bash
# Clear Jest cache
pnpm exec jest --clearCache

# Run with verbose output
pnpm test --verbose
```

#### MSW Setup Issues

```typescript
// Ensure MSW server is started in jest.setup.js
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

#### Playwright Issues

```bash
# Install browsers
pnpm exec playwright install

# Run with UI mode for debugging
pnpm test:e2e:ui

# Generate test code
pnpm exec playwright codegen localhost:3000
```

### Debug Mode

Run tests in debug mode:

```bash
# Debug Jest tests
node --inspect-brk node_modules/.bin/jest --runInBand

# Debug Playwright tests
pnpm exec playwright test --debug
```

## Contributing

When adding new features:

1. **Write tests first** (TDD approach recommended)
2. **Ensure 90% coverage** for new code
3. **Update this documentation** if adding new testing patterns
4. **Run full test suite** before submitting PR

### Test Templates

Use these templates for consistency:

- [Unit Test Template](./templates/unit-test.template.ts)
- [Integration Test Template](./templates/integration-test.template.ts)
- [E2E Test Template](./templates/e2e-test.template.ts)

## Questions?

For questions about testing:
1. Check this documentation first
2. Review existing test examples
3. Ask in team chat or create an issue

Remember: **Good tests are investments in code quality and team productivity!**