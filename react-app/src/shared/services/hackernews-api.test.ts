import { mockFetch } from '../../test/utils';
import { makeStory } from '../../test/fixtures';
import { ApiError, fetchFeed, fetchItemContent, fetchUser } from './hackernews-api';

describe('hackernews-api', () => {
    it('fetchFeed hits the Angular endpoint', async () => {
        const fetchMock = mockFetch({ '/news?page=2': [makeStory()] });
        const stories = await fetchFeed('news', 2);
        expect(stories).toHaveLength(1);
        expect(fetchMock.mock.calls[0][0]).toBe('https://node-hnapi.herokuapp.com/news?page=2');
    });

    it('fetchItemContent resolves poll options and totals votes', async () => {
        mockFetch({
            '/item/10': makeStory({
                id: 10,
                type: 'poll',
                poll: [
                    { points: 0, content: '' },
                    { points: 0, content: '' },
                ],
            }),
            '/item/11': { points: 3, content: 'A' },
            '/item/12': { points: 5, content: 'B' },
        });
        const story = await fetchItemContent(10);
        expect(story.poll).toEqual([
            { points: 3, content: 'A' },
            { points: 5, content: 'B' },
        ]);
        expect(story.poll_votes_count).toBe(8);
    });

    it('fetchItemContent keeps the poll when an option fails', async () => {
        mockFetch({
            '/item/10': makeStory({
                id: 10,
                type: 'poll',
                poll: [
                    { points: 0, content: '' },
                    { points: 0, content: '' },
                ],
            }),
            '/item/11': { points: 3, content: 'A' },
            '/item/12': { status: 503, body: {} },
        });
        const story = await fetchItemContent(10);
        expect(story.id).toBe(10);
        expect(story.poll).toEqual([{ points: 3, content: 'A' }]);
        expect(story.poll_votes_count).toBe(3);
    });

    it('fetchUser uses HNPWA and treats null / non-JSON bodies as errors', async () => {
        const fetchMock = mockFetch({ '/user/pg.json': { id: 'pg', karma: 1 } });
        await expect(fetchUser('pg')).resolves.toMatchObject({ id: 'pg' });
        expect(fetchMock.mock.calls[0][0]).toBe('https://api.hnpwa.com/v0/user/pg.json');

        mockFetch({ '/user/nobody.json': null });
        await expect(fetchUser('nobody')).rejects.toBeInstanceOf(ApiError);

        mockFetch({ '/user/broken.json': "Cannot read property 'apply' of undefined" });
        await expect(fetchUser('broken')).rejects.toBeInstanceOf(ApiError);
    });

    it('rejects on HTTP errors', async () => {
        mockFetch({ '/item/1': { status: 500, body: {} } });
        await expect(fetchItemContent(1)).rejects.toMatchObject({ status: 500 });
    });
});
