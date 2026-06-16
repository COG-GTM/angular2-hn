// Shared configuration for the Angular/React visual regression harness.

// Item + user that the detail/profile views are captured against. These must be
// present in the fixtures (fixtures/item.json, fixtures/user.json) so both apps
// render identical, deterministic content.
export const ITEM_ID = 48555993;
export const USER_ID = 'jfb';

// An intentionally invalid id used to force the error state.
export const INVALID_ITEM_ID = 99999999999;

export type Viewport = { name: 'desktop' | 'mobile'; width: number; height: number };

export const VIEWPORTS: Viewport[] = [
  { name: 'desktop', width: 1280, height: 800 },
  { name: 'mobile', width: 375, height: 812 },
];

export type View = {
  prefix: string;
  path: string;
  theme: 'default' | 'night' | 'amoledblack';
  // CSS selector to wait for before screenshotting (shared between both apps).
  waitFor: string;
  // If set, click this selector after load (e.g. open the settings panel).
  click?: string;
  // Allow extra settle time for animations / async sub-renders.
  settleMs?: number;
};

export const VIEWS: View[] = [
  { prefix: 'feed-news-p1', path: '/news/1', theme: 'default', waitFor: 'li.post' },
  { prefix: 'feed-newest-p1', path: '/newest/1', theme: 'default', waitFor: 'li.post' },
  { prefix: 'feed-show-p1', path: '/show/1', theme: 'default', waitFor: 'li.post' },
  { prefix: 'feed-ask-p1', path: '/ask/1', theme: 'default', waitFor: 'li.post' },
  { prefix: 'feed-jobs-p1', path: '/jobs/1', theme: 'default', waitFor: '.job-header' },
  { prefix: 'feed-news-p2', path: '/news/2', theme: 'default', waitFor: 'li.post' },
  { prefix: 'item-detail', path: `/item/${ITEM_ID}`, theme: 'default', waitFor: '.comment-list' },
  { prefix: 'user-profile', path: `/user/${USER_ID}`, theme: 'default', waitFor: '.profile' },
  { prefix: 'settings-open', path: '/news/1', theme: 'default', waitFor: 'li.post', click: '.settings', settleMs: 400 },
  { prefix: 'feed-news-night', path: '/news/1', theme: 'night', waitFor: 'li.post' },
  { prefix: 'item-detail-night', path: `/item/${ITEM_ID}`, theme: 'night', waitFor: '.comment-list' },
  { prefix: 'feed-news-black', path: '/news/1', theme: 'amoledblack', waitFor: 'li.post' },
  { prefix: 'item-detail-black', path: `/item/${ITEM_ID}`, theme: 'amoledblack', waitFor: '.comment-list' },
  { prefix: 'error-state', path: `/item/${INVALID_ITEM_ID}`, theme: 'default', waitFor: '.error-section' },
];
