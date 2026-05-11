import type { Story } from '../types/story';
import type { User } from '../types/user';
import type { PollResult } from '../types/poll-result';

export const HN_API_BASE_URL = 'https://node-hnapi.herokuapp.com';

async function fetchJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  const res = await fetch(url, { signal });
  if (!res.ok) {
    throw new Error(`Request failed (${res.status}): ${url}`);
  }
  return (await res.json()) as T;
}

export function fetchFeed(
  feedType: string,
  page: number,
  signal?: AbortSignal
): Promise<Story[]> {
  return fetchJson<Story[]>(`${HN_API_BASE_URL}/${feedType}?page=${page}`, signal);
}

export function fetchPollContent(
  id: number,
  signal?: AbortSignal
): Promise<PollResult> {
  return fetchJson<PollResult>(`${HN_API_BASE_URL}/item/${id}`, signal);
}

export async function fetchItem(
  id: number,
  signal?: AbortSignal
): Promise<Story> {
  const story = await fetchJson<Story>(`${HN_API_BASE_URL}/item/${id}`, signal);

  if (story.type === 'poll' && story.poll && story.poll.length > 0) {
    const numberOfPollOptions = story.poll.length;
    let totalVotes = 0;
    const filledPoll: PollResult[] = [];

    for (let i = 1; i <= numberOfPollOptions; i++) {
      const pollResults = await fetchPollContent(story.id + i, signal);
      filledPoll[i - 1] = pollResults;
      totalVotes += pollResults.points;
    }

    story.poll = filledPoll;
    story.poll_votes_count = totalVotes;
  }

  return story;
}

export function fetchUser(id: string, signal?: AbortSignal): Promise<User> {
  return fetchJson<User>(`${HN_API_BASE_URL}/user/${id}`, signal);
}
