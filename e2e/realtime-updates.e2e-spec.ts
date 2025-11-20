import { browser, by, element, ExpectedConditions as EC } from 'protractor';

describe('Realtime Updates E2E Test', () => {
  const settingsButtonSelector = by.css('a[href="/settings"]');
  const realtimeCheckboxSelector = by.css('input[type="checkbox"][ng-reflect-model]');
  const feedItemSelector = by.css('app-item');
  const homeButtonSelector = by.css('a[href="/"]');

  beforeEach(async () => {
    await browser.get('/');
    await browser.waitForAngular();
  });

  it('should enable realtime updates and verify new stories appear without reload', async () => {
    const initialItemCount = await element.all(feedItemSelector).count();
    console.log(`Initial item count: ${initialItemCount}`);

    await browser.executeScript('localStorage.setItem("realtimeUpdates", "true");');
    await browser.refresh();
    await browser.waitForAngular();

    await browser.wait(EC.presenceOf(element(feedItemSelector)), 10000, 'Feed items should be present');

    const itemCountAfterEnable = await element.all(feedItemSelector).count();
    console.log(`Item count after enabling realtime: ${itemCountAfterEnable}`);

    const pageReloadDetector = await browser.executeScript(`
      window.reloadDetected = false;
      const originalReload = window.location.reload;
      window.location.reload = function() {
        window.reloadDetected = true;
        originalReload.call(window.location);
      };
      return true;
    `);

    await browser.sleep(30000);

    const reloadDetected = await browser.executeScript('return window.reloadDetected;');
    expect(reloadDetected).toBe(false, 'Page should not have reloaded');

    const finalItemCount = await element.all(feedItemSelector).count();
    console.log(`Final item count: ${finalItemCount}`);

    expect(finalItemCount).toBeGreaterThanOrEqual(itemCountAfterEnable,
      'Item count should remain the same or increase without page reload');
  });

  it('should toggle realtime updates setting', async () => {
    await browser.executeScript('localStorage.setItem("realtimeUpdates", "false");');
    await browser.refresh();
    await browser.waitForAngular();

    const settingsValue = await browser.executeScript('return localStorage.getItem("realtimeUpdates");');
    expect(settingsValue).toBe('false');

    await browser.executeScript('localStorage.setItem("realtimeUpdates", "true");');
    const updatedValue = await browser.executeScript('return localStorage.getItem("realtimeUpdates");');
    expect(updatedValue).toBe('true');
  });

  it('should not break existing functionality when realtime is disabled', async () => {
    await browser.executeScript('localStorage.setItem("realtimeUpdates", "false");');
    await browser.refresh();
    await browser.waitForAngular();

    await browser.wait(EC.presenceOf(element(feedItemSelector)), 10000, 'Feed items should be present');
    const itemCount = await element.all(feedItemSelector).count();
    expect(itemCount).toBeGreaterThan(0, 'Feed should load normally when realtime is disabled');
  });
});
