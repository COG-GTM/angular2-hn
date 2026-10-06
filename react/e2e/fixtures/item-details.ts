import type { Comment, PollResult, Story } from '../../src/shared/models';

function comment(id: number, level: number, user: string, content: string, comments: Comment[] = []): Comment {
    return { id, level, user, time: 1700000000, time_ago: `${level + 1} hours ago`, content, comments };
}

export const story: Story = {
    id: 1001,
    title: 'Mocked story with comments',
    points: 256,
    user: 'pg',
    time: 1700000000,
    time_ago: '5 hours ago',
    type: 'link',
    url: 'https://example.com/article',
    domain: 'example.com',
    content: '',
    comments_count: 4,
    comments: [
        comment(2001, 0, 'alice', '<p>Top-level comment</p>', [
            comment(2002, 1, 'bob', '<p>First reply</p>', [comment(2003, 2, 'carol', '<p>Deeply nested reply</p>')]),
        ]),
        { ...comment(2004, 0, '', ''), deleted: true },
        comment(2005, 0, 'dave', '<p>Second top-level <a href="https://example.org">link</a></p>'),
    ],
};

export const poll: Story = {
    id: 3001,
    title: 'Mocked poll: tabs or spaces?',
    points: 80,
    user: 'pollster',
    time: 1700000000,
    time_ago: '1 day ago',
    type: 'poll',
    url: 'item?id=3001',
    content: '<p>Cast your vote.</p>',
    comments_count: 1,
    comments: [comment(4001, 0, 'eve', '<p>Spaces, obviously.</p>')],
    poll: [
        { points: 0, content: '' },
        { points: 0, content: '' },
    ],
};

export const pollOptions: Record<number, PollResult> = {
    3002: { points: 30, content: '<p>Tabs</p>' },
    3003: { points: 10, content: '<p>Spaces</p>' },
};

export const feed: Story[] = [{ ...story, comments: [] }];

export const items: Record<number, unknown> = { [story.id]: story, [poll.id]: poll, ...pollOptions };
