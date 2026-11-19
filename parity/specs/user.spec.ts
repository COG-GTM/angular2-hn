import { expect, fixture, live, test } from '../fixtures';

type User = { id: string; karma: number; created: string; about: string };

test.describe('user profile', () => {
    test('shows id, karma, account age and about', async ({ page }) => {
        const id = live ? 'pg' : 'harrisonpage';
        await page.goto(`/user/${id}`);
        await expect(page.getByText(id, { exact: true }).first()).toBeVisible();
        await expect(page.getByText(/^Created .+ ago$/)).toBeVisible();
        await expect(page.getByText(/^\d+ ★$/)).toBeVisible();
        if (live) return;

        const user = fixture<User>(`user-${id}`);
        await expect(page.getByText(`${user.karma} ★`, { exact: true })).toBeVisible();
        await expect(page.getByText(`Created ${user.created}`, { exact: true })).toBeVisible();
        await expect(page.getByText(user.about, { exact: true })).toBeVisible();
    });
});
