import { Story } from '../models/story';
import { Comment } from '../models/comment';
import { User } from '../models/user';

export function makeStory(overrides: Partial<Story> = {}): Story {
    return {
        id: 1,
        title: 'A sample story',
        points: 100,
        user: 'alice',
        time: 1600000000,
        time_ago: 0,
        type: 'story',
        url: 'https://example.com/article',
        domain: 'example.com',
        content: '',
        comments: [],
        comments_count: 42,
        poll: [],
        poll_votes_count: 0,
        deleted: false,
        dead: false,
        ...overrides,
    } as Story;
}

export function makeStoryList(count = 30): Story[] {
    return Array.from({ length: count }, (_, i) =>
        makeStory({
            id: i + 1,
            title: `Story number ${i + 1}`,
            user: `user${i + 1}`,
            points: i + 1,
            comments_count: i,
            url: `https://example.com/article-${i + 1}`,
            domain: 'example.com',
        })
    );
}

export function makeComment(overrides: Partial<Comment> = {}): Comment {
    return {
        id: 100,
        level: 0,
        user: 'commenter',
        time: 1600000000,
        time_ago: '1 hour ago',
        content: '<p>Top level comment</p>',
        deleted: false,
        comments: [],
        ...overrides,
    };
}

export const itemWithComments: Story = makeStory({
    id: 500,
    title: 'Item with comments',
    type: 'story',
    url: 'https://example.com/item-500',
    domain: 'example.com',
    content: '<p>Story body content</p>',
    comments_count: 2,
    comments: [
        makeComment({
            id: 101,
            user: 'parent',
            content: '<p>Parent comment</p>',
            comments: [
                makeComment({
                    id: 102,
                    user: 'child',
                    content: '<p>Nested child comment</p>',
                    comments: [],
                }),
            ],
        }),
        makeComment({
            id: 103,
            user: 'deleted-guy',
            deleted: true,
            content: '',
            comments: [],
        }),
    ],
});

export const pollItem: Story = makeStory({
    id: 600,
    title: 'A poll',
    type: 'poll',
    url: '',
    domain: '',
    content: '<p>Which do you prefer?</p>',
    comments_count: 0,
    poll: [
        { content: 'Option A', points: 0 },
        { content: 'Option B', points: 0 },
    ],
    poll_votes_count: 0,
    comments: [],
});

export const pollOption1 = { content: 'Option A', points: 30 };
export const pollOption2 = { content: 'Option B', points: 10 };

export const sampleUser: User = {
    id: 'alice',
    crated_time: 1500000000,
    created: 'September 1, 2017',
    karma: 1234,
    avg: 5,
    about: '<p>Hello, I am alice</p>',
};
