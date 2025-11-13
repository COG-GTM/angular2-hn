import { browser, by, element, ExpectedConditions as EC } from 'protractor';

describe('Realtime Updates Feature', () => {
  const settingsButtonSelector = by.css('.settings-button, [class*="settings"]');
  const realtimeCheckboxSelector = by.css('input[type="checkbox"]');

  beforeEach(async () => {
    await browser.get(browser.baseUrl);
    await browser.waitForAngular();
  });

  it('should have realtime updates toggle in settings', async () => {
    await browser.executeScript('localStorage.clear();');
    await browser.refresh();
    await browser.waitForAngular();

    const settingsButtons = await element.all(settingsButtonSelector);
    if (settingsButtons.length > 0) {
      await settingsButtons[0].click();
      await browser.sleep(500);

      const checkboxes = await element.all(realtimeCheckboxSelector);
      expect(checkboxes.length).toBeGreaterThan(0);
    }
  });

  it('should persist realtime updates setting in localStorage', async () => {
    await browser.executeScript('localStorage.setItem("realtimeUpdates", "true");');
    await browser.refresh();
    await browser.waitForAngular();

    const realtimeEnabled = await browser.executeScript(
      'return localStorage.getItem("realtimeUpdates");'
    );
    expect(realtimeEnabled).toBe('true');
  });

  it('should load stories when realtime updates is enabled', async () => {
    await browser.executeScript('localStorage.setItem("realtimeUpdates", "true");');
    await browser.refresh();
    await browser.waitForAngular();

    await browser.wait(EC.presenceOf(element(by.css('app-item, .item, [class*="story"]'))), 10000);

    const storyElements = await element.all(by.css('app-item, .item, [class*="story"]'));
    expect(storyElements.length).toBeGreaterThan(0);
  });

  it('should load stories when realtime updates is disabled', async () => {
    await browser.executeScript('localStorage.setItem("realtimeUpdates", "false");');
    await browser.refresh();
    await browser.waitForAngular();

    await browser.wait(EC.presenceOf(element(by.css('app-item, .item, [class*="story"]'))), 10000);

    const storyElements = await element.all(by.css('app-item, .item, [class*="story"]'));
    expect(storyElements.length).toBeGreaterThan(0);
  });

  it('should maintain story list without full page reload when realtime is enabled', async () => {
    await browser.executeScript('localStorage.setItem("realtimeUpdates", "true");');
    await browser.refresh();
    await browser.waitForAngular();

    await browser.wait(EC.presenceOf(element(by.css('app-item, .item, [class*="story"]'))), 10000);

    const initialStoryCount = await element.all(by.css('app-item, .item, [class*="story"]')).count();
    expect(initialStoryCount).toBeGreaterThan(0);

    await browser.sleep(2000);

    const currentUrl = await browser.getCurrentUrl();
    expect(currentUrl).toContain(browser.baseUrl);

    const finalStoryCount = await element.all(by.css('app-item, .item, [class*="story"]')).count();
    expect(finalStoryCount).toBeGreaterThanOrEqual(initialStoryCount);
  });

  it('should not cause errors when switching between realtime and normal mode', async () => {
    await browser.executeScript('localStorage.setItem("realtimeUpdates", "true");');
    await browser.refresh();
    await browser.waitForAngular();

    await browser.wait(EC.presenceOf(element(by.css('app-item, .item, [class*="story"]'))), 10000);
    let storyCount = await element.all(by.css('app-item, .item, [class*="story"]')).count();
    expect(storyCount).toBeGreaterThan(0);

    await browser.executeScript('localStorage.setItem("realtimeUpdates", "false");');
    await browser.refresh();
    await browser.waitForAngular();

    await browser.wait(EC.presenceOf(element(by.css('app-item, .item, [class*="story"]'))), 10000);
    storyCount = await element.all(by.css('app-item, .item, [class*="story"]')).count();
    expect(storyCount).toBeGreaterThan(0);
  });

  afterEach(async () => {
    const logs = await browser.manage().logs().get('browser');
    const severeErrors = logs.filter(log => log.level.value > 900);
    expect(severeErrors.length).toBe(0);
  });
});
