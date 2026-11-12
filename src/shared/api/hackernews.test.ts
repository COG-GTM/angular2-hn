import { mockFetch } from '../../test/utils';
import { fetchFeed, fetchItemContent, fetchUser } from './hackernews';

describe('hackernews api', () => {
    it('fetches a feed page from node-hnapi', async () => {
        const fetchSpy = mockFetch(() => [{ id: 1 }]);
        await expect(fetchFeed('show', 2)).resolves.toEqual([{ id: 1 }]);
        expect(fetchSpy.mock.calls[0][0]).toBe('https://node-hnapi.herokuapp.com/show?page=2');
    });

    it('fetches users from HNPWA', async () => {
        const fetchSpy = mockFetch(() => ({ id: 'pg', karma: 1 }));
        await fetchUser('pg');
        expect(fetchSpy.mock.calls[0][0]).toBe('https://api.hnpwa.com/v0/user/pg.json');
    });

    it('rejects on HTTP errors', async () => {
        mockFetch(() => new Error('boom'));
        await expect(fetchFeed('news', 1)).rejects.toThrow(/status 500/);
    });

    it('rejects when the API returns null', async () => {
        mockFetch(() => null);
        await expect(fetchItemContent(999)).rejects.toThrow(/no data/);
    });

    it('resolves poll options and totals their votes', async () => {
        mockFetch((url) => {
            if (url.endsWith('/item/100')) {
                return { id: 100, type: 'poll', poll: [{}, {}], comments: [] };
            }
            if (url.endsWith('/item/101')) return { points: 3, content: 'Yes' };
            if (url.endsWith('/item/102')) return { points: 7, content: 'No' };
            throw new Error(`unexpected ${url}`);
        });
        const story = await fetchItemContent(100);
        expect(story.poll).toEqual([
            { points: 3, content: 'Yes' },
            { points: 7, content: 'No' },
        ]);
        expect(story.poll_votes_count).toBe(10);
    });
});
