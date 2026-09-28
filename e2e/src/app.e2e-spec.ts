import { AppPage } from './app.po';
import { browser, logging } from 'protractor';

describe('Angular HN PWA', () => {
  let page: AppPage;

  beforeEach(() => {
    page = new AppPage();
  });

  it('should redirect the root url to the first page of top stories', async () => {
    await page.navigateTo();
    expect(await page.getCurrentUrl()).toMatch(/\/news\/1$/);
  });

  it('should load the news feed list', async () => {
    await page.navigateTo('/news/1');
    await page.waitForFeed();

    expect(await page.getFeedPosts().count()).toBeGreaterThan(0);
    expect(await page.getFirstPostTitle().getText()).not.toBe('');
  });

  it('should render the header feed navigation', async () => {
    await page.navigateTo();
    expect(await page.getHeaderNavLinks().getText()).toEqual(['new', 'show', 'ask', 'jobs']);
  });

  it('should navigate to the newest feed from the header', async () => {
    await page.navigateTo('/news/1');
    await page.getHeaderNavLink('new').click();
    await page.waitForFeed();

    expect(await page.getCurrentUrl()).toMatch(/\/newest\/1$/);
    expect(await page.getFeedPosts().count()).toBeGreaterThan(0);
  });

  afterEach(async () => {
    // Assert that there are no errors emitted from the browser
    const logs = await browser.manage().logs().get(logging.Type.BROWSER);
    expect(logs).not.toContain(jasmine.objectContaining({
      level: logging.Level.SEVERE,
    } as logging.Entry));
  });
});
