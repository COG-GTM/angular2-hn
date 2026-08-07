import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { baseUrl, fetchFeed, fetchItemContent, fetchPollContent, fetchUser } from './hackernews';
import { Story } from '../models/story';

function jsonResponse(body: unknown) {
    return Promise.resolve({ json: () => Promise.resolve(body) } as Response);
}

describe('hackernews api', () => {
    let fetchMock: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        fetchMock = vi.fn();
        vi.stubGlobal('fetch', fetchMock);
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    describe('fetchFeed', () => {
        it('requests the feed for the given type and page', async () => {
            const stories = [{ id: 1, title: 'A story' }];
            fetchMock.mockReturnValue(jsonResponse(stories));

            await expect(fetchFeed('news', 2)).resolves.toEqual(stories);
            expect(fetchMock).toHaveBeenCalledWith(`${baseUrl}/news?page=2`, undefined);
        });

        it('rejects when the request fails', async () => {
            fetchMock.mockRejectedValue(new Error('offline'));

            await expect(fetchFeed('news', 1)).rejects.toThrow('offline');
        });
    });

    describe('fetchItemContent', () => {
        it('requests the item by id and leaves non-poll stories untouched', async () => {
            const story = { id: 42, type: 'story', title: 'A story' };
            fetchMock.mockReturnValue(jsonResponse(story));

            await expect(fetchItemContent(42)).resolves.toEqual(story);
            expect(fetchMock).toHaveBeenCalledTimes(1);
            expect(fetchMock).toHaveBeenCalledWith(`${baseUrl}/item/42`, undefined);
        });

        it('resolves every poll option and accumulates the total vote count', async () => {
            const poll = {
                id: 100,
                type: 'poll',
                poll: [{}, {}, {}],
            } as unknown as Story;
            fetchMock.mockImplementation((url: string) => {
                if (url === `${baseUrl}/item/100`) {
                    return jsonResponse(poll);
                }
                const optionId = Number(url.split('/').pop());
                return jsonResponse({ content: `option ${optionId}`, points: optionId - 100 });
            });

            const item = await fetchItemContent(100);

            expect(fetchMock).toHaveBeenCalledWith(`${baseUrl}/item/101`, undefined);
            expect(fetchMock).toHaveBeenCalledWith(`${baseUrl}/item/102`, undefined);
            expect(fetchMock).toHaveBeenCalledWith(`${baseUrl}/item/103`, undefined);
            expect(item.poll).toEqual([
                { content: 'option 101', points: 1 },
                { content: 'option 102', points: 2 },
                { content: 'option 103', points: 3 },
            ]);
            expect(item.poll_votes_count).toBe(6);
        });

        it('rejects when a poll option request fails', async () => {
            fetchMock.mockImplementation((url: string) => {
                if (url === `${baseUrl}/item/100`) {
                    return jsonResponse({ id: 100, type: 'poll', poll: [{}] });
                }
                return Promise.reject(new Error('poll option unavailable'));
            });

            await expect(fetchItemContent(100)).rejects.toThrow('poll option unavailable');
        });

        it('rejects when the response body cannot be parsed', async () => {
            fetchMock.mockResolvedValue({ json: () => Promise.reject(new Error('invalid json')) } as unknown as Response);

            await expect(fetchItemContent(1)).rejects.toThrow('invalid json');
        });
    });

    describe('fetchPollContent', () => {
        it('requests the poll option by id', async () => {
            const pollResult = { content: 'option', points: 12 };
            fetchMock.mockReturnValue(jsonResponse(pollResult));

            await expect(fetchPollContent(7)).resolves.toEqual(pollResult);
            expect(fetchMock).toHaveBeenCalledWith(`${baseUrl}/item/7`, undefined);
        });
    });

    describe('fetchUser', () => {
        it('requests the user by id', async () => {
            const user = { id: 'pg', karma: 155000 };
            fetchMock.mockReturnValue(jsonResponse(user));

            await expect(fetchUser('pg')).resolves.toEqual(user);
            expect(fetchMock).toHaveBeenCalledWith(`${baseUrl}/user/pg`, undefined);
        });

        it('rejects when the request fails', async () => {
            fetchMock.mockRejectedValue(new Error('404'));

            await expect(fetchUser('nobody')).rejects.toThrow('404');
        });
    });
});
