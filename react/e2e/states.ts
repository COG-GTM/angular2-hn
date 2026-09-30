import type { Page } from '@playwright/test';
import { meta } from './fixtures.ts';

export interface VisualState {
    name: string;
    path: string;
    theme: 'default' | 'night' | 'amoledblack';
    viewport: 'desktop' | 'mobile';
    ready: string;
    action?: (page: Page) => Promise<void>;
}

export const VIEWPORTS = {
    desktop: { width: 1280, height: 800 },
    mobile: { width: 375, height: 812 },
};

const FEEDS = ['news', 'newest', 'show', 'ask', 'jobs'];
const THEMES = ['default', 'night', 'amoledblack'] as const;

const openSettings = async (page: Page) => {
    await page.click('img.settings');
    await page.waitForSelector('.popup');
};

const collapseFirstComment = async (page: Page) => {
    await page.locator('.comment-list .collapse').first().click();
};

const states: VisualState[] = [];

for (const feed of FEEDS) {
    states.push({ name: `${feed}-1`, path: `/${feed}/1`, theme: 'default', viewport: 'desktop', ready: '.post' });
}
states.push({ name: 'news-2', path: '/news/2', theme: 'default', viewport: 'desktop', ready: '.post' });

for (const theme of THEMES) {
    const suffix = theme === 'default' ? '' : `-${theme}`;
    if (theme !== 'default') {
        states.push({ name: `news-1${suffix}`, path: '/news/1', theme, viewport: 'desktop', ready: '.post' });
    }
    states.push({ name: `item${suffix}`, path: `/item/${meta.itemId}`, theme, viewport: 'desktop', ready: '.comment-list li' });
    states.push({ name: `user${suffix}`, path: `/user/${meta.userId}`, theme, viewport: 'desktop', ready: '.profile' });
    states.push({ name: `settings${suffix}`, path: '/news/1', theme, viewport: 'desktop', ready: '.post', action: openSettings });
}

states.push({ name: 'item-ask', path: `/item/${meta.askItemId}`, theme: 'default', viewport: 'desktop', ready: '.subject' });
states.push({ name: 'user-error', path: '/user/no-such-user', theme: 'default', viewport: 'desktop', ready: '.error-section' });
states.push({
    name: 'item-collapsed',
    path: `/item/${meta.itemId}`,
    theme: 'default',
    viewport: 'desktop',
    ready: '.comment-list li',
    action: collapseFirstComment,
});

for (const [name, path, ready] of [
    ['news-1', '/news/1', '.post'],
    ['jobs-1', '/jobs/1', '.post'],
    ['item', `/item/${meta.itemId}`, '.comment-list li'],
    ['user', `/user/${meta.userId}`, '.profile'],
] as const) {
    states.push({ name: `mobile-${name}`, path, theme: 'default', viewport: 'mobile', ready });
}
states.push({ name: 'mobile-news-1-night', path: '/news/1', theme: 'night', viewport: 'mobile', ready: '.post' });
states.push({ name: 'mobile-settings', path: '/news/1', theme: 'default', viewport: 'mobile', ready: '.post', action: openSettings });

export { states };
