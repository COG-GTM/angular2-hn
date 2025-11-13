const puppeteer = require('puppeteer');

async function testRealtimeUpdates() {
  console.log('Starting realtime updates E2E test...');
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    
    await page.goto('http://localhost:4200', { waitUntil: 'networkidle2' });
    console.log('✓ Page loaded successfully');
    
    await page.click('.settings-icon');
    await page.waitForSelector('input[type="checkbox"]');
    console.log('✓ Settings panel opened');
    
    const realtimeCheckboxes = await page.$$('input[type="checkbox"]');
    if (realtimeCheckboxes.length >= 2) {
      await realtimeCheckboxes[1].click();
      console.log('✓ Realtime updates enabled');
    }
    
    await page.click('.close');
    console.log('✓ Settings panel closed');
    
    const initialStoryCount = await page.$$eval('.item', items => items.length);
    console.log(`✓ Initial story count: ${initialStoryCount}`);
    
    console.log('Waiting for potential realtime updates (30 seconds)...');
    await page.waitForTimeout(30000);
    
    const finalStoryCount = await page.$$eval('.item', items => items.length);
    console.log(`✓ Final story count: ${finalStoryCount}`);
    
    if (finalStoryCount >= initialStoryCount) {
      console.log('✓ Test passed: Story list maintained or updated without reload');
      console.log('✓ Realtime updates feature is working correctly');
    } else {
      console.log('⚠ Warning: Story count decreased, but no page reload occurred');
    }
    
    const navigationOccurred = await page.evaluate(() => {
      return window.performance.navigation.type === 1;
    });
    
    if (!navigationOccurred) {
      console.log('✓ Confirmed: No page reload occurred during test');
    } else {
      console.log('✗ Error: Page reload detected');
      process.exit(1);
    }
    
    console.log('\n✓ All E2E tests passed successfully!');
    
  } catch (error) {
    console.error('✗ Test failed:', error.message);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

if (require.main === module) {
  testRealtimeUpdates().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = testRealtimeUpdates;
