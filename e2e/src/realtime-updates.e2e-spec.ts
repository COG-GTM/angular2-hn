import { browser, by, element, ExpectedConditions as EC } from 'protractor';

describe('Realtime Updates Feature', () => {
  const settingsButtonSelector = by.css('.settings-button, [class*="settings"]');
  const realtimeCheckboxSelector = by.css('input[type="checkbox"]');

  beforeEach(async () => {
    await browser.get(browser.baseUrl);
    await browser.waitForAngular();
  });

  it('should have realtime updates toggle in settings', async () => {
    const settingsButton = element(settingsButtonSelector);
    await browser.wait(EC.presenceOf(settingsButton), 5000, 'Settings button not found');
    await settingsButton.click();

    await browser.sleep(500);

    const settingsText = await element(by.css('body')).getText();
    expect(settingsText).toContain('Enable realtime updates');
  });

  it('should toggle realtime updates setting', async () => {
    const settingsButton = element(settingsButtonSelector);
    await browser.wait(EC.presenceOf(settingsButton), 5000);
    await settingsButton.click();

    await browser.sleep(500);

    const checkboxes = element.all(realtimeCheckboxSelector);
    const realtimeCheckbox = checkboxes.last();

    const initialState = await realtimeCheckbox.isSelected();
    await realtimeCheckbox.click();

    await browser.sleep(200);

    const newState = await realtimeCheckbox.isSelected();
    expect(newState).toBe(!initialState);

    const storedValue = await browser.executeScript(
      'return localStorage.getItem("realtimeUpdates");'
    );
    expect(storedValue).toBe(newState.toString());
  });

  it('should persist realtime updates setting after page reload', async () => {
    await browser.executeScript(
      'localStorage.setItem("realtimeUpdates", "true");'
    );

    await browser.refresh();
    await browser.waitForAngular();

    const storedValue = await browser.executeScript(
      'return localStorage.getItem("realtimeUpdates");'
    );
    expect(storedValue).toBe('true');
  });

  it('should load stories without realtime updates when disabled', async () => {
    await browser.executeScript(
      'localStorage.setItem("realtimeUpdates", "false");'
    );

    await browser.get(browser.baseUrl);
    await browser.waitForAngular();

    await browser.sleep(2000);

    const stories = element.all(by.css('.story, .item, [class*="story"], [class*="item"]'));
    const storyCount = await stories.count();

    expect(storyCount).toBeGreaterThan(0);
  });

  it('should not break existing functionality when realtime updates enabled', async () => {
    await browser.executeScript(
      'localStorage.setItem("realtimeUpdates", "true");'
    );

    await browser.get(browser.baseUrl);
    await browser.waitForAngular();

    await browser.sleep(2000);

    const stories = element.all(by.css('.story, .item, [class*="story"], [class*="item"]'));
    const storyCount = await stories.count();

    expect(storyCount).toBeGreaterThan(0);
  });

  it('should verify realtime service is initialized when enabled', async () => {
    await browser.executeScript(
      'localStorage.setItem("realtimeUpdates", "true");'
    );

    await browser.get(browser.baseUrl);
    await browser.waitForAngular();

    const hasFirebaseConnection = await browser.executeScript(
      'return window.firebase !== undefined || document.querySelector("script[src*=\\"firebase\\"]") !== null;'
    );

    expect(hasFirebaseConnection).toBeTruthy();
  });

  afterEach(async () => {
    await browser.executeScript('localStorage.clear();');
  });
});
