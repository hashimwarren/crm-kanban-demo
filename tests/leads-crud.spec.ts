import { test, expect } from '@playwright/test';

// CRUD tests for Leads in the CRM app
// Note: These tests require authentication and will be skipped until auth setup is implemented

test.describe('CRM Leads CRUD (Authentication Required)', () => {
  test('Should redirect to Clerk sign-in when accessing leads', async ({ page }) => {
    await page.goto('/leads');
    
    // Should be redirected to our local sign-in page
    await expect(page).toHaveURL(/.*\/sign-in/);
  });

  // These tests are skipped until we implement authentication setup
  test.skip('Create a new lead (requires auth setup)', async ({ page }) => {
    // This test would need to:
    // 1. Authenticate with Clerk first
    // 2. Then run the CRUD operations
    await page.goto('/leads');
    await page.getByRole('button', { name: /add lead/i }).click();
    await page.getByLabel('First Name').fill('CRUD');
    await page.getByLabel('Last Name').fill('Test User');
    await page.getByLabel('Email').fill('crudtest@example.com');
    await page.getByLabel('Phone').fill('123-456-7890');
    await page.getByLabel('Company').fill('CRUD Test Company');
    await page.getByLabel('Job Title').fill('QA');
    await page.getByLabel('Status').click();
    await page.getByRole('option', { name: 'New' }).click();
    await page.getByLabel('Source').click();
    await page.getByRole('option', { name: 'Website' }).click();
    await page.getByLabel('Notes').fill('Automated CRUD test');
    await page.getByRole('button', { name: /create lead/i }).click();
    await expect(page.getByText('CRUD Test Company')).toBeVisible();
    await expect(page.getByText('crudtest@example.com')).toBeVisible();
  });

  test.skip('Read (view) a lead (requires auth setup)', async ({ page }) => {
    // This test would need authentication setup first
    await page.goto('/leads');
    await expect(page.getByText('CRUD Test Company')).toBeVisible();
    await expect(page.getByText('crudtest@example.com')).toBeVisible();
  });

  // Update and Delete flows would require edit/delete UI, which is not implemented in the current codebase.
});

test.describe('API Authentication', () => {
  test('Leads API should require authentication', async ({ request }) => {
    const response = await request.get('/api/leads');
    expect(response.status()).toBe(401);
  });

  test('Leads API POST should require authentication', async ({ request }) => {
    const response = await request.post('/api/leads', {
      data: {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com'
      }
    });
    expect(response.status()).toBe(401);
  });
});
