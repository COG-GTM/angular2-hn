import type { Feed, PollResult, Story, User } from '../models';

// Same backend as the Angular HackerNewsAPIService. node-hnapi has no working /user endpoint
// (404 for every user), so user profiles come from the HNPWA API, which serves the same shape.
export const API_BASE_URL = 'https://node-hnapi.herokuapp.com';
export const USER_API_BASE_URL = 'https://api.hnpwa.com/v0';

export class ApiError extends Error {
    readonly status?: number;

    constructor(message: string, status?: number) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
    }
}

async function fetchJson<T>(url: string, signal?: AbortSignal): Promise<T> {
    const res = await fetch(url, { signal });
    if (!res.ok) {
        throw new ApiError(`Request failed with status ${res.status}: ${url}`, res.status);
    }
    let data: unknown;
    try {
        data = await res.json();
    } catch {
        throw new ApiError(`Invalid JSON response: ${url}`, res.status);
    }
    if (data === null || data === undefined) {
        throw new ApiError(`Empty response: ${url}`, 404);
    }
    return data as T;
}

export function fetchFeed(feedType: Feed, page: number, signal?: AbortSignal): Promise<Story[]> {
    return fetchJson<Story[]>(`${API_BASE_URL}/${feedType}?page=${page}`, signal);
}

export function fetchPollContent(id: number, signal?: AbortSignal): Promise<PollResult> {
    return fetchJson<PollResult>(`${API_BASE_URL}/item/${id}`, signal);
}

export async function fetchItemContent(id: number, signal?: AbortSignal): Promise<Story> {
    const story = await fetchJson<Story>(`${API_BASE_URL}/item/${id}`, signal);
    if (story.type === 'poll') {
        // Poll options are the items that directly follow the poll's id.
        const options = story.poll ?? [];
        // A failed option must not hide the story itself; keep the options that loaded.
        const settled = await Promise.allSettled(options.map((_, i) => fetchPollContent(story.id + i + 1, signal)));
        signal?.throwIfAborted();
        const results = settled.flatMap((r) => (r.status === 'fulfilled' ? [r.value] : []));
        story.poll = results;
        story.poll_votes_count = results.reduce((sum, result) => sum + result.points, 0);
    }
    return story;
}

export function fetchUser(id: string, signal?: AbortSignal): Promise<User> {
    return fetchJson<User>(`${USER_API_BASE_URL}/user/${encodeURIComponent(id)}.json`, signal);
}
