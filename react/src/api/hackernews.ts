// Port of src/app/shared/services/hackernews-api.service.ts.
import type { FeedType, HackerNewsApi, PollResult, Story, User } from './types';

export const API_BASE_URL = 'https://node-hnapi.herokuapp.com';

async function getJson<T>(path: string, signal?: AbortSignal): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, { signal });
  if (!res.ok) throw new Error(`HN API ${path} responded ${res.status}`);
  return (await res.json()) as T;
}

function fetchPollContent(id: number, signal?: AbortSignal): Promise<PollResult> {
  return getJson<PollResult>(`/item/${id}`, signal);
}

/** Poll options are the items `id+1 … id+poll.length`; replaces each option and totals their points. */
async function aggregatePoll(story: Story, signal?: AbortSignal): Promise<Story> {
  const poll = story.poll ?? [];
  story.poll_votes_count = 0;
  await Promise.allSettled(
    poll.map(async (_, index) => {
      const pollResults = await fetchPollContent(story.id + index + 1, signal);
      poll[index] = pollResults;
      story.poll_votes_count = (story.poll_votes_count ?? 0) + pollResults.points;
    }),
  );
  signal?.throwIfAborted();
  return story;
}

export const hackerNewsApi: HackerNewsApi = {
  fetchFeed: (feedType: FeedType, page: number, signal?: AbortSignal) =>
    getJson<Story[]>(`/${feedType}?page=${page}`, signal),

  fetchItemContent: async (id: number, signal?: AbortSignal) => {
    const story = await getJson<Story>(`/item/${id}`, signal);
    return story.type === 'poll' ? aggregatePoll(story, signal) : story;
  },

  fetchPollContent,

  fetchUser: (id: string, signal?: AbortSignal) => getJson<User>(`/user/${id}`, signal),
};
