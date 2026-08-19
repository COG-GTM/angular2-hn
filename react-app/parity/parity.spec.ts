import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { expect, test, type Page } from '@playwright/test';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';

const parityDir = dirname(fileURLToPath(import.meta.url));
const fixturesDir = join(parityDir, 'fixtures');
const outputDir = join(parityDir, 'screenshots');

const angularUrl = process.env.ANGULAR_URL ?? 'http://localhost:4200';
const reactUrl = process.env.REACT_URL ?? 'http://localhost:5173';
const maxDiffRatio = Number(process.env.MAX_DIFF_RATIO ?? '0.001');

const targets = JSON.parse(readFileSync(join(fixturesDir, 'targets.json'), 'utf8')) as {
    storyId: number;
    textStoryId: number;
    userId: string;
};

const viewports = [
    { name: 'desktop', width: 1280, height: 900 },
    { name: 'mobile', width: 375, height: 720 },
];

const routes = [
    { name: 'news', path: '/news/1' },
    { name: 'news-page-2', path: '/news/2' },
    { name: 'newest', path: '/newest/1' },
    { name: 'show', path: '/show/1' },
    { name: 'ask', path: '/ask/1' },
    { name: 'jobs', path: '/jobs/1' },
    { name: 'item', path: `/item/${targets.storyId}` },
    { name: 'item-text', path: `/item/${targets.textStoryId}` },
    { name: 'user', path: `/user/${targets.userId}` },
];

const themes = ['default', 'night'];

function fixtureFor(url: URL): unknown | undefined {
    const key = `${url.pathname.replace(/^\//, '')}${url.search}`.replace(/[/?=&]/g, '_');
    const file = join(fixturesDir, `${key}.json`);
    return existsSync(file) ? (JSON.parse(readFileSync(file, 'utf8')) as unknown) : undefined;
}

async function preparePage(page: Page, theme: string, unmatched: Set<string>) {
    await page.route('**/node-hnapi.herokuapp.com/**', async route => {
        const url = new URL(route.request().url());
        const payload = fixtureFor(url);
        if (payload === undefined) {
            // Otherwise both apps render their error view and the case would pass
            // without the route ever being exercised.
            unmatched.add(`${url.pathname}${url.search}`);
            await route.fulfill({ status: 404, body: 'not in fixtures' });
            return;
        }
        await route.fulfill({ json: payload });
    });

    await page.addInitScript(
        ([selectedTheme]) => {
            localStorage.setItem('theme', selectedTheme as string);
            localStorage.setItem('titleFontSize', '16');
            localStorage.setItem('listSpacing', '0');
            localStorage.setItem('openLinkInNewTab', 'false');
        },
        [theme]
    );
}

async function capture(page: Page, baseUrl: string, path: string, file: string) {
    await page.goto(`${baseUrl}${path}`, { waitUntil: 'load' });
    await page.waitForSelector('.main-content > div, .profile, .error-section', { timeout: 15000 });
    await page.waitForTimeout(600);
    await page.addStyleTag({ content: '*, *::before, *::after { animation: none !important; transition: none !important; }' });
    await page.screenshot({ path: file, fullPage: true });
}

function compare(angularFile: string, reactFile: string, diffFile: string) {
    const angular = PNG.sync.read(readFileSync(angularFile));
    const react = PNG.sync.read(readFileSync(reactFile));
    const width = Math.min(angular.width, react.width);
    const height = Math.min(angular.height, react.height);
    const diff = new PNG({ width, height });

    const crop = (image: PNG) => {
        if (image.width === width && image.height === height) {
            return image;
        }
        const cropped = new PNG({ width, height });
        PNG.bitblt(image, cropped, 0, 0, width, height, 0, 0);
        return cropped;
    };

    const mismatched = pixelmatch(crop(angular).data, crop(react).data, diff.data, width, height, {
        threshold: 0.15,
        diffMask: true,
    });
    writeFileSync(diffFile, PNG.sync.write(diff));

    return {
        ratio: mismatched / (width * height),
        mismatched,
        sizeDelta: Math.abs(angular.height - react.height),
        widthDelta: Math.abs(angular.width - react.width),
        angularSize: `${angular.width}x${angular.height}`,
        reactSize: `${react.width}x${react.height}`,
    };
}

test.describe('Angular vs React pixel parity', () => {
    for (const theme of themes) {
        for (const viewport of viewports) {
            for (const route of routes) {
                test(`${route.name} @ ${viewport.name} (${theme})`, async ({ browser }) => {
                    test.slow();
                    const name = `${route.name}-${viewport.name}-${theme}`;
                    mkdirSync(outputDir, { recursive: true });

                    const context = await browser.newContext({
                        viewport: { width: viewport.width, height: viewport.height },
                        deviceScaleFactor: 1,
                    });
                    const page = await context.newPage();
                    const unmatched = new Set<string>();
                    await preparePage(page, theme, unmatched);

                    const angularFile = join(outputDir, `${name}-angular.png`);
                    const reactFile = join(outputDir, `${name}-react.png`);
                    const diffFile = join(outputDir, `${name}-diff.png`);

                    await capture(page, angularUrl, route.path, angularFile);
                    await capture(page, reactUrl, route.path, reactFile);
                    await context.close();

                    expect([...unmatched], 'API requests without a recorded fixture').toEqual([]);

                    const result = compare(angularFile, reactFile, diffFile);
                    console.log(`${name}: ${JSON.stringify(result)}`);

                    expect(result.widthDelta, `page width differs (${result.angularSize} vs ${result.reactSize})`).toBe(0);
                    expect(result.sizeDelta, `page height differs (${result.angularSize} vs ${result.reactSize})`).toBeLessThanOrEqual(2);
                    expect(result.ratio, `pixel diff ${(result.ratio * 100).toFixed(3)}% (${diffFile})`).toBeLessThanOrEqual(maxDiffRatio);
                });
            }
        }
    }
});
