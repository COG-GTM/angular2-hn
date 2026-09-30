import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from '@playwright/test';
import { setTheme, useFixtures } from './fixtures.ts';
import { states, VIEWPORTS } from './states.ts';

const app = process.env.APP ?? 'react';
const outDir = join(dirname(fileURLToPath(import.meta.url)), 'screenshots', app);

test.describe(`capture ${app}`, () => {
    for (const state of states) {
        test(state.name, async ({ page }) => {
            await page.setViewportSize(VIEWPORTS[state.viewport]);
            await useFixtures(page);
            await setTheme(page, state.theme);
            await page.goto(state.path);
            await page.waitForSelector(state.ready);
            await page.waitForLoadState('networkidle');
            await page.evaluate(() => document.fonts.ready);
            if (state.action) await state.action(page);
            await page.mouse.move(0, 0);
            await page.screenshot({
                path: join(outDir, `${state.name}.png`),
                fullPage: true,
                animations: 'disabled',
                caret: 'hide',
            });
        });
    }
});
