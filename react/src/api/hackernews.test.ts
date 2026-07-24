import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchFeed, fetchItemContent, fetchPollContent, fetchUser } from './hackernews';
import type { PollResult, Story } from '../models';

const BASE_URL = 'https://node-hnapi.herokuapp.com';

function jsonResponse(data: unknown): Response {
    return {
        ok: true,
        status: 200,
        json: () => Promise.resolve(data),
    } as Response;
}

function errorResponse(status: number): Response {
    return {
        ok: false,
        status,
        json: () => Promise.reject(new Error('should not parse')),
    } as Response;
}

const fetchMock = vi.fn();

beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
    vi.unstubAllGlobals();
    fetchMock.mockReset();
});

describe('fetchFeed', () => {
    it('fetches the feed for the given type and page', async () => {
        const stories = [{ id: 1 }, { id: 2 }] as Story[];
        fetchMock.mockResolvedValueOnce(jsonResponse(stories));

        const result = await fetchFeed('news', 2);

        expect(fetchMock).toHaveBeenCalledWith(`${BASE_URL}/news?page=2`);
        expect(result).toEqual(stories);
    });

    it('throws on non-ok responses', async () => {
        fetchMock.mockResolvedValueOnce(errorResponse(500));

        await expect(fetchFeed('news', 1)).rejects.toThrow('500');
    });
});

describe('fetchItemContent', () => {
    it('fetches a story by id', async () => {
        const story = { id: 42, type: 'link' } as unknown as Story;
        fetchMock.mockResolvedValueOnce(jsonResponse(story));

        const result = await fetchItemContent(42);

        expect(fetchMock).toHaveBeenCalledWith(`${BASE_URL}/item/42`);
        expect(result).toEqual(story);
    });

    it('resolves poll options and totals the votes for polls', async () => {
        const story = {
            id: 100,
            type: 'poll',
            poll: [{}, {}] as PollResult[],
        } as unknown as Story;
        const option1: PollResult = { points: 3, content: 'a' };
        const option2: PollResult = { points: 5, content: 'b' };
        fetchMock
            .mockResolvedValueOnce(jsonResponse(story))
            .mockResolvedValueOnce(jsonResponse(option1))
            .mockResolvedValueOnce(jsonResponse(option2));

        const result = await fetchItemContent(100);

        expect(fetchMock).toHaveBeenNthCalledWith(2, `${BASE_URL}/item/101`);
        expect(fetchMock).toHaveBeenNthCalledWith(3, `${BASE_URL}/item/102`);
        expect(result.poll).toEqual([option1, option2]);
        expect(result.poll_votes_count).toBe(8);
    });
});

describe('fetchPollContent', () => {
    it('fetches a poll option by id', async () => {
        const option: PollResult = { points: 7, content: 'c' };
        fetchMock.mockResolvedValueOnce(jsonResponse(option));

        const result = await fetchPollContent(101);

        expect(fetchMock).toHaveBeenCalledWith(`${BASE_URL}/item/101`);
        expect(result).toEqual(option);
    });
});

describe('fetchUser', () => {
    it('fetches a user by id', async () => {
        const user = { id: 'pg' };
        fetchMock.mockResolvedValueOnce(jsonResponse(user));

        const result = await fetchUser('pg');

        expect(fetchMock).toHaveBeenCalledWith(`${BASE_URL}/user/pg`);
        expect(result).toEqual(user);
    });

    it('throws on non-ok responses', async () => {
        fetchMock.mockResolvedValueOnce(errorResponse(404));

        await expect(fetchUser('nope')).rejects.toThrow('404');
    });
});
