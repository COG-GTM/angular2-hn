const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const assert = require('assert').strict;

const SELENIUM_CONFIG = require('./selenium.config');

describe('Angular HN - Selenium Tests', () => {
    let driver;
    const baseUrl = SELENIUM_CONFIG.baseUrl;

    before(async function() {
        this.timeout(30000);
        driver = await SELENIUM_CONFIG.buildDriver();
    });

    after(async () => {
        if (driver) {
            await driver.quit();
        }
    });

    it('should load the home page', async () => {
        await driver.get(baseUrl);
        const title = await driver.getTitle();
        assert.ok(title, 'Title should exist');
    });

    it('should display the header', async () => {
        await driver.get(baseUrl);
        const header = await driver.wait(
            until.elementLocated(By.css('app-header')),
            10000
        );
        const isDisplayed = await header.isDisplayed();
        assert.strictEqual(isDisplayed, true, 'Header should be displayed');
    });

    it('should navigate to news feed', async () => {
        await driver.get(baseUrl);
        await driver.wait(
            until.elementLocated(By.css('app-feed')),
            10000
        );
        const feedElement = await driver.findElement(By.css('app-feed'));
        const isDisplayed = await feedElement.isDisplayed();
        assert.strictEqual(isDisplayed, true, 'Feed should be displayed');
    });
});
