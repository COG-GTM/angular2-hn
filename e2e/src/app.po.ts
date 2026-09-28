import { browser, by, element, ElementArrayFinder, ElementFinder, ExpectedConditions } from 'protractor';

export class AppPage {
  navigateTo(path = '/') {
    return browser.get(path) as Promise<any>;
  }

  getCurrentUrl() {
    return browser.getCurrentUrl() as Promise<string>;
  }

  getFeedPosts(): ElementArrayFinder {
    return element.all(by.css('app-feed li.post'));
  }

  getFirstPostTitle(): ElementFinder {
    return this.getFeedPosts().first().element(by.css('a.title'));
  }

  getHeaderNavLinks(): ElementArrayFinder {
    return element.all(by.css('app-header .header-nav a'));
  }

  getHeaderNavLink(text: string): ElementFinder {
    return element(by.cssContainingText('app-header .header-nav a', text));
  }

  waitForFeed() {
    return browser.wait(ExpectedConditions.presenceOf(this.getFeedPosts().first()), 15000, 'Feed did not load');
  }

  waitForFeedToReplace(previousFirstTitle: string) {
    const firstTitle = this.getFirstPostTitle();
    return browser.wait(
      async () => (await firstTitle.isPresent()) && (await firstTitle.getText()) !== previousFirstTitle,
      15000,
      'Feed was not replaced'
    );
  }
}
