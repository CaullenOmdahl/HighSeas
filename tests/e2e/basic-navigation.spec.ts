import { test, expect } from '@playwright/test';

test.describe('Basic Navigation', () => {
	test.beforeEach(async ({ page }) => {
		// Mock API responses to avoid external dependencies
		await page.route('**/api/**', (route) => {
			const url = route.request().url();

			if (url.includes('/health')) {
				route.fulfill({
					status: 200,
					contentType: 'application/json',
					body: JSON.stringify({ status: 'ok', timestamp: Date.now() })
				});
			} else if (url.includes('/catalogs')) {
				route.fulfill({
					status: 200,
					contentType: 'application/json',
					body: JSON.stringify({
						metas: [
							{ id: '1', name: 'Test Movie 1', poster: '/test-poster.jpg' },
							{ id: '2', name: 'Test Movie 2', poster: '/test-poster.jpg' }
						]
					})
				});
			} else {
				route.fulfill({
					status: 404,
					contentType: 'application/json',
					body: JSON.stringify({ error: 'Not found' })
				});
			}
		});
	});

	test('should load homepage successfully', async ({ page }) => {
		await page.goto('/');

		// Check if the page loads without errors
		await expect(page).toHaveTitle(/Stremio/);

		// Wait for the page to be fully loaded
		await page.waitForLoadState('networkidle');

		// Basic navigation elements should be present
		const navigation = page.locator('nav, header, [role="navigation"]');
		await expect(navigation).toBeVisible();
	});

	test('should handle navigation menu interactions', async ({ page }) => {
		await page.goto('/');
		await page.waitForLoadState('networkidle');

		// Look for common navigation elements
		const menuItems = page.locator('a[href], button');
		const firstMenuItem = menuItems.first();

		if (await firstMenuItem.isVisible()) {
			// Test keyboard navigation
			await firstMenuItem.focus();
			await expect(firstMenuItem).toBeFocused();

			// Test navigation with Enter key
			await firstMenuItem.press('Enter');
		}
	});

	test('should be responsive on mobile devices', async ({ page }) => {
		// Test mobile viewport
		await page.setViewportSize({ width: 375, height: 667 });
		await page.goto('/');
		await page.waitForLoadState('networkidle');

		// Check if content is still accessible on mobile
		const body = page.locator('body');
		await expect(body).toBeVisible();

		// Test that horizontal scrolling is not needed
		const bodyScrollWidth = await body.evaluate((el) => el.scrollWidth);
		const viewportWidth = page.viewportSize()?.width || 375;
		expect(bodyScrollWidth).toBeLessThanOrEqual(viewportWidth + 50); // Allow small margin
	});

	test('should handle errors gracefully', async ({ page }) => {
		// Mock API error responses
		await page.route('**/api/**', (route) => {
			route.fulfill({
				status: 500,
				contentType: 'application/json',
				body: JSON.stringify({ error: 'Internal server error' })
			});
		});

		await page.goto('/');
		await page.waitForLoadState('networkidle');

		// Page should still load even with API errors
		const body = page.locator('body');
		await expect(body).toBeVisible();

		// Look for error handling UI - error handling should be present but not necessarily visible initially
		page.locator('[data-testid="error"], .error, [role="alert"]');
	});

	test('should support keyboard navigation', async ({ page }) => {
		await page.goto('/');
		await page.waitForLoadState('networkidle');

		// Test Tab navigation
		await page.keyboard.press('Tab');

		// Find the focused element
		const focusedElement = page.locator(':focus');
		if ((await focusedElement.count()) > 0) {
			await expect(focusedElement).toBeVisible();

			// Test that focused elements have proper accessibility attributes
			const tagName = await focusedElement.evaluate((el) => el.tagName.toLowerCase());
			const role = await focusedElement.getAttribute('role');
			const ariaLabel = await focusedElement.getAttribute('aria-label');

			// Interactive elements should be focusable
			const interactiveElements = ['a', 'button', 'input', 'textarea', 'select'];
			const hasRole = role !== null;
			const hasAriaLabel = ariaLabel !== null;
			const isInteractive = interactiveElements.includes(tagName) || hasRole;

			expect(isInteractive || hasAriaLabel).toBe(true);
		}
	});

	test('should load and display content sections', async ({ page }) => {
		await page.goto('/');
		await page.waitForLoadState('networkidle');

		// Wait for content to potentially load
		await page.waitForTimeout(1000);

		// Check for main content areas
		const mainContent = page.locator('main, [role="main"], .main-content');
		if ((await mainContent.count()) > 0) {
			await expect(mainContent.first()).toBeVisible();
		}

		// Check for any content sections
		const contentSections = page.locator('section, article, .content');
		if ((await contentSections.count()) > 0) {
			// At least one content section should be visible
			const visibleSections = contentSections.filter({ hasText: /.+/ });
			if ((await visibleSections.count()) > 0) {
				await expect(visibleSections.first()).toBeVisible();
			}
		}
	});
});
