import { describe, it, expect } from 'vitest';
import type { Story, Comment, User, PollResult, Settings, FeedType } from '../models';

describe('Models', () => {
    it('Story interface has expected shape', () => {
        const story: Story = {
            id: 1,
            title: 'Test',
            points: 10,
            user: 'test',
            time: 123,
            time_ago: '1h',
            type: 'story',
            url: 'https://example.com',
            domain: 'example.com',
            content: '',
            comments: [],
            comments_count: 0,
            poll: [],
            poll_votes_count: 0,
            deleted: false,
            dead: false,
        };
        expect(story.id).toBe(1);
        expect(story.type).toBe('story');
    });

    it('Comment interface supports recursive nesting', () => {
        const comment: Comment = {
            id: 1,
            level: 0,
            user: 'user1',
            time: 123,
            time_ago: '2h',
            content: 'hello',
            deleted: false,
            comments: [
                {
                    id: 2,
                    level: 1,
                    user: 'user2',
                    time: 456,
                    time_ago: '1h',
                    content: 'reply',
                    deleted: false,
                    comments: [],
                },
            ],
        };
        expect(comment.comments.length).toBe(1);
        expect(comment.comments[0].user).toBe('user2');
    });

    it('User interface has expected fields', () => {
        const user: User = {
            id: 'testuser',
            crated_time: 123,
            created: '2020-01-01',
            karma: 100,
            avg: 10,
            about: 'About me',
        };
        expect(user.id).toBe('testuser');
    });

    it('PollResult interface has expected fields', () => {
        const poll: PollResult = { points: 42, content: 'Option A' };
        expect(poll.points).toBe(42);
    });

    it('Settings interface has expected fields', () => {
        const settings: Settings = {
            showSettings: false,
            openLinkInNewTab: false,
            theme: 'default',
            titleFontSize: '16',
            listSpacing: '0',
        };
        expect(settings.theme).toBe('default');
    });

    it('FeedType accepts valid values', () => {
        const types: FeedType[] = ['poll', 'story', 'job'];
        expect(types.length).toBe(3);
    });
});
