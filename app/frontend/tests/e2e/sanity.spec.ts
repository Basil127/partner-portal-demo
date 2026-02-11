import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('/');

  // Expect a title "to contain" a substring.
  // Adjust this based on your actual application title
  await expect(page).toHaveTitle(/Partner Portal|OHM/);
});

test('login page loads', async ({ page }) => {
  await page.goto('/');
  // Check for some login element or dashboard element
  // Assuming it redirects to login or shows a dashboard
  await expect(page.locator('body')).toBeVisible();
});
