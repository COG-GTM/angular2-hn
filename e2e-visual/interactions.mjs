// Drives the golden-path interactions against a running app (API served from fixtures/).
// Usage: node interactions.mjs --base-url http://localhost:4173 [--out ../interaction-screenshots]
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import { parseArgs } from 'node:util';
import path from 'node:path';
import { ITEM_ID, USER_ID } from './config.mjs';
import { installFixtures } from './fixtures.mjs';

const { values } = parseArgs({
  options: {
    'base-url': { type: 'string', default: 'http://localhost:4173' },
    out: { type: 'string', default: 'interaction-screenshots' },
  },
});
const baseUrl = values['base-url'].replace(/\/$/, '');
const outDir = path.resolve(values.out);
await mkdir(outDir, { recursive: true });

const results = [];
async function check(name, fn) {
  try {
    await fn();
    results.push({ name, ok: true });
    console.log('PASS', name);
  } catch (err) {
    results.push({ name, ok: false, error: String(err.message ?? err).split('\n')[0] });
    console.log('FAIL', name, '-', String(err.message ?? err).split('\n')[0]);
  }
}
function expect(cond, msg) {
  if (!cond) throw new Error(msg);
}
const loaded = (page) => page.waitForFunction(() => !document.querySelector('.loader'), null, { timeout: 15000 });
const shot = (page, name) => page.screenshot({ path: path.join(outDir, `${name}.png`), fullPage: false });

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, colorScheme: 'light' });
await installFixtures(context);
const page = await context.newPage();

await check('root redirects to /news/1', async () => {
  await page.goto(baseUrl + '/');
  await page.waitForURL(/\/news\/1$/);
  await loaded(page);
  expect((await page.locator('li.post').count()) === 30, 'expected 30 posts');
  expect((await page.locator('a.prev').count()) === 0, 'Prev should be hidden on page 1');
});

await check('pagination: More -> /news/2 (list starts at 31), Prev -> /news/1', async () => {
  await page.click('a.more');
  await page.waitForURL(/\/news\/2$/);
  await loaded(page);
  expect((await page.locator('ol').getAttribute('start')) === '31', 'ol start should be 31');
  await shot(page, '01-news-page-2');
  await page.click('a.prev');
  await page.waitForURL(/\/news\/1$/);
  await loaded(page);
  expect((await page.locator('ol').getAttribute('start')) === '1', 'ol start should be 1');
});

await check('header nav reaches every feed', async () => {
  for (const [label, feed] of [['new', 'newest'], ['show', 'show'], ['ask', 'ask'], ['jobs', 'jobs']]) {
    await page.click(`#header .header-nav a:text-is("${label}")`);
    await page.waitForURL(new RegExp(`/${feed}/1$`));
    await loaded(page);
    expect((await page.locator('li.post').count()) > 0, `${feed} has no posts`);
  }
  expect((await page.locator('p.job-header').count()) === 1, 'jobs header missing');
  await page.click('#header a.home-link');
  await page.waitForURL(/\/news\/1$/);
  await loaded(page);
});

await check('opening comments from the feed shows the nested comment tree', async () => {
  await page.click(`li.post a[href$="/item/${ITEM_ID}"] >> nth=-1`);
  await page.waitForURL(new RegExp(`/item/${ITEM_ID}$`));
  await loaded(page);
  expect((await page.locator('.comment-list .meta').count()) > 5, 'expected comments');
  expect((await page.locator('ul.subtree ul.subtree .meta').count()) > 0, 'expected nested replies');
  await shot(page, '02-item-comments');
});

await check('collapsing a comment hides its subtree and toggles [-]/[+]', async () => {
  const first = page.locator('.comment-list > li').first();
  const toggle = first.locator('.meta .collapse').first();
  expect((await toggle.textContent()).trim() === '[-]', 'toggle should start as [-]');
  const text = first.locator('.comment-text').first();
  expect(await text.isVisible(), 'comment text should be visible');
  await toggle.click();
  expect((await toggle.textContent()).trim() === '[+]', 'toggle should read [+]');
  expect(!(await text.isVisible()), 'comment text should be hidden when collapsed');
  await shot(page, '03-comment-collapsed');
  await toggle.click();
  expect(await text.isVisible(), 'comment text visible after expanding');
});

await check('opening a user profile from the item page', async () => {
  await page.click(`a[href$="/user/${USER_ID}"] >> nth=0`);
  await page.waitForURL(new RegExp(`/user/${USER_ID}$`));
  await loaded(page);
  expect((await page.locator('.main-details .name').textContent()).trim() === USER_ID, 'profile name');
  expect((await page.locator('.main-details .right').textContent()).includes('★'), 'karma');
  await shot(page, '04-user-profile');
});

for (const [label, theme] of [['Night', 'night'], ['Black', 'amoledblack'], ['Default', 'default']]) {
  await check(`settings: switch theme to ${theme}, persisted across reload`, async () => {
    await page.goto(baseUrl + '/news/1');
    await loaded(page);
    await page.click('img.settings');
    await page.waitForSelector('.popup');
    await page.locator(`.popup input[type="radio"][value="${theme}"]`).check();
    const rootClass = () => page.evaluate(() => document.querySelector('.wrapper').parentElement.className);
    expect((await rootClass()).split(/\s+/).includes(theme), `root class should include ${theme}`);
    expect((await page.evaluate(() => localStorage.getItem('theme'))) === theme, 'localStorage.theme');
    await shot(page, `05-theme-${theme}`);
    await page.reload();
    await loaded(page);
    expect((await rootClass()).split(/\s+/).includes(theme), `${theme} not restored after reload (label ${label})`);
  });
}

await check('settings: open-links-in-new-tab applies and persists', async () => {
  await page.click('img.settings');
  await page.waitForSelector('.popup');
  const checkbox = page.locator('.popup input[type="checkbox"]');
  await checkbox.check();
  expect((await page.evaluate(() => localStorage.getItem('openLinkInNewTab'))) === 'true', 'openLinkInNewTab');
  const external = page.locator('li.post a[href^="http"]').first();
  expect((await external.getAttribute('target')) === '_blank', 'external links should open in new tab');
  await checkbox.uncheck();
});

await browser.close();
const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} interaction checks passed`);
process.exit(failed.length ? 1 : 0);
