import { expect, test, type Page } from '@playwright/test';

import { mockHackerNewsApi } from './fixtures';

test.beforeEach(async ({ context }) => {
  await mockHackerNewsApi(context);
});

const firstTitle = (page: Page) => page.locator('.post .title').first();

test.describe('feeds', () => {
  test('redirects to the first news page', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/news\/1$/);
    await expect(firstTitle(page)).toHaveText('News story 1');
    await expect(page.locator('.post')).toHaveCount(30);
  });

  for (const [label, path, title] of [
    ['new', '/newest/1', 'Newest story 1'],
    ['show', '/show/1', 'Show HN story 1'],
    ['ask', '/ask/1', 'Ask HN story 1'],
    ['jobs', '/jobs/1', 'Job posting 1'],
  ]) {
    test(`navigates to the ${label} feed from the header`, async ({ page }) => {
      await page.goto('/news/1');
      await page.locator('.header-nav').getByRole('link', { name: label, exact: true }).click();
      await expect(page).toHaveURL(new RegExp(`${path}$`));
      await expect(firstTitle(page)).toHaveText(title);
    });
  }

  test('shows the jobs header', async ({ page }) => {
    await page.goto('/jobs/1');
    await expect(page.locator('.job-header')).toContainText('funded by Y Combinator');
  });

  test('paginates with More and Prev', async ({ page }) => {
    await page.goto('/news/1');
    await page.getByRole('link', { name: 'More ›' }).click();
    await expect(page).toHaveURL(/\/news\/2$/);
    await expect(firstTitle(page)).toHaveText('News story 31');
    await expect(page.locator('ol')).toHaveAttribute('start', '31');

    await page.getByRole('link', { name: '‹ Prev' }).click();
    await expect(page).toHaveURL(/\/news\/1$/);
    await expect(page.getByRole('link', { name: '‹ Prev' })).toHaveCount(0);
  });
});

test.describe('item details', () => {
  test('renders the story and a collapsible comment tree', async ({ page }) => {
    await page.goto('/item/1');
    await expect(page.locator('.subject')).toHaveText('Tell us about your projects.');
    await expect(page.getByText('Top level comment')).toBeVisible();
    await expect(page.getByText('Nested reply')).toBeVisible();
    await expect(page.getByText('[deleted]')).toBeVisible();

    await page.locator('.collapse', { hasText: '[-]' }).first().click();
    await expect(page.getByText('Top level comment')).toBeHidden();
    await expect(page.getByText('Nested reply')).toBeHidden();
    await page.locator('.collapse', { hasText: '[+]' }).click();
    await expect(page.getByText('Nested reply')).toBeVisible();
  });

  test('links comment authors to their profile', async ({ page }) => {
    await page.goto('/item/1');
    await page.getByRole('link', { name: 'alice' }).click();
    await expect(page).toHaveURL(/\/user\/alice$/);
    await expect(page.getByText('Could not load user alice.')).toBeVisible();
  });
});

test.describe('user profile', () => {
  test('renders the profile', async ({ page }) => {
    await page.goto('/user/pg');
    await expect(page.locator('.main-details .name')).toHaveText('pg');
    await expect(page.locator('.main-details .right')).toHaveText('157316 ★');
    await expect(page.getByText('Created 20 years ago')).toBeVisible();
    await expect(page.getByText('Bug fixer.')).toBeVisible();
  });
});

test.describe('settings', () => {
  test('changes and persists theme, font size and link target', async ({ page }) => {
    await page.goto('/news/1');
    await expect(page.locator('#root > div')).toHaveClass('default');

    await page.getByAltText('Settings').click();
    const dialog = page.getByRole('dialog', { name: 'Settings' });
    await dialog.getByLabel('Night').check();
    await expect(page.locator('#root > div')).toHaveClass('night');
    await dialog.getByLabel('Black (AMOLED)').check();
    await expect(page.locator('#root > div')).toHaveClass('amoledblack');
    await expect(page.locator('#header')).toHaveCSS('background-color', 'rgb(0, 0, 0)');

    await dialog.getByLabel('Font size:').fill('22');
    await dialog.getByLabel('Open links in a new tab').check();
    await dialog.getByLabel('Close settings').click();
    await expect(dialog).toBeHidden();

    await page.reload();
    await expect(page.locator('#root > div')).toHaveClass('amoledblack');
    await expect(firstTitle(page)).toHaveCSS('font-size', '22px');
    await expect(firstTitle(page)).toHaveAttribute('target', '_blank');
  });

  test('follows the system dark mode preference by default', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/news/1');
    await expect(page.locator('#root > div')).toHaveClass('night');
  });
});

test.describe('responsive layout', () => {
  test('shows the layout that matches the viewport', async ({ page, isMobile }) => {
    await page.goto('/news/1');
    await expect(firstTitle(page)).toBeVisible();
    await expect(page.locator('.subtext-palm').first()).toBeVisible({ visible: !!isMobile });
    await expect(page.locator('.subtext-laptop').first()).toBeVisible({ visible: !isMobile });
    await expect(page.locator('#footer')).toBeVisible({ visible: !isMobile });
  });
});

test.describe('progressive web app', () => {
  test('exposes an installable manifest', async ({ page, request }) => {
    await page.goto('/news/1');
    const href = await page.locator('link[rel="manifest"]').getAttribute('href');
    expect(href).toBe('/manifest.json');

    const manifest = await (await request.get(href!)).json();
    expect(manifest).toMatchObject({ name: 'Angular 2 HN', display: 'standalone', theme_color: '#b92b27' });
    expect(manifest.icons.map((icon: { sizes: string }) => icon.sizes)).toEqual(
      expect.arrayContaining(['192x192', '512x512'])
    );
  });

  test('works offline after the first visit', async ({ page, context }) => {
    await page.goto('/news/1');
    await expect(firstTitle(page)).toHaveText('News story 1');
    await page.evaluate(async () => {
      await navigator.serviceWorker.ready;
    });
    await page.reload();
    await expect.poll(() => page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true);
    await expect(firstTitle(page)).toHaveText('News story 1');

    await context.unrouteAll();
    await context.setOffline(true);
    await page.reload();
    await expect(page.locator('#header')).toBeVisible();
    await expect(firstTitle(page)).toHaveText('News story 1');

    await page.locator('.header-nav').getByRole('link', { name: 'ask', exact: true }).click();
    await expect(page.getByText('Could not load ask stories.')).toBeVisible();
    await context.setOffline(false);
  });
});
