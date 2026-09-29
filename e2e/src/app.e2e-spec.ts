import { ConsoleMessage, expect, test } from '@playwright/test';
import { AppPage } from './app.po';

test.describe('workspace-project App', () => {
  let page: AppPage;
  let browserErrors: string[];

  test.beforeEach(async ({ page: browserPage }) => {
    browserErrors = [];
    browserPage.on('console', (msg: ConsoleMessage) => {
      if (msg.type() === 'error') {
        browserErrors.push(msg.text());
      }
    });
    browserPage.on('pageerror', (error: Error) => browserErrors.push(error.message));
    page = new AppPage(browserPage);
  });

  test('should display the app shell', async ({ page: browserPage }) => {
    await page.navigateTo();
    await expect(browserPage).toHaveTitle('Angular 2 HN');
    await expect(page.getHeaderNav()).toHaveText(/new\s*\|\s*show\s*\|\s*ask\s*\|\s*jobs/);
  });

  test.afterEach(() => {
    // Assert that there are no errors emitted from the browser
    expect(browserErrors).toEqual([]);
  });
});
