import { test, expect } from '@playwright/test';

test.describe('Reservations Page', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('http://localhost:3000/reservations');
		// Wait for the page to load and hotels to be fetched
		await page.waitForTimeout(2000);
	});

	test('should load the reservations page with filters and table', async ({ page }) => {
		// Check that the main heading is present
		await expect(page.getByRole('heading', { name: 'Reservations', level: 1 })).toBeVisible();

		// Check that filter inputs are present
		await expect(page.getByRole('combobox')).toBeVisible(); // Hotel dropdown
		await expect(page.getByPlaceholder('Smith')).toBeVisible(); // Surname
		await expect(page.getByPlaceholder('John')).toBeVisible(); // First name

		// Check that table is present
		await expect(page.getByRole('table')).toBeVisible();
	});

	test('should display hotel dropdown with options', async ({ page }) => {
		const hotelDropdown = page.getByRole('combobox');

		// Click to open dropdown
		await hotelDropdown.click();

		// Check that there are hotel options
		const options = await page.locator('option').all();
		expect(options.length).toBeGreaterThan(1); // At least "Select Hotel" + one hotel

		// Check that first hotel is auto-selected
		await expect(page).toHaveURL(/hotelId=/);
	});

	test('should filter reservations by surname', async ({ page }) => {
		// Wait for initial load
		await page.waitForTimeout(1000);

		// Type in surname filter
		const surnameInput = page.getByPlaceholder('Smith');
		await surnameInput.fill('Fayyaz');

		// Wait for URL to update
		await page.waitForTimeout(1000);

		// Check URL contains surname parameter
		await expect(page).toHaveURL(/surname=Fayyaz/);

		// Check that page resets to 1
		await expect(page).toHaveURL(/page=1/);
	});

	test('should display reservations in table', async ({ page }) => {
		// Wait for data to load
		await page.waitForTimeout(2000);

		// Check that table has data (not showing "Loading..." or "No results")
		const tableBody = page.locator('tbody');
		const rows = await tableBody.locator('tr').all();

		// Should have at least one row that's not a loading/empty state
		const firstRowText = await rows[0].textContent();
		expect(firstRowText).not.toContain('Loading');
		expect(firstRowText).not.toContain('No results');
	});

	test('should sync filters to URL', async ({ page }) => {
		await page.waitForTimeout(1000);

		// Fill in first name
		await page.getByPlaceholder('John').fill('Test');
		await page.waitForTimeout(500);

		// Check URL
		await expect(page).toHaveURL(/givenName=Test/);
	});

	test('should allow changing hotels', async ({ page }) => {
		await page.waitForTimeout(1000);

		const hotelDropdown = page.getByRole('combobox');
		const initialUrl = page.url();

		// Click dropdown
		await hotelDropdown.click();

		// Get all options
		const options = await page.locator('option').all();

		// If there's more than 2 options (Select Hotel + at least 2 hotels)
		if (options.length > 2) {
			// Select a different hotel
			await hotelDropdown.selectOption({ index: 2 });
			await page.waitForTimeout(1000);

			// URL should have changed
			expect(page.url()).not.toBe(initialUrl);
		}
	});

	test('should display pagination controls', async ({ page }) => {
		// Check pagination is visible
		await expect(page.getByRole('button', { name: 'Previous' })).toBeVisible();
		await expect(page.getByRole('button', { name: 'Next' })).toBeVisible();

		// Previous should be disabled on first page
		await expect(page.getByRole('button', { name: 'Previous' })).toBeDisabled();
	});

	test('should display reservation details in table', async ({ page }) => {
		await page.waitForTimeout(2000);

		// Check that column headers are present
		await expect(page.getByRole('columnheader', { name: 'Confirmation' })).toBeVisible();
		await expect(page.getByRole('columnheader', { name: 'Guest Name' })).toBeVisible();
		await expect(page.getByRole('columnheader', { name: 'Arrival' })).toBeVisible();
		await expect(page.getByRole('columnheader', { name: 'Departure' })).toBeVisible();
		await expect(page.getByRole('columnheader', { name: 'Status' })).toBeVisible();
	});
});
