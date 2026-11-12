import type { Comment, Story, User } from '../models';

export function makeStory(overrides: Partial<Story> = {}): Story {
    return {
        id: 1,
        title: 'A story',
        points: 42,
        user: 'pg',
        time: 0,
        time_ago: '2 hours ago',
        type: 'link',
        url: 'https://example.com/a',
        domain: 'example.com',
        comments: [],
        comments_count: 3,
        ...overrides,
    };
}

export function makeComment(overrides: Partial<Comment> = {}): Comment {
    return {
        id: 100,
        level: 0,
        user: 'alice',
        time: 0,
        time_ago: '1 hour ago',
        content: '<p>Top level</p>',
        comments: [],
        ...overrides,
    };
}

export const user: User = { id: 'pg', created_time: 0, created: '20 years ago', karma: 157316, about: '<i>Bug fixer.</i>' };

export function jsonResponse(body: unknown, status = 200): Response {
    return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}

export function mockFetch(handler: (url: string) => Response | Promise<Response>) {
    return vi.spyOn(globalThis, 'fetch').mockImplementation(async (input) => handler(String(input)));
}
