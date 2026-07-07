import { Story } from '../models/story';
import { User } from '../models/user';
import { PollResult } from '../models/poll-result';

const baseUrl = 'https://node-hnapi.herokuapp.com';

async function fetchJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  const res = await fetch(url, { signal });
  if (!res.ok) {
    throw new Error(`Request failed with status ${res.status}`);
  }
  return (await res.json()) as T;
}

export function fetchFeed(feedType: string, page: number, signal?: AbortSignal): Promise<Story[]> {
  return fetchJson<Story[]>(`${baseUrl}/${feedType}?page=${page}`, signal);
}

export async function fetchItemContent(id: number, signal?: AbortSignal): Promise<Story> {
  const story = await fetchJson<Story>(`${baseUrl}/item/${id}`, signal);

  if (story.type === 'poll' && story.poll) {
    const numberOfPollOptions = story.poll.length;
    const pollRequests: Promise<PollResult>[] = [];
    for (let i = 1; i <= numberOfPollOptions; i++) {
      pollRequests.push(fetchPollContent(story.id + i, signal));
    }

    const pollResults = await Promise.all(pollRequests);
    story.poll = pollResults;
    story.poll_votes_count = pollResults.reduce((total, result) => total + result.points, 0);
  }

  return story;
}

export function fetchPollContent(id: number, signal?: AbortSignal): Promise<PollResult> {
  return fetchJson<PollResult>(`${baseUrl}/item/${id}`, signal);
}

export function fetchUser(id: string, signal?: AbortSignal): Promise<User> {
  return fetchJson<User>(`${baseUrl}/user/${id}`, signal);
}
