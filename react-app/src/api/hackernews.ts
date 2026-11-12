import type { FeedType, PollResult, Story, User } from '../models';

export const API_BASE_URL = 'https://node-hnapi.herokuapp.com';
// node-hnapi's /user endpoint returns 404; HNPWA serves the same user shape.
export const USER_FALLBACK_BASE_URL = 'https://api.hnpwa.com/v0';

export const FEED_PAGE_SIZE = 30;

export class HttpError extends Error {
    constructor(
        public readonly status: number,
        url: string
    ) {
        super(`Request to ${url} failed with status ${status}`);
        this.name = 'HttpError';
    }
}

async function getJson<T>(url: string, signal?: AbortSignal): Promise<T> {
    const res = await fetch(url, { signal });
    if (!res.ok) {
        throw new HttpError(res.status, url);
    }
    return (await res.json()) as T;
}

export function fetchFeed(feedType: FeedType, page: number, signal?: AbortSignal): Promise<Story[]> {
    return getJson<Story[]>(`${API_BASE_URL}/${feedType}?page=${page}`, signal);
}

export function fetchPollContent(id: number, signal?: AbortSignal): Promise<PollResult> {
    return getJson<PollResult>(`${API_BASE_URL}/item/${id}`, signal);
}

export async function fetchItemContent(id: number, signal?: AbortSignal): Promise<Story> {
    const story = await getJson<Story>(`${API_BASE_URL}/item/${id}`, signal);
    if (story.type === 'poll' && story.poll) {
        const poll = await Promise.all(story.poll.map((_, i) => fetchPollContent(story.id + i + 1, signal)));
        return {
            ...story,
            poll,
            poll_votes_count: poll.reduce((total, result) => total + result.points, 0),
        };
    }
    return story;
}

export async function fetchUser(id: string, signal?: AbortSignal): Promise<User> {
    const encoded = encodeURIComponent(id);
    try {
        return await getJson<User>(`${API_BASE_URL}/user/${encoded}`, signal);
    } catch (err) {
        if (signal?.aborted) {
            throw err;
        }
        return getJson<User>(`${USER_FALLBACK_BASE_URL}/user/${encoded}.json`, signal);
    }
}
