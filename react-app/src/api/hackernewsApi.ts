import type { FeedType, PollResult, Story, User } from '../models';

const baseUrl = 'https://node-hnapi.herokuapp.com';

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export function fetchFeed(feedType: FeedType, page: number): Promise<Story[]> {
  return fetchJson<Story[]>(`${baseUrl}/${feedType}?page=${page}`);
}

export async function fetchItemContent(id: number): Promise<Story> {
  const story = await fetchJson<Story>(`${baseUrl}/item/${id}`);
  if (story.type === 'poll') {
    const numberOfPollOptions = story.poll.length;
    story.poll_votes_count = 0;
    await Promise.all(
      Array.from({ length: numberOfPollOptions }, (_, index) =>
        fetchPollContent(story.id + index + 1).then((pollResults) => {
          story.poll[index] = pollResults;
          story.poll_votes_count += pollResults.points;
        })
      )
    );
  }
  return story;
}

export function fetchPollContent(id: number): Promise<PollResult> {
  return fetchJson<PollResult>(`${baseUrl}/item/${id}`);
}

export function fetchUser(id: string): Promise<User> {
  return fetchJson<User>(`${baseUrl}/user/${id}`);
}
