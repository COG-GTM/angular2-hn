import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { BASE_URL, fetchFeed, fetchItem, fetchPoll, fetchUser } from './hackernews';
import { PollResult, Story, User } from '../models';

function makeStory(overrides: Partial<Story> = {}): Story {
    return {
        id: 1,
        title: 'Example',
        points: 10,
        user: 'alice',
        time: 0,
        time_ago: 0,
        type: 'story',
        url: 'https://example.com',
        domain: 'example.com',
        comments: [],
        comments_count: 0,
        poll: [],
        poll_votes_count: 0,
        deleted: false,
        dead: false,
        ...overrides,
    };
}

function jsonResponse(data: unknown) {
    return { json: () => Promise.resolve(data) };
}

let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
    fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
    vi.unstubAllGlobals();
});

describe('fetchFeed', () => {
    it('requests the feed endpoint and returns stories', async () => {
        const stories = [makeStory({ id: 1 }), makeStory({ id: 2 })];
        fetchMock.mockResolvedValue(jsonResponse(stories));

        const result = await fetchFeed('news', 2);

        expect(fetchMock).toHaveBeenCalledWith(`${BASE_URL}/news?page=2`, {
            signal: undefined,
        });
        expect(result).toEqual(stories);
    });
});

describe('fetchItem', () => {
    it('returns a non-poll story without aggregating', async () => {
        const story = makeStory({ id: 5, type: 'story' });
        fetchMock.mockResolvedValue(jsonResponse(story));

        const result = await fetchItem(5);

        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(fetchMock).toHaveBeenCalledWith(`${BASE_URL}/item/5`, {
            signal: undefined,
        });
        expect(result).toEqual(story);
    });

    it('aggregates poll options into poll[] and poll_votes_count', async () => {
        const pollStory = makeStory({
            id: 100,
            type: 'poll',
            poll: [
                { points: 0, content: '' },
                { points: 0, content: '' },
            ],
            poll_votes_count: 999,
        });
        const option1: PollResult = { points: 5, content: 'a' };
        const option2: PollResult = { points: 7, content: 'b' };
        fetchMock
            .mockResolvedValueOnce(jsonResponse(pollStory))
            .mockResolvedValueOnce(jsonResponse(option1))
            .mockResolvedValueOnce(jsonResponse(option2));

        const result = await fetchItem(100);

        expect(fetchMock).toHaveBeenCalledWith(`${BASE_URL}/item/101`, {
            signal: undefined,
        });
        expect(fetchMock).toHaveBeenCalledWith(`${BASE_URL}/item/102`, {
            signal: undefined,
        });
        expect(result.poll[0]).toEqual(option1);
        expect(result.poll[1]).toEqual(option2);
        expect(result.poll_votes_count).toBe(12);
    });
});

describe('fetchPoll', () => {
    it('requests the item endpoint for a poll option', async () => {
        const option: PollResult = { points: 3, content: 'x' };
        fetchMock.mockResolvedValue(jsonResponse(option));

        const result = await fetchPoll(42);

        expect(fetchMock).toHaveBeenCalledWith(`${BASE_URL}/item/42`, {
            signal: undefined,
        });
        expect(result).toEqual(option);
    });
});

describe('fetchUser', () => {
    it('requests the user endpoint and returns the user', async () => {
        const user: User = {
            id: 'alice',
            crated_time: 0,
            created: '2020',
            karma: 100,
            avg: 1,
            about: 'hi',
        };
        fetchMock.mockResolvedValue(jsonResponse(user));

        const result = await fetchUser('alice');

        expect(fetchMock).toHaveBeenCalledWith(`${BASE_URL}/user/alice`, {
            signal: undefined,
        });
        expect(result).toEqual(user);
    });
});

describe('error handling', () => {
    it('rejects on non-abort errors', async () => {
        fetchMock.mockRejectedValue(new Error('network down'));

        await expect(fetchFeed('news', 1)).rejects.toThrow('network down');
    });
});

describe('abort behavior', () => {
    it('does not resolve or reject when the request is aborted', async () => {
        const controller = new AbortController();
        controller.abort();
        fetchMock.mockRejectedValue(
            new DOMException('The operation was aborted.', 'AbortError')
        );

        const pending = fetchFeed('news', 1, controller.signal);

        const outcome = await Promise.race([
            pending.then(
                () => 'settled',
                () => 'settled'
            ),
            new Promise<string>((resolve) => setTimeout(() => resolve('pending'), 30)),
        ]);
        expect(outcome).toBe('pending');
    });
});
