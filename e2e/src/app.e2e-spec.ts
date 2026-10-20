import { AppPage } from './app.po';
import { browser, logging } from 'protractor';

describe('workspace-project App', () => {
  let page: AppPage;

  beforeEach(() => {
    page = new AppPage();
  });

  it('should display the app title', () => {
    page.navigateTo();
    expect(page.getTitleText()).toEqual('Angular 2 HN');
  });

  it('should redirect to the first page of the news feed', () => {
    page.navigateTo();
    expect(browser.getCurrentUrl()).toMatch(/\/news\/1$/);
  });

  it('should render the header navigation', () => {
    page.navigateTo();
    expect(page.getNavLinkTexts()).toEqual(['new', 'show', 'ask', 'jobs']);
  });

  it('should render the footer', () => {
    page.navigateTo();
    expect(page.getFooterText()).toContain('Show this project some');
  });

  afterEach(async () => {
    // Assert that there are no errors emitted from the browser
    const logs = await browser.manage().logs().get(logging.Type.BROWSER);
    expect(logs).not.toContain(jasmine.objectContaining({
      level: logging.Level.SEVERE,
    } as logging.Entry));
  });
});
