export const API_BASE = 'https://node-hnapi.herokuapp.com';

export const ITEM_ID = 49887343;
export const USER_ID = 'laurenth';

export const THEMES = ['default', 'night', 'amoledblack'];

export const ROUTES = [
  { name: 'news', path: '/news/1' },
  { name: 'newest', path: '/newest/1' },
  { name: 'show', path: '/show/1' },
  { name: 'ask', path: '/ask/1' },
  { name: 'jobs', path: '/jobs/1' },
  { name: 'item', path: `/item/${ITEM_ID}` },
  { name: 'user', path: `/user/${USER_ID}` },
  { name: 'settings', path: '/news/1', action: 'openSettings' },
];

// node-hnapi's /user endpoint currently 404s live; api.hnpwa.com serves the same schema.
export const FIXTURE_SOURCE_OVERRIDES = {
  [`/user/${USER_ID}`]: `https://api.hnpwa.com/v0/user/${USER_ID}.json`,
};

export const FIXTURE_REQUESTS = [
  '/news?page=1',
  '/news?page=2',
  '/newest?page=1',
  '/show?page=1',
  '/ask?page=1',
  '/jobs?page=1',
  `/item/${ITEM_ID}`,
  `/user/${USER_ID}`,
];

export const VIEWPORTS = {
  desktop: { width: 1280, height: 800 },
  mobile: { width: 390, height: 844 },
};

/** "/news?page=1" -> "news_page_1.json", "/item/123" -> "item_123.json" */
export function fixtureFile(path) {
  return path.replace(/^\//, '').replace(/[?=/&]+/g, '_') + '.json';
}
