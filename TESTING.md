# Testing Guide for Angular2-HN

This document provides comprehensive information about running Selenium and Playwright tests for the Angular2-HN application.

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Selenium Tests](#selenium-tests)
- [Playwright Tests](#playwright-tests)
- [Running Tests](#running-tests)
- [Test Structure](#test-structure)
- [Best Practices](#best-practices)

## Overview

This project now supports three types of testing:

1. **Unit Tests** - Using Karma and Jasmine (existing)
2. **Selenium Tests** - Browser automation using Selenium WebDriver
3. **Playwright Tests** - Modern browser automation using Playwright

## Prerequisites

Before running tests, ensure you have:

- Node.js (v12 or higher)
- Yarn package manager
- Chrome browser installed (for Selenium tests)

Install all dependencies:

```bash
yarn install
```

## Selenium Tests

### Overview

Selenium tests are located in the `selenium-tests/` directory. They use Selenium WebDriver with ChromeDriver for browser automation and Mocha as the test runner. Tests are written in JavaScript for compatibility with the project's older TypeScript version.

### Directory Structure

```
selenium-tests/
├── selenium.config.js    # Selenium configuration
├── tsconfig.json         # TypeScript configuration (for reference)
└── example.spec.js       # Sample Selenium test (JavaScript)
```

### Configuration

The Selenium configuration (`selenium-tests/selenium.config.js`) includes:

- Base URL: `http://localhost:4200`
- Timeout: 30 seconds
- Chrome options: Headless mode, no sandbox, window size 1920x1080

**Important:** The ChromeDriver version must match your installed Chrome version. If you encounter version mismatch errors, update the chromedriver package:

```bash
# Check your Chrome version
google-chrome --version

# Install matching ChromeDriver (replace 138 with your Chrome major version)
yarn add -D chromedriver@138.0.0
```

### Running Selenium Tests

To run Selenium tests, you need to:

1. Start the Angular development server:
   ```bash
   export NODE_OPTIONS=--openssl-legacy-provider && yarn start
   ```

2. In a separate terminal, run the Selenium tests:
   ```bash
   yarn test:selenium
   ```

### Writing Selenium Tests

Example Selenium test structure (JavaScript with Mocha):

```javascript
const { Builder, By, until } = require('selenium-webdriver');
const assert = require('assert').strict;
const SELENIUM_CONFIG = require('./selenium.config');

describe('My Test Suite', () => {
    let driver;

    before(async function() {
        this.timeout(30000);
        driver = await SELENIUM_CONFIG.buildDriver();
    });

    after(async () => {
        if (driver) {
            await driver.quit();
        }
    });

    it('should do something', async () => {
        await driver.get(SELENIUM_CONFIG.baseUrl);
        // Your test logic here
        const title = await driver.getTitle();
        assert.ok(title, 'Title should exist');
    });
});
```

**Note:** Selenium tests are written in JavaScript (not TypeScript) due to compatibility issues with the project's TypeScript 3.7.5 version and modern @types/selenium-webdriver packages.

## Playwright Tests

### Overview

Playwright tests are located in the `playwright-tests/` directory. Playwright provides modern, reliable browser automation with support for multiple browsers.

### Directory Structure

```
playwright-tests/
└── example.spec.ts       # Sample Playwright test

playwright.config.ts      # Playwright configuration (root level)
```

### Configuration

The Playwright configuration (`playwright.config.ts`) includes:

- Base URL: `http://localhost:4200`
- Multiple browser support: Chromium, Firefox, WebKit
- Mobile viewport testing: Pixel 5, iPhone 12
- Automatic dev server startup
- Screenshot and video capture on failure
- HTML reporter

### Running Playwright Tests

Playwright can automatically start the dev server, so you can run tests directly:

```bash
yarn test:playwright
```

To run tests in UI mode (interactive):

```bash
yarn test:playwright:ui
```

To run tests in a specific browser:

```bash
yarn test:playwright --project=chromium
yarn test:playwright --project=firefox
yarn test:playwright --project=webkit
```

To run tests in headed mode (see the browser):

```bash
yarn test:playwright --headed
```

### Writing Playwright Tests

Example Playwright test structure:

```typescript
import { test, expect } from '@playwright/test';

test.describe('My Test Suite', () => {
  test('should do something', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('app-header')).toBeVisible();
  });
});
```

### Viewing Test Reports

After running Playwright tests, view the HTML report:

```bash
yarn playwright show-report
```

## Running Tests

### All Tests

Run all unit tests (Karma/Jasmine):
```bash
yarn test
```

Run Selenium tests:
```bash
yarn test:selenium
```

Run Playwright tests:
```bash
yarn test:playwright
```

### Existing E2E Tests (Protractor)

The project also includes existing Protractor E2E tests:

```bash
yarn e2e
```

## Test Structure

### Selenium Tests

Selenium tests follow this pattern:

1. **Setup**: Create a WebDriver instance with Chrome options
2. **Test Execution**: Navigate to pages, find elements, perform actions
3. **Assertions**: Verify expected behavior
4. **Teardown**: Quit the WebDriver instance

### Playwright Tests

Playwright tests follow this pattern:

1. **Test Execution**: Use the `page` fixture provided by Playwright
2. **Navigation**: Use `page.goto()` to navigate
3. **Element Interaction**: Use locators like `page.locator()`
4. **Assertions**: Use Playwright's built-in assertions with `expect()`

## Best Practices

### General

1. **Keep tests independent**: Each test should be able to run independently
2. **Use descriptive test names**: Make it clear what each test is verifying
3. **Avoid hard-coded waits**: Use explicit waits for elements instead
4. **Clean up resources**: Always quit/close browser instances after tests

### Selenium

1. **Use explicit waits**: Use `until.elementLocated()` instead of `sleep()`
2. **Configure timeouts**: Set appropriate timeouts in the config
3. **Handle stale elements**: Be aware of DOM updates that can cause stale element references

### Playwright

1. **Use auto-waiting**: Playwright automatically waits for elements to be actionable
2. **Use locators**: Prefer `page.locator()` over `page.$()` for better auto-waiting
3. **Use web-first assertions**: Use `expect(locator).toBeVisible()` instead of manual checks
4. **Leverage fixtures**: Use Playwright's built-in fixtures like `page`, `context`, `browser`

## Troubleshooting

### Selenium

**Issue**: ChromeDriver version mismatch
- **Solution**: Update chromedriver: `yarn upgrade chromedriver`

**Issue**: Tests timeout
- **Solution**: Increase timeout in `selenium.config.js` or individual tests

### Playwright

**Issue**: Browser not found
- **Solution**: Install browsers: `yarn playwright install`

**Issue**: Tests fail on CI
- **Solution**: Ensure CI environment has necessary dependencies: `yarn playwright install-deps`

## Additional Resources

- [Selenium WebDriver Documentation](https://www.selenium.dev/documentation/webdriver/)
- [Playwright Documentation](https://playwright.dev/)
- [Angular Testing Guide](https://angular.io/guide/testing)
