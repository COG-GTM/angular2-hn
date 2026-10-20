import { expect, test } from '@playwright/test';

import { collectConsoleErrors, mockHnApi } from './fixtures';

// Port of the Angular protractor spec (e2e/src/app.e2e-spec.ts): the app loads and the browser
// logs no SEVERE errors. The Angular "Welcome to angular-hnpwa!" title check was stale CLI scaffolding.
test.describe('app', () => {
    test.beforeEach(async ({ page }) => {
        await mockHnApi(page);
    });

    test('loads the app shell without console errors', async ({ page }) => {
        const errors = collectConsoleErrors(page);
        await page.goto('/');

        await expect(page).toHaveTitle('Angular 2 HN');
        await expect(page.locator('#root .wrapper')).toBeVisible();
        await expect(page.getByTestId('header')).toBeVisible();
        await expect(page.getByTestId('footer')).toBeAttached();
        // The inline index.html app-loader hides once React has rendered into #root.
        await expect(page.locator('.app-loader')).toHaveCSS('opacity', '0');

        await page.waitForLoadState('networkidle');
        expect(errors).toEqual([]);
    });

    test('links the manifest and theme colour from index.html', async ({ page }) => {
        await page.goto('/');
        await expect(page.locator('link[rel="manifest"]')).toHaveAttribute('href', '/manifest.webmanifest');
        await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content', '#b92b27');
    });
});
