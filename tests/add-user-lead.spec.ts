import { test, expect } from '@playwright/test';

// This test now requires Clerk authentication

test.describe('CRM User/Lead Flow (Authentication Required)', () => {
  test('Should redirect to Clerk sign-in when accessing leads', async ({ page }) => {
    await page.goto('/leads');
    
    // Should be redirected to our local sign-in page
    await expect(page).toHaveURL(/.*\/sign-in/);
  });

  test.skip('Add a new user/lead and verify it appears in the leads list (requires auth setup)', async ({ page }) => {
    // This test would need to:
    // 1. Set up authentication with Clerk first
    // 2. Then run the lead creation flow
    
    // Go to the leads page
    await page.goto('/leads');

    // Click the button to add a new lead (adjust selector as needed)
    await page.getByRole('button', { name: /new lead/i }).click();

    // Fill out the new lead form (adjust field selectors and values as needed)
    await page.getByLabel(/name/i).fill('Test User');
    await page.getByLabel(/email/i).fill('testuser@example.com');
    await page.getByLabel(/company/i).fill('Test Company');
    await page.getByLabel(/status/i).selectOption('New');

    // Submit the form
    await page.getByRole('button', { name: /create|save/i }).click();

    // Wait for navigation or success message
    await page.waitForTimeout(500); // Adjust as needed for your app

    // Check that the new lead appears in the leads list
    await expect(page.getByText('Test User')).toBeVisible();
    await expect(page.getByText('testuser@example.com')).toBeVisible();
    await expect(page.getByText('Test Company')).toBeVisible();
  });
});
