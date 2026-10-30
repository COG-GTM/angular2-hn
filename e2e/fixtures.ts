import { Page } from '@playwright/test';

const API = 'https://node-hnapi.herokuapp.com';

export const stories = Array.from({ length: 30 }, (_, i) => ({
  id: 1000 + i,
  title: `Story number ${i + 1}`,
  points: 100 - i,
  user: 'pg',
  time_ago: '3 hours ago',
  comments_count: i,
  type: 'link',
  url: `https://example.com/story-${i + 1}`,
  domain: 'example.com',
}));

export const item = {
  ...stories[0],
  content: '',
  comments: [
    {
      id: 1,
      user: 'dang',
      time_ago: '2 hours ago',
      content: '<p>Top level comment</p>',
      deleted: false,
      comments: [{ id: 2, user: 'tptacek', time_ago: '1 hour ago', content: '<p>Nested reply</p>', deleted: false, comments: [] }],
    },
  ],
};

export const user = { id: 'pg', created: '19 years ago', karma: 157316, about: 'Bug fixer.' };

export async function mockHackerNewsApi(page: Page) {
  await page.route(`${API}/**`, (route) => {
    const { pathname } = new URL(route.request().url());
    if (pathname.startsWith('/item/')) return route.fulfill({ json: item });
    if (pathname.startsWith('/user/')) return route.fulfill({ json: user });
    return route.fulfill({ json: stories });
  });
}
