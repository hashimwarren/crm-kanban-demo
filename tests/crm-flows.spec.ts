import { test, expect } from '@playwright/test';

test.describe('Authentication with Clerk', () => {
  test('should redirect unauthenticated users to sign-in page', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Should be redirected to our custom sign-in page
    await expect(page).toHaveURL(/.*\/sign-in/);
  });

  test('should redirect from home to sign-in when not authenticated', async ({ page }) => {
    await page.goto('/');
    
    // Should redirect to sign-in page since user is not authenticated
    await expect(page).toHaveURL(/.*\/sign-in/);
  });

  test('protected routes should require authentication', async ({ page }) => {
    const protectedRoutes = ['/dashboard', '/leads', '/deals', '/kanban'];
    
    for (const route of protectedRoutes) {
      await page.goto(route);
      // Should be redirected to sign-in page
      await expect(page).toHaveURL(/.*\/sign-in/);
    }
  });

  test('sign-in page should display correctly', async ({ page }) => {
    await page.goto('/sign-in');
    
    // Should show sign-in form - use more flexible selectors
    await expect(page.locator('text=Sign in to your CRM')).toBeVisible();
    await expect(page.locator('text=Welcome back! Please enter your details.')).toBeVisible();
  });

  test('sign-up page should display correctly', async ({ page }) => {
    await page.goto('/sign-up');
    
    // Should show sign-up form - use more flexible selectors
    await expect(page.locator('text=Create your CRM account')).toBeVisible();
    await expect(page.locator('text=Get started with your CRM today!')).toBeVisible();
  });
});

test.describe('API Routes Authentication', () => {
  test('API routes should require authentication', async ({ request }) => {
    // Test that API routes return 401 for unauthenticated requests
    const apiRoutes = ['/api/leads', '/api/deals', '/api/users', '/api/activities'];
    
    for (const route of apiRoutes) {
      const response = await request.get(route);
      expect(response.status()).toBe(401);
    }
  });
});

test.describe('Application Structure (when authenticated)', () => {
  // Note: These tests will need authentication setup to pass
  // For now, they serve as documentation of expected behavior
  
  test.skip('dashboard page structure (requires auth)', async ({ page }) => {
    // This test would require setting up authentication first
    await page.goto('/dashboard');
    await expect(page.locator('nav h1')).toContainText('CRM');
    await expect(page.locator('main h1')).toContainText('Dashboard');
  });

  test.skip('leads page structure (requires auth)', async ({ page }) => {
    // This test would require setting up authentication first
    await page.goto('/leads');
    await expect(page.locator('main h1')).toContainText('Leads');
  });

  test.skip('kanban page structure (requires auth)', async ({ page }) => {
    // This test would require setting up authentication first
    await page.goto('/kanban');
    await expect(page.locator('main h1')).toContainText('Kanban Board');
  });

  test.skip('deals page structure (requires auth)', async ({ page }) => {
    // This test would require setting up authentication first
    await page.goto('/deals');
    await expect(page.locator('main h1')).toContainText('Deals');
  });
});

test.describe('Responsive Design (Auth pages)', () => {
  test('sign-in page should work on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/sign-in');
    
    // Should show the sign-in form properly on mobile
    await expect(page.locator('text=Sign in to your CRM')).toBeVisible();
  });

  test('sign-in page should work on tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/sign-in');
    
    // Should show the sign-in form properly on tablet
    await expect(page.locator('text=Sign in to your CRM')).toBeVisible();
  });

  test('sign-in page should work on desktop viewport', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/sign-in');
    
    // Should show the sign-in form properly on desktop
    await expect(page.locator('text=Sign in to your CRM')).toBeVisible();
  });
});
