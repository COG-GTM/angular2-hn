import { browser, by, element } from 'protractor';

export class AppPage {
  navigateTo() {
    return browser.get(browser.baseUrl) as Promise<any>;
  }

  getTitleText() {
    return browser.getTitle() as Promise<string>;
  }

  getNavLinkTexts() {
    return element.all(by.css('app-header .header-nav a')).getText() as unknown as Promise<string[]>;
  }

  getFooterText() {
    return element(by.css('app-footer #footer')).getText() as Promise<string>;
  }
}
