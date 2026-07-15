// Generates recorded HN API fixtures shared by the Angular and React test suites.
// Run: node fixtures/generate.mjs
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const dir = dirname(fileURLToPath(import.meta.url));
const write = (name, data) =>
  writeFileSync(join(dir, name), JSON.stringify(data, null, 2) + '\n');

function makeStory(i, feed) {
  const id = feed.base + i;
  return {
    id,
    title: `${feed.label} story ${i}`,
    points: 100 + i,
    user: `user${i}`,
    time: 1500000000 + i,
    time_ago: `${i} hours ago`,
    comments_count: i,
    type: 'link',
    url: `http://example.com/${feed.type}/${i}`,
    domain: 'example.com',
  };
}

const feeds = {
  news: { type: 'news', label: 'News', base: 1000 },
  newest: { type: 'newest', label: 'Newest', base: 2000 },
  show: { type: 'show', label: 'Show', base: 3000 },
  ask: { type: 'ask', label: 'Ask', base: 4000 },
  jobs: { type: 'jobs', label: 'Jobs', base: 5000 },
};

// news page 1: full 30 items (drives the "More ›" button).
// Item 2 is a discuss/ask-style post (no http url) to exercise the internal link branch.
const news1 = Array.from({ length: 30 }, (_, k) => makeStory(k + 1, feeds.news));
news1[1] = {
  id: 1002,
  title: 'News discuss post 2',
  points: 42,
  user: 'user2',
  time: 1500000002,
  time_ago: '2 hours ago',
  comments_count: 0,
  type: 'ask',
  url: 'item?id=1002',
  domain: '',
};
write('feed-news-1.json', news1);

// news page 2: only 5 items (no "More ›", but a "‹ Prev" is shown).
write(
  'feed-news-2.json',
  Array.from({ length: 5 }, (_, k) => makeStory(k + 31, feeds.news))
);

// newest / show / ask: 3 items each.
write('feed-newest-1.json', Array.from({ length: 3 }, (_, k) => makeStory(k + 1, feeds.newest)));
write('feed-show-1.json', Array.from({ length: 3 }, (_, k) => makeStory(k + 1, feeds.show)));
write('feed-ask-1.json', [
  {
    id: 4001,
    title: 'Ask HN: How do you test parity?',
    points: 55,
    user: 'askuser',
    time: 1500000001,
    time_ago: '1 hour ago',
    comments_count: 3,
    type: 'ask',
    url: 'item?id=4001',
    domain: '',
  },
]);

// jobs page 1: 2 job items (type 'job' hides user/points/comments).
write('feed-jobs-1.json', [
  {
    id: 5001,
    title: 'Senior Engineer at YC Startup (San Francisco)',
    points: null,
    user: null,
    time: 1500000001,
    time_ago: '1 hour ago',
    comments_count: 0,
    type: 'job',
    url: 'http://example.com/jobs/1',
    domain: 'example.com',
  },
  {
    id: 5002,
    title: 'Founding Designer at YC Startup (Remote)',
    points: null,
    user: null,
    time: 1500000002,
    time_ago: '2 hours ago',
    comments_count: 0,
    type: 'job',
    url: 'http://example.com/jobs/2',
    domain: 'example.com',
  },
]);

// item detail: a story with nested + deleted comments.
write('item-1001.json', {
  id: 1001,
  title: 'News story 1',
  points: 101,
  user: 'user1',
  time: 1500000001,
  time_ago: '1 hour ago',
  type: 'link',
  url: 'http://example.com/news/1',
  domain: 'example.com',
  comments_count: 3,
  content: '<p>This is the story <b>content</b>.</p>',
  comments: [
    {
      id: 90001,
      level: 0,
      user: 'commenter1',
      time: 1500000100,
      time_ago: '30 minutes ago',
      content: '<p>Top level comment</p>',
      deleted: false,
      comments: [
        {
          id: 90002,
          level: 1,
          user: 'commenter2',
          time: 1500000200,
          time_ago: '20 minutes ago',
          content: '<p>Nested reply</p>',
          deleted: false,
          comments: [],
        },
      ],
    },
    {
      id: 90003,
      level: 0,
      user: '',
      time: 1500000300,
      time_ago: '10 minutes ago',
      content: '',
      deleted: true,
      comments: [],
    },
  ],
});

// item detail: an ask/discuss post (internal link title branch).
write('item-1002.json', {
  id: 1002,
  title: 'News discuss post 2',
  points: 42,
  user: 'user2',
  time: 1500000002,
  time_ago: '2 hours ago',
  type: 'ask',
  url: 'item?id=1002',
  domain: '',
  comments_count: 0,
  content: '<p>Discuss away.</p>',
  comments: [],
});

// item detail: a job.
write('item-5001.json', {
  id: 5001,
  title: 'Senior Engineer at YC Startup (San Francisco)',
  points: null,
  user: null,
  time: 1500000001,
  time_ago: '1 hour ago',
  type: 'job',
  url: 'http://example.com/jobs/1',
  domain: 'example.com',
  comments_count: 0,
  content: '<p>We are hiring engineers.</p>',
  comments: [],
});

// item detail: a poll (with 3 options fetched individually as item/(id+1..3)).
write('item-300.json', {
  id: 300,
  title: 'Poll: favorite framework?',
  points: 200,
  user: 'polluser',
  time: 1500000000,
  time_ago: '5 hours ago',
  type: 'poll',
  url: 'item?id=300',
  domain: '',
  comments_count: 0,
  content: '<p>Vote below.</p>',
  poll: [
    { points: 0, content: 'React' },
    { points: 0, content: 'Angular' },
    { points: 0, content: 'Vue' },
  ],
  comments: [],
});
// poll option items (points overwrite the poll array; votes sum = 120).
write('item-301.json', { id: 301, points: 60, content: 'React' });
write('item-302.json', { id: 302, points: 40, content: 'Angular' });
write('item-303.json', { id: 303, points: 20, content: 'Vue' });

// user profile.
write('user-user1.json', {
  id: 'user1',
  created_time: 1400000000,
  created: '5 years ago',
  karma: 1234,
  avg: null,
  about: '<p>Hello, I am <i>user1</i>.</p>',
});

console.log('fixtures generated');
