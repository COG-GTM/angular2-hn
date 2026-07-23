import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { server } from '../test/mocks/server';
import {
  BASE_URL,
  fetchFeed,
  fetchItemContent,
  fetchPollContent,
  fetchUser,
} from './hackerNewsApi';
import type { Story } from '../types/story';

describe('hackerNewsApi', () => {
  describe('fetchFeed', () => {
    it('requests /{feedType}?page={page} and returns the story list', async () => {
      let requestedUrl = '';
      server.use(
        http.get(`${BASE_URL}/news`, ({ request }) => {
          requestedUrl = request.url;
          return HttpResponse.json([{ id: 1, title: 'Hello' }]);
        })
      );

      const stories = await fetchFeed('news', 2);

      const url = new URL(requestedUrl);
      expect(url.pathname).toBe('/news');
      expect(url.searchParams.get('page')).toBe('2');
      expect(stories).toHaveLength(1);
      expect(stories[0].title).toBe('Hello');
    });

    it('supports other feed types', async () => {
      server.use(
        http.get(`${BASE_URL}/ask`, () => HttpResponse.json([]))
      );
      await expect(fetchFeed('ask', 1)).resolves.toEqual([]);
    });

    it('propagates errors on non-ok responses', async () => {
      server.use(
        http.get(`${BASE_URL}/news`, () => new HttpResponse(null, { status: 500 }))
      );
      await expect(fetchFeed('news', 1)).rejects.toThrow(/status 500/);
    });
  });

  describe('fetchItemContent', () => {
    it('returns a non-poll story unchanged', async () => {
      const story: Partial<Story> = { id: 42, type: 'story', title: 'A story' };
      server.use(
        http.get(`${BASE_URL}/item/42`, () => HttpResponse.json(story))
      );

      const result = await fetchItemContent(42);
      expect(result.id).toBe(42);
      expect(result.title).toBe('A story');
    });

    it('aggregates poll option votes into poll_votes_count', async () => {
      const pollStory: Partial<Story> = {
        id: 100,
        type: 'poll',
        title: 'Best language?',
        poll: [
          { points: 0, content: 'A' },
          { points: 0, content: 'B' },
          { points: 0, content: 'C' },
        ],
      };
      const optionPoints: Record<number, number> = { 101: 5, 102: 10, 103: 2 };

      server.use(
        http.get(`${BASE_URL}/item/100`, () => HttpResponse.json(pollStory)),
        http.get(`${BASE_URL}/item/:id`, ({ params }) => {
          const id = Number(params.id);
          return HttpResponse.json({ points: optionPoints[id], content: `opt-${id}` });
        })
      );

      const result = await fetchItemContent(100);

      expect(result.poll_votes_count).toBe(17);
      expect(result.poll).toEqual([
        { points: 5, content: 'opt-101' },
        { points: 10, content: 'opt-102' },
        { points: 2, content: 'opt-103' },
      ]);
    });

    it('propagates errors from the item request', async () => {
      server.use(
        http.get(`${BASE_URL}/item/7`, () => new HttpResponse(null, { status: 404 }))
      );
      await expect(fetchItemContent(7)).rejects.toThrow(/status 404/);
    });
  });

  describe('fetchPollContent', () => {
    it('requests /item/{id} and returns a poll result', async () => {
      server.use(
        http.get(`${BASE_URL}/item/55`, () =>
          HttpResponse.json({ points: 9, content: 'choice' })
        )
      );
      await expect(fetchPollContent(55)).resolves.toEqual({ points: 9, content: 'choice' });
    });
  });

  describe('fetchUser', () => {
    it('requests /user/{id} and returns the user', async () => {
      let requestedUrl = '';
      server.use(
        http.get(`${BASE_URL}/user/pg`, ({ request }) => {
          requestedUrl = request.url;
          return HttpResponse.json({ id: 'pg', karma: 12345, created: 'long ago' });
        })
      );

      const user = await fetchUser('pg');
      expect(new URL(requestedUrl).pathname).toBe('/user/pg');
      expect(user.id).toBe('pg');
      expect(user.karma).toBe(12345);
    });

    it('propagates errors on non-ok responses', async () => {
      server.use(
        http.get(`${BASE_URL}/user/ghost`, () => new HttpResponse(null, { status: 404 }))
      );
      await expect(fetchUser('ghost')).rejects.toThrow(/status 404/);
    });
  });
});
