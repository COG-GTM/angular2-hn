import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchFrontPageForDate, mapHitToStory, type AlgoliaHit } from './algolia';

function makeHit(overrides: Partial<AlgoliaHit> = {}): AlgoliaHit {
    return {
        objectID: '123',
        title: 'A story',
        url: 'https://www.example.com/post',
        points: 100,
        author: 'pg',
        num_comments: 42,
        created_at_i: 1600000000,
        ...overrides,
    };
}

function jsonResponse(data: unknown): Response {
    return {
        ok: true,
        status: 200,
        json: () => Promise.resolve(data),
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

describe('mapHitToStory', () => {
    it('maps Algolia hit fields onto the Story model', () => {
        const story = mapHitToStory(makeHit());

        expect(story.id).toBe(123);
        expect(story.title).toBe('A story');
        expect(story.points).toBe(100);
        expect(story.user).toBe('pg');
        expect(story.time).toBe(1600000000);
        expect(story.url).toBe('https://www.example.com/post');
        expect(story.domain).toBe('example.com');
        expect(story.comments_count).toBe(42);
        expect(story.type).toBe('story');
    });

    it('handles hits without a url', () => {
        const story = mapHitToStory(makeHit({ url: null }));

        expect(story.url).toBe('');
        expect(story.domain).toBe('');
    });
});

describe('fetchFrontPageForDate', () => {
    it('queries Algolia with a created_at_i range covering the whole day', async () => {
        fetchMock.mockResolvedValueOnce(jsonResponse({ hits: [] }));

        const date = new Date(2020, 5, 15);
        await fetchFrontPageForDate(date);

        const url = new URL(fetchMock.mock.calls[0][0] as string);
        expect(url.origin + url.pathname).toBe('https://hn.algolia.com/api/v1/search');
        expect(url.searchParams.get('tags')).toBe('story');
        const start = Math.floor(date.getTime() / 1000);
        expect(url.searchParams.get('numericFilters')).toBe(
            `created_at_i>=${start},created_at_i<${start + 86400}`
        );
    });

    it('returns stories sorted by points descending', async () => {
        fetchMock.mockResolvedValueOnce(
            jsonResponse({
                hits: [
                    makeHit({ objectID: '1', points: 10 }),
                    makeHit({ objectID: '2', points: 300 }),
                    makeHit({ objectID: '3', points: 50 }),
                ],
            })
        );

        const stories = await fetchFrontPageForDate(new Date(2020, 0, 1));

        expect(stories.map((s) => s.id)).toEqual([2, 3, 1]);
    });

    it('throws on non-ok responses', async () => {
        fetchMock.mockResolvedValueOnce({ ok: false, status: 503 } as Response);

        await expect(fetchFrontPageForDate(new Date())).rejects.toThrow('503');
    });
});
