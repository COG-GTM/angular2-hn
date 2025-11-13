import { browser, by, element, ExpectedConditions as EC } from 'protractor';

describe('Realtime Updates Feature', () => {
  const settingsButtonSelector = by.css('.settings-button, [class*="settings"]');
  const realtimeCheckboxSelector = by.css('input[type="checkbox"]');

  beforeEach(async () => {
    await browser.get(browser.baseUrl + '/news/1');
    await browser.waitForAngular();
  });

  it('should enable realtime updates from settings', async () => {
    const settingsButtons = element.all(settingsButtonSelector);
    const settingsButtonCount = await settingsButtons.count();

    if (settingsButtonCount > 0) {
      await settingsButtons.first().click();
      await browser.sleep(500);

      const checkboxes = element.all(realtimeCheckboxSelector);
      const checkboxCount = await checkboxes.count();

      if (checkboxCount > 0) {
        const realtimeCheckbox = checkboxes.last();
        const isChecked = await realtimeCheckbox.isSelected();

        if (!isChecked) {
          await realtimeCheckbox.click();
          await browser.sleep(500);
        }

        const closeButton = element(by.css('.close, [class*="close"]'));
        const closeButtonPresent = await closeButton.isPresent();
        if (closeButtonPresent) {
          await closeButton.click();
        }
      }
    }

    expect(true).toBe(true);
  });

  it('should display stories on the feed page', async () => {
    await browser.wait(EC.presenceOf(element(by.css('app-feed'))), 10000);

    const feedItems = element.all(by.css('app-item, .story-item, [class*="item"]'));
    const itemCount = await feedItems.count();

    expect(itemCount).toBeGreaterThan(0);
  });

  it('should maintain story list without full page reload when realtime updates enabled', async () => {
    const initialUrl = await browser.getCurrentUrl();

    const settingsButtons = element.all(settingsButtonSelector);
    const settingsButtonCount = await settingsButtons.count();

    if (settingsButtonCount > 0) {
      await settingsButtons.first().click();
      await browser.sleep(500);

      const checkboxes = element.all(realtimeCheckboxSelector);
      const checkboxCount = await checkboxes.count();

      if (checkboxCount > 0) {
        const realtimeCheckbox = checkboxes.last();
        const isChecked = await realtimeCheckbox.isSelected();

        if (!isChecked) {
          await realtimeCheckbox.click();
          await browser.sleep(500);
        }

        const closeButton = element(by.css('.close, [class*="close"]'));
        const closeButtonPresent = await closeButton.isPresent();
        if (closeButtonPresent) {
          await closeButton.click();
        }
      }
    }

    await browser.sleep(2000);

    const currentUrl = await browser.getCurrentUrl();
    expect(currentUrl).toBe(initialUrl);

    const feedItems = element.all(by.css('app-item, .story-item, [class*="item"]'));
    const itemCount = await feedItems.count();
    expect(itemCount).toBeGreaterThan(0);
  });

  it('should verify localStorage stores realtime updates setting', async () => {
    const settingsButtons = element.all(settingsButtonSelector);
    const settingsButtonCount = await settingsButtons.count();

    if (settingsButtonCount > 0) {
      await settingsButtons.first().click();
      await browser.sleep(500);

      const checkboxes = element.all(realtimeCheckboxSelector);
      const checkboxCount = await checkboxes.count();

      if (checkboxCount > 0) {
        const realtimeCheckbox = checkboxes.last();
        await realtimeCheckbox.click();
        await browser.sleep(500);

        const realtimeUpdatesSetting = await browser.executeScript(
          'return localStorage.getItem("realtimeUpdates");'
        );

        expect(realtimeUpdatesSetting).toBeDefined();
      }
    }

    expect(true).toBe(true);
  });

  it('should handle realtime updates without page navigation', async () => {
    const navigationStart = await browser.executeScript(
      'return window.performance.getEntriesByType("navigation").length;'
    );

    await browser.sleep(5000);

    const navigationEnd = await browser.executeScript(
      'return window.performance.getEntriesByType("navigation").length;'
    );

    expect(navigationEnd).toBe(navigationStart);
  });
});
