import { describe, expect, it } from 'vitest';
import { fetchFeed, fetchItemContent, fetchUser } from '../../src/api/hnApi';

describe('hnApi', () => {
  it('fetchFeed returns the feed list for a feedType/page', async () => {
    const items = await fetchFeed('news', 1);
    expect(items).toHaveLength(30);
    expect(items[0].id).toBe(1001);
    expect(items[0].title).toBe('News story 1');
  });

  it('fetchFeed reflects a different page', async () => {
    const items = await fetchFeed('news', 2);
    expect(items).toHaveLength(5);
    expect(items[0].id).toBe(1031);
  });

  it('fetchItemContent returns a story with comments', async () => {
    const item = await fetchItemContent(1001);
    expect(item.id).toBe(1001);
    expect(item.comments).toHaveLength(2);
    expect(item.comments[0].comments[0].content).toBe('<p>Nested reply</p>');
  });

  it('fetchItemContent expands poll options and sums poll_votes_count', async () => {
    const item = await fetchItemContent(300);
    expect(item.type).toBe('poll');
    expect(item.poll).toHaveLength(3);
    // points are overwritten by the individually-fetched option items
    expect(item.poll.map((p) => p.points)).toEqual([60, 40, 20]);
    expect(item.poll_votes_count).toBe(120);
  });

  it('fetchUser returns the user profile', async () => {
    const user = await fetchUser('user1');
    expect(user.id).toBe('user1');
    expect(user.karma).toBe(1234);
  });
});
