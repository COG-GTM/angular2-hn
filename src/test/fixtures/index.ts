import { Comment, Story, User } from '../../models';

export function makeStory(overrides: Partial<Story> = {}): Story {
    return {
        id: 1,
        title: 'Angular 2 HN',
        points: 128,
        user: 'ada',
        time: 1_600_000_000,
        time_ago: '2 hours ago',
        type: 'story',
        url: 'https://example.com/angular2-hn',
        domain: 'example.com',
        comments: [],
        comments_count: 42,
        poll: [],
        poll_votes_count: 0,
        content: '<p>Story content</p>',
        deleted: false,
        dead: false,
        ...overrides,
    };
}

export const story: Story = makeStory();

export const internalStory: Story = makeStory({
    id: 2,
    title: 'Ask HN: What are you working on?',
    url: 'item?id=2',
    domain: '',
    comments_count: 1,
});

export const feed: Story[] = [
    story,
    makeStory({ id: 3, title: 'Second story', url: 'https://example.org/second', domain: 'example.org' }),
    makeStory({ id: 4, title: 'Third story', url: 'https://example.net/third', domain: 'example.net' }),
];

export const pollStory: Story = makeStory({
    id: 5,
    title: 'Poll: favourite framework?',
    type: 'poll',
    url: 'item?id=5',
    domain: '',
    comments_count: 0,
    poll: [
        { points: 30, content: 'React' },
        { points: 10, content: 'Angular' },
    ],
    poll_votes_count: 40,
});

export const jobStory: Story = makeStory({
    id: 6,
    title: 'YC startup is hiring',
    type: 'job',
    comments_count: 0,
});

export function makeComment(overrides: Partial<Comment> = {}): Comment {
    return {
        id: 100,
        level: 0,
        user: 'grace',
        time: 1_600_000_100,
        time_ago: '1 hour ago',
        content: '<p>Top level comment</p>',
        deleted: false,
        comments: [],
        ...overrides,
    };
}

export const commentTree: Comment = makeComment({
    comments: [
        makeComment({
            id: 101,
            level: 1,
            user: 'linus',
            content: '<p>Child comment</p>',
            comments: [
                makeComment({
                    id: 102,
                    level: 2,
                    user: 'alan',
                    content: '<p>Grandchild comment</p>',
                }),
            ],
        }),
    ],
});

export const user: User = {
    id: 'ada',
    crated_time: 1_500_000_000,
    created: 'October 12, 2015',
    karma: 4321,
    avg: 3.2,
    about: '<p>Hello from the test fixture</p>',
};
