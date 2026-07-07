import { test, expect, Page } from '@playwright/test';

const feed = [
  {
    id: 1,
    title: 'Ask HN: What are you working on?',
    points: 120,
    user: 'alice',
    time: 0,
    time_ago: '2 hours ago',
    type: 'ask',
    url: 'item?id=1',
    domain: '',
    comments_count: 2,
  },
  {
    id: 2,
    title: 'A very interesting external article',
    points: 88,
    user: 'bob',
    time: 0,
    time_ago: '3 hours ago',
    type: 'link',
    url: 'https://example.com/article',
    domain: 'example.com',
    comments_count: 5,
  },
];

const item = {
  id: 1,
  title: 'Ask HN: What are you working on?',
  points: 120,
  user: 'alice',
  time: 0,
  time_ago: '2 hours ago',
  type: 'ask',
  url: 'item?id=1',
  domain: '',
  content: '<p>Share your current project.</p>',
  comments_count: 2,
  comments: [
    {
      id: 10,
      level: 0,
      user: 'carol',
      time: 0,
      time_ago: '1 hour ago',
      content: '<p>Working on a React migration.</p>',
      deleted: false,
      comments: [],
    },
  ],
};

const user = {
  id: 'alice',
  created: 'March 15, 2015',
  karma: 4321,
  about: '<p>Hello from Alice</p>',
};

async function mockApi(page: Page) {
  await page.route('**/node-hnapi.herokuapp.com/**', async (route) => {
    const url = route.request().url();
    let body: unknown = [];
    if (url.includes('/item/1')) {
      body = item;
    } else if (url.includes('/user/alice')) {
      body = user;
    } else {
      body = feed;
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(body),
    });
  });
}

test.beforeEach(async ({ page }) => {
  await mockApi(page);
});

test('redirects the root to /news/1 and renders the feed', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL(/\/news\/1$/);
  await expect(page.getByText('Ask HN: What are you working on?')).toBeVisible();
  await expect(page.getByText('A very interesting external article')).toBeVisible();
});

test('navigates to an item detail with comments', async ({ page }) => {
  await page.goto('/news/1');
  await page.getByRole('link', { name: 'Ask HN: What are you working on?' }).first().click();
  await expect(page).toHaveURL(/\/item\/1$/);
  await expect(page.getByText('Share your current project.')).toBeVisible();
  await expect(page.getByText('Working on a React migration.')).toBeVisible();
});

test('navigates to a user profile', async ({ page }) => {
  await page.goto('/news/1');
  await page.getByRole('link', { name: 'alice' }).first().click();
  await expect(page).toHaveURL(/\/user\/alice$/);
  await expect(page.getByText('Created March 15, 2015')).toBeVisible();
  await expect(page.getByText('Hello from Alice')).toBeVisible();
});

test('toggles a theme in Settings and updates the wrapper class', async ({ page }) => {
  await page.goto('/news/1');

  // Default theme wrapper is present.
  await expect(page.locator('div.default .wrapper')).toHaveCount(1);

  // Open settings via the cog icon and choose the Night theme.
  await page.getByAltText('Settings').click();
  await page.getByLabel('Night').check();

  await expect(page.locator('div.night .wrapper')).toHaveCount(1);
  await expect(page.locator('div.default .wrapper')).toHaveCount(0);
});
