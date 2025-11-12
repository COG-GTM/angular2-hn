import { Builder, By, until, WebDriver } from 'selenium-webdriver';
import * as chrome from 'selenium-webdriver/chrome';

const SELENIUM_CONFIG = require('./selenium.config');

describe('Angular HN - Selenium Tests', () => {
    let driver: WebDriver;
    const baseUrl = SELENIUM_CONFIG.baseUrl;

    beforeAll(async () => {
        driver = await SELENIUM_CONFIG.buildDriver();
    }, 30000);

    afterAll(async () => {
        if (driver) {
            await driver.quit();
        }
    });

    test('should load the home page', async () => {
        await driver.get(baseUrl);
        const title = await driver.getTitle();
        expect(title).toBeTruthy();
    }, 30000);

    test('should display the header', async () => {
        await driver.get(baseUrl);
        const header = await driver.wait(
            until.elementLocated(By.css('app-header')),
            10000
        );
        expect(await header.isDisplayed()).toBe(true);
    }, 30000);

    test('should navigate to news feed', async () => {
        await driver.get(baseUrl);
        await driver.wait(
            until.elementLocated(By.css('app-feed')),
            10000
        );
        const feedElement = await driver.findElement(By.css('app-feed'));
        expect(await feedElement.isDisplayed()).toBe(true);
    }, 30000);

    test('should display feed items', async () => {
        await driver.get(baseUrl + '/news');
        await driver.wait(
            until.elementLocated(By.css('app-item')),
            10000
        );
        const items = await driver.findElements(By.css('app-item'));
        expect(items.length).toBeGreaterThan(0);
    }, 30000);
});
