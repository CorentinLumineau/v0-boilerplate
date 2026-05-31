import { test, expect } from '@playwright/test';
import { TEST_CREDENTIALS } from '../../config/test-credentials';

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    // Start from the login page before each test
    await page.goto('/login');
  });

  test('should display login form', async ({ page }) => {
    // Verify page title
    await expect(page).toHaveTitle(/Login/);

    // Verify form elements exist
    await expect(page.getByRole('textbox', { name: /email/i })).toBeVisible();
    await expect(page.getByRole('textbox', { name: /password/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
  });

  test('should show validation errors for empty form', async ({ page }) => {
    // Click submit without filling the form
    await page.getByRole('button', { name: /sign in/i }).click();

    // Verify validation messages appear
    await expect(page.getByText(/email is required/i)).toBeVisible();
    await expect(page.getByText(/password is required/i)).toBeVisible();
  });

  test('should show error for invalid email format', async ({ page }) => {
    // Fill in invalid email
    await page.getByRole('textbox', { name: /email/i }).fill('invalid-email');
    await page.getByRole('textbox', { name: /password/i }).fill('password123');
    await page.getByRole('button', { name: /sign in/i }).click();

    // Verify validation message
    await expect(page.getByText(/invalid email format/i)).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    // Fill in form with invalid credentials
    await page.getByRole('textbox', { name: /email/i }).fill('wrong@test.local');
    await page.getByRole('textbox', { name: /password/i }).fill('wrongpassword');
    await page.getByRole('button', { name: /sign in/i }).click();

    // Verify error message
    await expect(page.getByText(/invalid credentials/i)).toBeVisible();
  });

  test('should successfully login with valid credentials', async ({ page }) => {
    // Fill in form with valid credentials using secure test credentials
    await page.getByRole('textbox', { name: /email/i }).fill(TEST_CREDENTIALS.ADMIN.EMAIL);
    await page.getByRole('textbox', { name: /password/i }).fill(TEST_CREDENTIALS.ADMIN.PASSWORD);
    await page.getByRole('button', { name: /sign in/i }).click();

    // Verify redirect to dashboard
    await expect(page).toHaveURL(/\/dashboard/);
    
    // Verify dashboard content is visible
    await expect(page.getByText(/dashboard/i)).toBeVisible();
  });

  test('should redirect to signup page when clicking signup link', async ({ page }) => {
    // Click on signup link
    await page.getByRole('link', { name: /sign up/i }).click();

    // Verify redirect to signup page
    await expect(page).toHaveURL(/\/signup/);
    await expect(page).toHaveTitle(/Sign Up/);
  });

  test('should handle form submission loading state', async ({ page }) => {
    // Fill in form
    await page.getByRole('textbox', { name: /email/i }).fill(TEST_CREDENTIALS.ADMIN.EMAIL);
    await page.getByRole('textbox', { name: /password/i }).fill(TEST_CREDENTIALS.ADMIN.PASSWORD);

    // Submit form and check loading state
    const submitButton = page.getByRole('button', { name: /sign in/i });
    await submitButton.click();
    
    // Check if button is disabled during submission
    await expect(submitButton).toBeDisabled();
    
    // Or check for loading text/spinner if implemented
    const loadingButton = page.getByRole('button', { name: /signing in|loading/i });
    if (await loadingButton.isVisible()) {
      await expect(loadingButton).toBeVisible();
    }
  });

  test('should successfully logout after login', async ({ page }) => {
    // First login
    await page.getByRole('textbox', { name: /email/i }).fill(TEST_CREDENTIALS.ADMIN.EMAIL);
    await page.getByRole('textbox', { name: /password/i }).fill(TEST_CREDENTIALS.ADMIN.PASSWORD);
    await page.getByRole('button', { name: /sign in/i }).click();
    
    // Wait for redirect to dashboard
    await expect(page).toHaveURL(/\/dashboard/);
    
    // Find and click logout button (could be in a dropdown or direct button)
    const logoutButton = page.getByRole('button', { name: /logout|sign out/i })
      .or(page.getByRole('link', { name: /logout|sign out/i }));
    
    await logoutButton.click();
    
    // Verify redirect back to login page
    await expect(page).toHaveURL(/\/login/);
    
    // Verify login form is visible again
    await expect(page.getByRole('textbox', { name: /email/i })).toBeVisible();
  });

  test('should maintain session persistence', async ({ page }) => {
    // Login first
    await page.getByRole('textbox', { name: /email/i }).fill(TEST_CREDENTIALS.ADMIN.EMAIL);
    await page.getByRole('textbox', { name: /password/i }).fill(TEST_CREDENTIALS.ADMIN.PASSWORD);
    await page.getByRole('button', { name: /sign in/i }).click();
    
    // Wait for successful login
    await expect(page).toHaveURL(/\/dashboard/);
    
    // Reload the page to test session persistence
    await page.reload();
    
    // Should still be on dashboard (session maintained)
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByText(/dashboard/i)).toBeVisible();
  });
});