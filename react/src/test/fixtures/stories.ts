import type { Story } from '../../api/types';

/** Trimmed copy of a real `/news?page=1` response from node-hnapi. */
export const newsPage1: Story[] = [
  {
    id: 41000001,
    title: 'Show HN: A tiny Hacker News reader',
    points: 312,
    user: 'alice',
    time: 1790000000,
    time_ago: '3 hours ago',
    comments_count: 87,
    type: 'link',
    url: 'https://example.com/reader',
    domain: 'example.com',
  },
  {
    id: 41000002,
    title: 'Ask HN: What are you working on?',
    points: 120,
    user: 'bob',
    time: 1790000500,
    time_ago: '2 hours ago',
    comments_count: 1,
    type: 'ask',
    url: 'item?id=41000002',
  },
  {
    id: 41000003,
    title: 'Acme (YC W24) is hiring engineers',
    points: null,
    user: null,
    time: 1790001000,
    time_ago: '1 hour ago',
    comments_count: 0,
    type: 'job',
    url: 'https://acme.example/jobs',
    domain: 'acme.example',
  },
];
