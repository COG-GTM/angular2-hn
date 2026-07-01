import { Story } from '../models/story';
import { User } from '../models/user';
import { PollResult } from '../models/poll-result';

const baseUrl = 'https://node-hnapi.herokuapp.com';

async function getJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  const res = await fetch(url, { signal });
  return res.json() as Promise<T>;
}

export async function fetchFeed(
  feedType: string,
  page: number,
  signal?: AbortSignal
): Promise<Story[]> {
  return getJson<Story[]>(`${baseUrl}/${feedType}?page=${page}`, signal);
}

export async function fetchPollContent(
  id: number,
  signal?: AbortSignal
): Promise<PollResult> {
  return getJson<PollResult>(`${baseUrl}/item/${id}`, signal);
}

export async function fetchItemContent(
  id: number,
  signal?: AbortSignal
): Promise<Story> {
  const story = await getJson<Story>(`${baseUrl}/item/${id}`, signal);

  if (story.type === 'poll' && story.poll) {
    const numberOfPollOptions = story.poll.length;
    const pollResults = await Promise.all(
      Array.from({ length: numberOfPollOptions }, (_, i) =>
        fetchPollContent(story.id + i + 1, signal)
      )
    );

    story.poll_votes_count = 0;
    pollResults.forEach((pollResult, index) => {
      story.poll[index] = pollResult;
      story.poll_votes_count += pollResult.points;
    });
  }

  return story;
}

export async function fetchUser(
  id: string,
  signal?: AbortSignal
): Promise<User> {
  return getJson<User>(`${baseUrl}/user/${id}`, signal);
}
