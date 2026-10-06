import type { Story } from '../models';
import { fetchFeed, fetchItemContent, fetchPollContent, fetchUser, HN_API_BASE_URL } from './hackernewsApi';

function jsonResponse(body: unknown, status = 200): Response {
    return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}

function mockFetch(handler: (url: string, init?: RequestInit) => Response | Promise<Response>) {
    return vi
        .spyOn(globalThis, 'fetch')
        .mockImplementation((input: RequestInfo | URL, init?: RequestInit) =>
            Promise.resolve(handler(String(input), init))
        );
}

const story: Story = {
    id: 1,
    title: 'Hello',
    points: 10,
    user: 'pg',
    time: 1,
    time_ago: '1 hour ago',
    type: 'link',
    url: 'https://example.com',
    domain: 'example.com',
    comments_count: 0,
};

describe('hackernewsApi', () => {
    it('uses the node-hnapi base URL', () => {
        expect(HN_API_BASE_URL).toBe('https://node-hnapi.herokuapp.com');
    });

    it('fetchFeed GETs /{feedType}?page={page}', async () => {
        const fetchSpy = mockFetch(() => jsonResponse([story]));
        await expect(fetchFeed('newest', 3)).resolves.toEqual([story]);
        expect(fetchSpy).toHaveBeenCalledWith(`${HN_API_BASE_URL}/newest?page=3`, { signal: undefined });
    });

    it('passes the abort signal to fetch', async () => {
        const fetchSpy = mockFetch(() => jsonResponse([]));
        const controller = new AbortController();
        await fetchFeed('news', 1, controller.signal);
        expect(fetchSpy).toHaveBeenCalledWith(`${HN_API_BASE_URL}/news?page=1`, { signal: controller.signal });
    });

    it('fetchItemContent GETs /item/{id} and returns non-poll items untouched', async () => {
        const fetchSpy = mockFetch(() => jsonResponse(story));
        await expect(fetchItemContent(1)).resolves.toEqual(story);
        expect(fetchSpy).toHaveBeenCalledTimes(1);
        expect(fetchSpy).toHaveBeenCalledWith(`${HN_API_BASE_URL}/item/1`, { signal: undefined });
    });

    it('fetchItemContent loads every poll option in parallel and sums the votes', async () => {
        const poll: Story = {
            ...story,
            id: 100,
            type: 'poll',
            poll: [
                { points: 0, content: '' },
                { points: 0, content: '' },
                { points: 0, content: '' },
            ],
        };
        const options: Record<string, { points: number; content: string }> = {
            '101': { points: 5, content: 'A' },
            '102': { points: 7, content: 'B' },
            '103': { points: 1, content: 'C' },
        };
        const fetchSpy = mockFetch((url) => {
            const id = url.split('/').pop() as string;
            return jsonResponse(id === '100' ? poll : options[id]);
        });

        const result = await fetchItemContent(100);

        expect(fetchSpy.mock.calls.map(([url]) => url)).toEqual([
            `${HN_API_BASE_URL}/item/100`,
            `${HN_API_BASE_URL}/item/101`,
            `${HN_API_BASE_URL}/item/102`,
            `${HN_API_BASE_URL}/item/103`,
        ]);
        expect(result.poll).toEqual([options['101'], options['102'], options['103']]);
        expect(result.poll_votes_count).toBe(13);
    });

    it('fetchItemContent treats a poll without options as zero votes', async () => {
        const fetchSpy = mockFetch(() => jsonResponse({ ...story, type: 'poll' }));
        const result = await fetchItemContent(1);
        expect(fetchSpy).toHaveBeenCalledTimes(1);
        expect(result.poll).toEqual([]);
        expect(result.poll_votes_count).toBe(0);
    });

    it('fetchItemContent rejects when a poll option fails to load', async () => {
        mockFetch((url) =>
            url.endsWith('/item/1')
                ? jsonResponse({ ...story, type: 'poll', poll: [{ points: 0, content: '' }] })
                : jsonResponse({}, 500)
        );
        await expect(fetchItemContent(1)).rejects.toThrow('HN API request to /item/2 failed with status 500');
    });

    it('fetchPollContent GETs /item/{id}', async () => {
        const fetchSpy = mockFetch(() => jsonResponse({ points: 3, content: 'Yes' }));
        await expect(fetchPollContent(42)).resolves.toEqual({ points: 3, content: 'Yes' });
        expect(fetchSpy).toHaveBeenCalledWith(`${HN_API_BASE_URL}/item/42`, { signal: undefined });
    });

    it('fetchUser GETs /user/{id}', async () => {
        const user = { id: 'pg', created: '19 years ago', karma: 1, avg: 0, about: 'hi' };
        const fetchSpy = mockFetch(() => jsonResponse(user));
        await expect(fetchUser('pg')).resolves.toEqual(user);
        expect(fetchSpy).toHaveBeenCalledWith(`${HN_API_BASE_URL}/user/pg`, { signal: undefined });
    });

    it('rejects on non-2xx responses', async () => {
        mockFetch(() => jsonResponse({ error: 'nope' }, 404));
        await expect(fetchUser('nobody')).rejects.toThrow('HN API request to /user/nobody failed with status 404');
    });

    it('rejects on network failure', async () => {
        vi.spyOn(globalThis, 'fetch').mockRejectedValue(new TypeError('Failed to fetch'));
        await expect(fetchFeed('news', 1)).rejects.toThrow('Failed to fetch');
    });

    it('rejects with an AbortError without fetching when the signal is already aborted', async () => {
        const fetchSpy = mockFetch(() => jsonResponse([]));
        const controller = new AbortController();
        controller.abort();
        await expect(fetchFeed('news', 1, controller.signal)).rejects.toMatchObject({ name: 'AbortError' });
        expect(fetchSpy).not.toHaveBeenCalled();
    });

    it('falls back to a DOMException AbortError when the signal has no reason', async () => {
        const signal = { aborted: true, reason: undefined } as AbortSignal;
        await expect(fetchItemContent(1, signal)).rejects.toMatchObject({ name: 'AbortError' });
    });

    it('propagates the AbortError when aborted mid-flight', async () => {
        vi.spyOn(globalThis, 'fetch').mockImplementation(
            (_input, init) =>
                new Promise((_resolve, reject) => {
                    init?.signal?.addEventListener('abort', () => reject(init.signal?.reason));
                })
        );
        const controller = new AbortController();
        const pending = fetchUser('pg', controller.signal);
        controller.abort();
        await expect(pending).rejects.toMatchObject({ name: 'AbortError' });
    });
});
