const { Builder } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

const SELENIUM_CONFIG = {
    baseUrl: 'http://localhost:4200',
    timeout: 30000,
    
    getChromeOptions() {
        const options = new chrome.Options();
        options.addArguments('--headless');
        options.addArguments('--no-sandbox');
        options.addArguments('--disable-dev-shm-usage');
        options.addArguments('--disable-gpu');
        options.addArguments('--window-size=1920,1080');
        return options;
    },
    
    async buildDriver() {
        const driver = await new Builder()
            .forBrowser('chrome')
            .setChromeOptions(this.getChromeOptions())
            .build();
        
        await driver.manage().setTimeouts({
            implicit: this.timeout,
            pageLoad: this.timeout,
            script: this.timeout
        });
        
        return driver;
    }
};

module.exports = SELENIUM_CONFIG;
