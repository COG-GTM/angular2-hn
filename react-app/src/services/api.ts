import type { Story } from '../models/story';
import type { User } from '../models/user';
import type { PollResult } from '../models/poll-result';

const BASE_URL = 'https://node-hnapi.herokuapp.com';

async function fetchJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  const res = await fetch(url, { signal });
  if (!res.ok) {
    throw new Error(`HTTP error: ${res.status}`);
  }
  return res.json();
}

export async function fetchFeed(
  feedType: string,
  page: number,
  signal?: AbortSignal
): Promise<Story[]> {
  return fetchJson<Story[]>(`${BASE_URL}/${feedType}?page=${page}`, signal);
}

export async function fetchItemContent(
  id: number,
  signal?: AbortSignal
): Promise<Story> {
  const story = await fetchJson<Story>(`${BASE_URL}/item/${id}`, signal);

  if (story.type === 'poll' && story.poll && story.poll.length > 0) {
    const numberOfPollOptions = story.poll.length;
    story.poll_votes_count = 0;

    const pollPromises = [];
    for (let i = 1; i <= numberOfPollOptions; i++) {
      pollPromises.push(fetchPollContent(story.id + i, signal));
    }

    const pollResults = await Promise.all(pollPromises);
    pollResults.forEach((result, index) => {
      story.poll[index] = result;
      story.poll_votes_count += result.points;
    });
  }

  return story;
}

export async function fetchPollContent(
  id: number,
  signal?: AbortSignal
): Promise<PollResult> {
  return fetchJson<PollResult>(`${BASE_URL}/item/${id}`, signal);
}

export async function fetchUser(
  id: string,
  signal?: AbortSignal
): Promise<User> {
  return fetchJson<User>(`${BASE_URL}/user/${id}`, signal);
}
