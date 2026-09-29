import { Locator, Page } from '@playwright/test';

export class AppPage {
  constructor(private readonly page: Page) {}

  navigateTo() {
    return this.page.goto('/');
  }

  getHeaderNav(): Locator {
    return this.page.locator('app-root app-header .header-nav');
  }
}
