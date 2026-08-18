import { http, HttpResponse } from 'msw';
import { baseUrl, fetchFeed, fetchItemContent, fetchPollContent, fetchUser } from './hackerNewsApi';
import { server } from '../test/server';
import { mockFeed, mockPollStory, mockStory, mockUser } from '../test/fixtures';

describe('hackerNewsApi', () => {
    it('fetches a feed for the given type and page', async () => {
        let requestedUrl = '';
        server.use(
            http.get(`${baseUrl}/news`, ({ request }) => {
                requestedUrl = request.url;
                return HttpResponse.json(mockFeed);
            })
        );

        const stories = await fetchFeed('news', 2);

        expect(requestedUrl).toBe(`${baseUrl}/news?page=2`);
        expect(stories).toHaveLength(3);
        expect(stories[0].title).toBe(mockStory.title);
    });

    it('fetches item content', async () => {
        server.use(http.get(`${baseUrl}/item/:id`, () => HttpResponse.json(mockStory)));

        const item = await fetchItemContent(mockStory.id);

        expect(item.id).toBe(mockStory.id);
        expect(item.poll_votes_count).toBeUndefined();
    });

    it('aggregates poll options and votes for poll items', async () => {
        const pollOptions: Record<string, { content: string; points: number }> = {
            '301': { content: 'Option A', points: 7 },
            '302': { content: 'Option B', points: 3 },
        };
        server.use(
            http.get(`${baseUrl}/item/:id`, ({ params }) => {
                const id = String(params.id);
                return HttpResponse.json(id === '300' ? mockPollStory : pollOptions[id]);
            })
        );

        const item = await fetchItemContent(mockPollStory.id);

        expect(item.poll).toEqual([
            { content: 'Option A', points: 7 },
            { content: 'Option B', points: 3 },
        ]);
        expect(item.poll_votes_count).toBe(10);
    });

    it('fetches a poll option', async () => {
        server.use(http.get(`${baseUrl}/item/301`, () => HttpResponse.json({ content: 'Option A', points: 7 })));

        await expect(fetchPollContent(301)).resolves.toEqual({ content: 'Option A', points: 7 });
    });

    it('fetches a user', async () => {
        server.use(http.get(`${baseUrl}/user/author`, () => HttpResponse.json(mockUser)));

        await expect(fetchUser('author')).resolves.toEqual(mockUser);
    });

    it('rejects when the API responds with an error status', async () => {
        server.use(http.get(`${baseUrl}/user/nobody`, () => new HttpResponse(null, { status: 404 })));

        await expect(fetchUser('nobody')).rejects.toThrow('Request failed with status 404');
    });
});
