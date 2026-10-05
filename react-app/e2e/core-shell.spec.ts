import { expect, test } from './fixtures';

test.describe('core shell', () => {
  test('header nav navigates between feeds and marks the active link', async ({ page }) => {
    await page.goto('/news/1');
    const nav = page.locator('.header-nav');
    await expect(page.locator('a.home-link')).toHaveClass(/\bactive\b/);

    for (const [label, path] of [
      ['new', '/newest/1'],
      ['show', '/show/1'],
      ['ask', '/ask/1'],
      ['jobs', '/jobs/1'],
    ]) {
      await nav.getByRole('link', { name: label, exact: true }).click();
      await expect(page).toHaveURL(new RegExp(`${path}$`));
      await expect(nav.getByRole('link', { name: label, exact: true })).toHaveClass(/\bactive\b/);
      await expect(page.locator('a.home-link')).not.toHaveClass(/\bactive\b/);
    }

    await page.locator('a.home-link').click();
    await expect(page).toHaveURL(/\/news\/1$/);
    await expect(page.locator('a.home-link')).toHaveClass(/\bactive\b/);
  });

  test('settings cog opens the panel and the close button closes it', async ({ page }) => {
    await page.goto('/news/1');
    const popup = page.locator('.popup');
    await expect(popup).toHaveCount(0);

    await page.getByAltText('Settings').click();
    await expect(popup).toBeVisible();
    await expect(popup.getByRole('heading', { name: 'Settings' })).toBeVisible();

    await popup.locator('.close').click();
    await expect(popup).toHaveCount(0);
  });

  test('switching the theme in settings updates .theme-root and persists across reload', async ({ page }) => {
    await page.addInitScript(() => {
      if (!sessionStorage.getItem('seeded')) {
        localStorage.setItem('theme', 'default');
        sessionStorage.setItem('seeded', '1');
      }
    });
    await page.goto('/news/1');
    const root = page.locator('.theme-root');
    await expect(root).toHaveClass(/\bdefault\b/);

    await page.getByAltText('Settings').click();
    await page.getByLabel('Night').check();
    await expect(root).toHaveClass(/\bnight\b/);

    await page.getByLabel('Black (AMOLED)').check();
    await expect(root).toHaveClass(/\bamoledblack\b/);
    await expect(root).not.toHaveClass(/\bnight\b/);

    await page.reload();
    await expect(root).toHaveClass(/\bamoledblack\b/);
    await page.getByAltText('Settings').click();
    await expect(page.getByLabel('Black (AMOLED)')).toBeChecked();
  });

  test('settings controls persist links, font size and list spacing', async ({ page }) => {
    await page.goto('/news/1');
    await page.getByAltText('Settings').click();
    await page.getByRole('checkbox').check();
    await page.getByLabel('Font size:').fill('20');
    await page.getByLabel('List spacing:').fill('6');

    await page.reload();
    await page.getByAltText('Settings').click();
    await expect(page.getByRole('checkbox')).toBeChecked();
    await expect(page.getByLabel('Font size:')).toHaveValue('20');
    await expect(page.getByLabel('List spacing:')).toHaveValue('6');
    expect(
      await page.evaluate(() => [
        localStorage.getItem('openLinkInNewTab'),
        localStorage.getItem('titleFontSize'),
        localStorage.getItem('listSpacing'),
      ])
    ).toEqual(['true', '20', '6']);
  });

  test('footer shows the GitHub link on desktop and is hidden on mobile', async ({ page, isMobile }) => {
    await page.goto('/news/1');
    const footer = page.locator('#footer');
    if (isMobile) {
      await expect(footer).toBeHidden();
    } else {
      await expect(footer).toContainText('Show this project some ❤ on GitHub');
      await expect(footer.getByRole('link', { name: 'GitHub' })).toHaveAttribute(
        'href',
        'https://github.com/hdjirdeh/angular2-hn'
      );
    }
  });
});
