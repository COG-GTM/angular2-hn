import { Page } from 'playwright';

export interface Viewport {
    name: string;
    width: number;
    height: number;
}

export const VIEWPORTS: Viewport[] = [
    { name: 'desktop', width: 1280, height: 800 },
    { name: 'mobile', width: 375, height: 812 },
];

export const STORY_ID = 49351330;
export const ASK_ID = 49332495;
export const USER_ID = 'alexeigannon';

export interface View {
    /** Screenshot file name prefix. */
    name: string;
    /** Route path within the app. */
    path: string;
    /** localStorage entries seeded before the app boots. */
    storage?: Record<string, string>;
    /** Make the mocked API fail so error states render. */
    failApi?: boolean;
    /** CSS selector that must be present before the screenshot is taken. */
    waitFor?: string;
    /** Extra interactions performed after the page settled. */
    interact?: (page: Page) => Promise<void>;
}

export const VIEWS: View[] = [
    { name: 'news-1', path: '/news/1', waitFor: '.post' },
    { name: 'news-2', path: '/news/2', waitFor: '.post' },
    { name: 'newest-1', path: '/newest/1', waitFor: '.post' },
    { name: 'show-1', path: '/show/1', waitFor: '.post' },
    { name: 'ask-1', path: '/ask/1', waitFor: '.post' },
    { name: 'jobs-1', path: '/jobs/1', waitFor: '.job-header' },
    {
        name: 'news-1-night',
        path: '/news/1',
        storage: { theme: 'night' },
        waitFor: '.post',
    },
    {
        name: 'news-1-amoled',
        path: '/news/1',
        storage: { theme: 'amoledblack' },
        waitFor: '.post',
    },
    {
        name: 'news-1-custom-typography',
        path: '/news/1',
        storage: { titleFontSize: '20', listSpacing: '18' },
        waitFor: '.post',
    },
    {
        name: 'news-1-settings-open',
        path: '/news/1',
        waitFor: '.post',
        interact: async (page) => {
            await page.click('.settings');
            await page.waitForSelector('.popup');
        },
    },
    { name: 'item-story', path: `/item/${STORY_ID}`, waitFor: '.comment-list' },
    { name: 'item-ask', path: `/item/${ASK_ID}`, waitFor: '.comment-list' },
    {
        name: 'item-story-night',
        path: `/item/${STORY_ID}`,
        storage: { theme: 'night' },
        waitFor: '.comment-list',
    },
    {
        name: 'item-story-collapsed',
        path: `/item/${STORY_ID}`,
        waitFor: '.comment-list',
        interact: async (page) => {
            const togglers = page.locator('.comment-list > li .collapse');
            await togglers.first().click();
            await togglers.nth(1).click();
        },
    },
    { name: 'user', path: `/user/${USER_ID}`, waitFor: '.profile' },
    {
        name: 'user-night',
        path: `/user/${USER_ID}`,
        storage: { theme: 'night' },
        waitFor: '.profile',
    },
    { name: 'error-feed', path: '/news/1', failApi: true, waitFor: '.error-section' },
    { name: 'error-item', path: `/item/${STORY_ID}`, failApi: true, waitFor: '.error-section' },
    { name: 'error-user', path: `/user/${USER_ID}`, failApi: true, waitFor: '.error-section' },
];
