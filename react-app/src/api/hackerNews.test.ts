import { fetchFeed, fetchItemContent, fetchUser } from './hackerNews';

const baseUrl = 'https://node-hnapi.herokuapp.com';

function mockJsonResponse(data: unknown) {
  return Promise.resolve({ json: () => Promise.resolve(data) } as Response);
}

afterEach(() => {
  jest.resetAllMocks();
});

describe('fetchFeed', () => {
  it('builds the correct URL and returns parsed stories', async () => {
    const stories = [
      { id: 1, title: 'first' },
      { id: 2, title: 'second' },
    ];
    const mockFetch = jest.fn().mockReturnValue(mockJsonResponse(stories));
    global.fetch = mockFetch as unknown as typeof fetch;

    const result = await fetchFeed('news', 2);

    expect(mockFetch).toHaveBeenCalledWith(`${baseUrl}/news?page=2`, {
      signal: undefined,
    });
    expect(result).toEqual(stories);
  });
});

describe('fetchItemContent', () => {
  it('accumulates poll_votes_count and populates poll for a poll item', async () => {
    const pollStory = { id: 100, type: 'poll', poll: [{}, {}], poll_votes_count: 0 };
    const optionOne = { points: 10, content: 'Option one' };
    const optionTwo = { points: 5, content: 'Option two' };

    const mockFetch = jest.fn((url: string) => {
      if (url === `${baseUrl}/item/100`) {
        return mockJsonResponse({ ...pollStory, poll: [{}, {}] });
      }
      if (url === `${baseUrl}/item/101`) {
        return mockJsonResponse(optionOne);
      }
      if (url === `${baseUrl}/item/102`) {
        return mockJsonResponse(optionTwo);
      }
      return Promise.reject(new Error(`Unexpected URL: ${url}`));
    });
    global.fetch = mockFetch as unknown as typeof fetch;

    const result = await fetchItemContent(100);

    expect(result.poll_votes_count).toBe(15);
    expect(result.poll).toEqual([optionOne, optionTwo]);
    expect(mockFetch).toHaveBeenCalledWith(`${baseUrl}/item/101`, {
      signal: undefined,
    });
    expect(mockFetch).toHaveBeenCalledWith(`${baseUrl}/item/102`, {
      signal: undefined,
    });
  });

  it('does not fetch poll options for a non-poll item', async () => {
    const story = { id: 42, type: 'story', title: 'A story' };
    const mockFetch = jest.fn().mockReturnValue(mockJsonResponse(story));
    global.fetch = mockFetch as unknown as typeof fetch;

    const result = await fetchItemContent(42);

    expect(result).toEqual(story);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });
});

describe('fetchUser', () => {
  it('builds the correct URL and returns the parsed user', async () => {
    const user = { id: 'pg', karma: 155000 };
    const mockFetch = jest.fn().mockReturnValue(mockJsonResponse(user));
    global.fetch = mockFetch as unknown as typeof fetch;

    const result = await fetchUser('pg');

    expect(mockFetch).toHaveBeenCalledWith(`${baseUrl}/user/pg`, {
      signal: undefined,
    });
    expect(result).toEqual(user);
  });
});
