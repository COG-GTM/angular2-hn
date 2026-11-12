import { jsonResponse, makeStory, mockFetch, user } from '../test/fixtures';
import { fetchFeed, fetchItemContent, fetchUser, HttpError } from './hackernews';

describe('HackerNews API', () => {
    it('fetchFeed requests the feed page', async () => {
        const fetchSpy = mockFetch(() => jsonResponse([makeStory()]));
        const stories = await fetchFeed('show', 2);
        expect(fetchSpy).toHaveBeenCalledWith('https://node-hnapi.herokuapp.com/show?page=2', expect.anything());
        expect(stories).toHaveLength(1);
    });

    it('rejects with HttpError on non-2xx responses', async () => {
        mockFetch(() => jsonResponse({}, 500));
        await expect(fetchFeed('news', 1)).rejects.toBeInstanceOf(HttpError);
    });

    it('fetchItemContent loads poll options and totals the votes', async () => {
        const poll = makeStory({ id: 10, type: 'poll', poll: [{ points: 0, content: '' }, { points: 0, content: '' }] });
        const fetchSpy = mockFetch((url) => {
            if (url.endsWith('/item/10')) return jsonResponse(poll);
            if (url.endsWith('/item/11')) return jsonResponse({ points: 3, content: 'Yes' });
            if (url.endsWith('/item/12')) return jsonResponse({ points: 1, content: 'No' });
            throw new Error(`unexpected ${url}`);
        });
        const item = await fetchItemContent(10);
        expect(fetchSpy).toHaveBeenCalledTimes(3);
        expect(item.poll).toEqual([
            { points: 3, content: 'Yes' },
            { points: 1, content: 'No' },
        ]);
        expect(item.poll_votes_count).toBe(4);
    });

    it('fetchItemContent returns non-poll items unchanged', async () => {
        const story = makeStory({ id: 5 });
        mockFetch(() => jsonResponse(story));
        await expect(fetchItemContent(5)).resolves.toEqual(story);
    });

    it('fetchUser falls back to HNPWA when node-hnapi fails', async () => {
        const fetchSpy = mockFetch((url) =>
            url.startsWith('https://api.hnpwa.com') ? jsonResponse(user) : new Response('Cannot GET', { status: 404 })
        );
        await expect(fetchUser('pg')).resolves.toEqual(user);
        expect(fetchSpy).toHaveBeenLastCalledWith('https://api.hnpwa.com/v0/user/pg.json', expect.anything());
    });

    it('fetchUser rejects when the user does not exist (HNPWA returns 200 null)', async () => {
        mockFetch((url) =>
            url.startsWith('https://api.hnpwa.com') ? jsonResponse(null) : new Response('Cannot GET', { status: 404 })
        );
        await expect(fetchUser('nobody')).rejects.toBeInstanceOf(HttpError);
    });
});
