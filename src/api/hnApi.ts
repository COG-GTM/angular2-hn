import type { FeedName, PollResult, Story, User } from '../models';

export const HN_API_BASE_URL = 'https://api.hnpwa.com/v0';

export class HnApiError extends Error {
    constructor(
        message: string,
        public readonly status?: number
    ) {
        super(message);
        this.name = 'HnApiError';
    }
}

async function getJson<T>(path: string, signal?: AbortSignal): Promise<T> {
    const res = await fetch(`${HN_API_BASE_URL}${path}`, { signal });
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

export async function fetchItemContent(id: number, signal?: AbortSignal): Promise<Story> {
    const story = await getJson<Story>(`/item/${id}.json`, signal);
    if (story.type === 'poll' && Array.isArray(story.poll)) {
        const results = await Promise.all(story.poll.map((_, i) => fetchPollContent(story.id + i + 1, signal)));
        story.poll = results;
        story.poll_votes_count = results.reduce((sum, result) => sum + (result.points ?? 0), 0);
    }
    return story;
}

export function fetchUser(id: string, signal?: AbortSignal): Promise<User> {
    return getJson<User>(`/user/${encodeURIComponent(id)}.json`, signal);
}
