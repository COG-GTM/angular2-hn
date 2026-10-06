import type { Comment, Story, User } from '../types';

export const linkStory: Story = {
  id: 1001,
  title: 'A link story',
  points: 120,
  user: 'alice',
  time: 1700000000,
  time_ago: '2 hours ago',
  type: 'link',
  url: 'https://example.com/post',
  domain: 'example.com',
  comments_count: 12,
};

export const askStory: Story = {
  id: 1002,
  title: 'Ask HN: Something?',
  points: 40,
  user: 'bob',
  time: 1700000100,
  time_ago: '1 hour ago',
  type: 'ask',
  url: 'item?id=1002',
  comments_count: 1,
};

export const jobStory: Story = {
  id: 1003,
  title: 'Acme (YC W20) is hiring',
  points: null,
  user: null,
  time: 1700000200,
  time_ago: '3 hours ago',
  type: 'job',
  url: 'https://acme.example/jobs',
  domain: 'acme.example',
  comments_count: 0,
};

export function makeFeed(count: number, start = 1): Story[] {
  return Array.from({ length: count }, (_, i) => ({
    ...linkStory,
    id: start + i,
    title: `Story ${start + i}`,
  }));
}

export const commentTree: Comment[] = [
  {
    id: 2001,
    level: 0,
    user: 'carol',
    time: 1700000300,
    time_ago: '50 minutes ago',
    content: '<p>Top level comment</p>',
    comments: [
      {
        id: 2002,
        level: 1,
        user: 'dave',
        time: 1700000400,
        time_ago: '40 minutes ago',
        content: '<p>Nested reply</p>',
        comments: [],
      },
    ],
  },
  {
    id: 2003,
    level: 0,
    user: '',
    time: 1700000500,
    time_ago: '30 minutes ago',
    content: '',
    deleted: true,
    comments: [],
  },
];

export const itemWithComments: Story = {
  ...linkStory,
  content: '',
  comments: commentTree,
  comments_count: 3,
};

export const pollItem: Story = {
  id: 3000,
  title: 'Poll: Tabs or spaces?',
  points: 50,
  user: 'erin',
  time: 1700000600,
  time_ago: '5 hours ago',
  type: 'poll',
  url: 'item?id=3000',
  content: '<p>Vote!</p>',
  comments: [],
  comments_count: 0,
  poll: [
    { points: 0, content: '' },
    { points: 0, content: '' },
  ],
};

export const user: User = {
  id: 'pg',
  created_time: 1160418092,
  created: '20 years ago',
  karma: 157316,
  about: 'Bug fixer. <a href="https://paulgraham.com">site</a>',
};
