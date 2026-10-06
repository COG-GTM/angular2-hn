import { expect, test } from '@playwright/test';
import { FEED_TITLES, ITEM_ID, mockHnApi } from './mockApi';
import { user } from '../src/test/fixtures';

test.beforeEach(async ({ page }) => {
  await mockHnApi(page);
});

test('feed navigation: redirect, header nav, pagination', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL(/\/news\/1$/);
  await expect(page.getByRole('link', { name: FEED_TITLES.news(1), exact: true })).toBeVisible();

  await page.getByRole('link', { name: 'new', exact: true }).click();
  await expect(page).toHaveURL(/\/newest\/1$/);
  await expect(page.getByRole('link', { name: FEED_TITLES.newest(1), exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'new', exact: true })).toHaveClass(/active/);

  await page.getByRole('link', { name: /More/ }).click();
  await expect(page).toHaveURL(/\/newest\/2$/);
  await expect(page.getByRole('link', { name: FEED_TITLES.newest(31), exact: true })).toBeVisible();
  await expect(page.locator('ol')).toHaveAttribute('start', '31');

  await page.getByRole('link', { name: /Prev/ }).click();
  await expect(page).toHaveURL(/\/newest\/1$/);

  await page.getByRole('link', { name: 'Hacker News home' }).click();
  await expect(page).toHaveURL(/\/news\/1$/);
});

test('item detail: open comments and collapse a thread', async ({ page }) => {
  await page.goto('/news/1');
  await page.locator('li.post').first().getByRole('link', { name: /comments/ }).first().click();
  await expect(page).toHaveURL(new RegExp(`/item/${ITEM_ID}$`));
  await expect(page.getByText('Top level comment')).toBeVisible();
  await expect(page.getByText('Nested reply')).toBeVisible();

  await page.getByText('[-]').first().click();
  await expect(page.getByText('Nested reply')).toBeHidden();
  await page.getByText('[+]').first().click();
  await expect(page.getByText('Nested reply')).toBeVisible();
});

test('user page: profile fields, unknown user error', async ({ page }) => {
  await page.goto('/news/1');
  await page.locator('li.post').first().getByRole('link', { name: user.id, exact: true }).first().click();
  await expect(page).toHaveURL(new RegExp(`/user/${user.id}$`));
  await expect(page.getByText(`${user.karma} ★`)).toBeVisible();
  await expect(page.getByText(`Created ${user.created}`)).toBeVisible();
  await expect(page.getByRole('link', { name: 'site' })).toHaveAttribute('href', 'https://paulgraham.com');

  await page.goto('/user/nobody-here');
  await expect(page.getByText(/Could not load user/)).toBeVisible();
});

test('settings: theme switch persists across reload', async ({ page }) => {
  await page.goto('/news/1');
  await page.getByRole('button', { name: 'Settings' }).click();
  await page.getByRole('radio', { name: 'Night' }).check();
  await page.getByRole('button', { name: 'Close settings' }).click();
  await expect(page.getByTestId('theme-root')).toHaveClass('night');
  await page.reload();
  await expect(page.getByTestId('theme-root')).toHaveClass('night');
});
