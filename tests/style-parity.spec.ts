import { test, expect } from '@playwright/test';
import { mockApi, gotoAndWait, setTheme, setNumberSetting, closeSettings, THEMES, ThemeName, VIEWPORTS } from './helpers';

/**
 * Computed-style parity assertions (Phase 12e).
 *
 * Canonical expected values were captured from the original Angular app; the
 * same spec runs against both projects, so the React app must resolve to the
 * identical computed values to pass.
 */

const HEADER_BG: Record<ThemeName, string> = {
    default: 'rgb(185, 43, 39)', // #b92b27
    night: 'rgb(38, 50, 56)', // #263238
    amoledblack: 'rgb(0, 0, 0)', // #000000
};

// The default theme uses a slightly different wrapper background on mobile
// (white) vs desktop (light grey); the dark themes are viewport-independent.
const WRAPPER_BG: Record<'desktop' | 'mobile', Record<ThemeName, string>> = {
    desktop: {
        default: 'rgb(245, 245, 245)',
        night: 'rgb(38, 50, 56)',
        amoledblack: 'rgb(0, 0, 0)',
    },
    mobile: {
        default: 'rgb(255, 255, 255)',
        night: 'rgb(38, 50, 56)',
        amoledblack: 'rgb(0, 0, 0)',
    },
};

const LINK_COLOR: Record<ThemeName, string> = {
    default: 'rgb(0, 0, 0)',
    night: 'rgba(255, 255, 255, 0.7)',
    amoledblack: 'rgba(255, 255, 255, 0.75)',
};

function computed(page: import('@playwright/test').Page, selector: string, prop: string) {
    return page.evaluate(
        ([sel, p]) => {
            const el = document.querySelector(sel);
            return el ? getComputedStyle(el).getPropertyValue(p) : null;
        },
        [selector, prop] as const,
    );
}

test.beforeEach(async ({ page }) => {
    await mockApi(page);
});

test('header background-color per theme', async ({ page }) => {
    await gotoAndWait(page, '/news/1');
    for (const theme of THEMES) {
        await setTheme(page, theme);
        expect(await computed(page, '#header', 'background-color')).toBe(HEADER_BG[theme]);
    }
});

test('wrapper background-color per theme (desktop and mobile)', async ({ page }) => {
    for (const [vpName, vp] of Object.entries(VIEWPORTS) as [keyof typeof WRAPPER_BG, { width: number; height: number }][]) {
        await page.setViewportSize(vp);
        await gotoAndWait(page, '/news/1');
        for (const theme of THEMES) {
            await setTheme(page, theme);
            expect(await computed(page, '.wrapper', 'background-color')).toBe(WRAPPER_BG[vpName][theme]);
        }
    }
});

test('wrapper font-family includes Helvetica Neue', async ({ page }) => {
    await gotoAndWait(page, '/news/1');
    const font = await computed(page, '.wrapper', 'font-family');
    expect(font).toContain('Helvetica Neue');
});

test('link color per theme', async ({ page }) => {
    await gotoAndWait(page, '/news/1');
    for (const theme of THEMES) {
        await setTheme(page, theme);
        const color = await computed(page, 'ol > li.post .title', 'color');
        expect(color).toBe(LINK_COLOR[theme]);
    }
});

test('.body-cover is a full-viewport fixed overlay', async ({ page }) => {
    await gotoAndWait(page, '/news/1');
    const info = await page.evaluate(() => {
        const el = document.querySelector('.body-cover') as HTMLElement;
        const cs = getComputedStyle(el);
        return {
            position: cs.position,
            coversWidth: el.offsetWidth === window.innerWidth,
            coversHeight: el.offsetHeight === window.innerHeight,
        };
    });
    expect(info.position).toBe('fixed');
    expect(info.coversWidth).toBe(true);
    expect(info.coversHeight).toBe(true);
});

test('item title font-size reflects the settings value', async ({ page }) => {
    await gotoAndWait(page, '/news/1');
    // Default font size is 16px.
    expect(await computed(page, 'ol > li.post .title', 'font-size')).toBe('16px');

    // Changing the setting updates the inline font-size on every title.
    await setNumberSetting(page, 'font', '22');
    await closeSettings(page);
    expect(await computed(page, 'ol > li.post .title', 'font-size')).toBe('22px');
});

test('item list-spacing reflects the settings value', async ({ page }) => {
    await gotoAndWait(page, '/news/1');
    await setNumberSetting(page, 'spacing', '12');
    await closeSettings(page);
    // Both apps apply the spacing as an inline margin-bottom on the item wrapper.
    const margin = await computed(page, 'ol > li.post [style*="margin-bottom"]', 'margin-bottom');
    expect(margin).toBe('12px');
});
