import type { FeedName, PollResult, Story, User } from '../models';

export const HN_API_BASE_URL = 'https://api.hnpwa.com/v0';
export const HN_FIREBASE_API_BASE_URL = 'https://hacker-news.firebaseio.com/v0';

export class HnApiError extends Error {
    constructor(
        message: string,
        public readonly status?: number
    ) {
        super(message);
        this.name = 'HnApiError';
    }
}

async function getJson<T>(path: string, signal?: AbortSignal, baseUrl = HN_API_BASE_URL): Promise<T> {
    const res = await fetch(`${baseUrl}${path}`, { signal });
    if (!res.ok) {
        throw new HnApiError(`Request to ${path} failed with status ${res.status}`, res.status);
    }
    const data = (await res.json()) as T | null;
    if (data === null) {
        throw new HnApiError(`No data returned for ${path}`, res.status);
    }
    return data;
}

export function fetchFeed(feedType: FeedName, page: number, signal?: AbortSignal): Promise<Story[]> {
    return getJson<Story[]>(`/${feedType}/${page}.json`, signal);
}

export function fetchPollContent(id: number, signal?: AbortSignal): Promise<PollResult> {
    return getJson<PollResult>(`/item/${id}.json`, signal);
}

// api.hnpwa.com omits the poll option list, so read the option ids from the official HN API.
async function fetchPollOptionIds(story: Story, signal?: AbortSignal): Promise<number[]> {
    if (Array.isArray(story.poll)) {
        return story.poll.map((_, i) => story.id + i + 1);
    }
    const { parts } = await getJson<{ parts?: number[] }>(`/item/${story.id}.json`, signal, HN_FIREBASE_API_BASE_URL);
    return parts ?? [];
}

export async function fetchItemContent(id: number, signal?: AbortSignal): Promise<Story> {
    const story = await getJson<Story>(`/item/${id}.json`, signal);
    if (story.type === 'poll') {
        const optionIds = await fetchPollOptionIds(story, signal);
        const results = await Promise.all(optionIds.map((optionId) => fetchPollContent(optionId, signal)));
        story.poll = results;
        story.poll_votes_count = results.reduce((sum, result) => sum + (result.points ?? 0), 0);
    }
    return story;
}

export function fetchUser(id: string, signal?: AbortSignal): Promise<User> {
    return getJson<User>(`/user/${encodeURIComponent(id)}.json`, signal);
}
