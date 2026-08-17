import { expect, test } from '@playwright/test';

const profile = {
    id: 'pg',
    created: '5 years ago',
    karma: 155000,
    about: 'Bug fixer &amp; <i>essayist</i>',
};

test.describe('user profile', () => {
    test('renders the profile for the routed user', async ({ page }) => {
        await page.route('**/node-hnapi.herokuapp.com/user/*', (route) =>
            route.fulfill({ json: profile, headers: { 'access-control-allow-origin': '*' } }),
        );

        await page.goto('/user/pg');

        await expect(page.locator('.profile .main-details .name')).toHaveText('pg');
        await expect(page.locator('.profile .main-details .right')).toHaveText('155000 ★');
        await expect(page.locator('.profile .main-details .age')).toHaveText('Created 5 years ago');
        await expect(page.locator('.profile .other-details i')).toHaveText('essayist');
        await expect(page.locator('.profile .item-header .title-block')).toContainText('Profile: pg');
    });

    test('shows an error message when the user request fails', async ({ page }) => {
        await page.route('**/node-hnapi.herokuapp.com/user/*', (route) => route.fulfill({ status: 500, body: 'nope' }));

        await page.goto('/user/nobody');

        await expect(page.locator('.error-section')).toContainText('Could not load user nobody.');
    });

    test('the back button returns to the previous page', async ({ page }) => {
        await page.route('**/node-hnapi.herokuapp.com/user/*', (route) =>
            route.fulfill({ json: profile, headers: { 'access-control-allow-origin': '*' } }),
        );
        await page.route('**/news?*', (route) => route.fulfill({ json: [] }));

        await page.goto('/news/1');
        await page.goto('/user/pg');
        await expect(page.locator('.profile .main-details .name')).toHaveText('pg');

        await page.locator('.profile .back-button').dispatchEvent('click');
        await expect(page).toHaveURL(/\/news\/1$/);
    });
});
