import { browser, by, element } from 'protractor';

export class AppPage {
  navigateTo() {
    return browser.get(browser.baseUrl) as Promise<any>;
  }

  getTitle() {
    return browser.getTitle() as Promise<string>;
  }

  getNavLinkTexts() {
    return element.all(by.css('app-header .header-nav a')).getText() as Promise<string[]>;
  }
}
