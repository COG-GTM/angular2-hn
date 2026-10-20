import type { FeedType, PollResult, Story, User } from '../models';

/**
 * Plain async port of the Angular `HackerNewsAPIService`.
 * The Observable `lazyFetch` + cancel-token pattern is replaced by `AbortSignal`,
 * which TanStack Query passes in automatically when a query is cancelled.
 */
export const HN_API_BASE_URL = import.meta.env.VITE_HN_API_BASE_URL ?? 'https://node-hnapi.herokuapp.com';

export class HttpError extends Error {
    constructor(
        public readonly status: number,
        public readonly url: string
    ) {
        super(`Request to ${url} failed with status ${status}`);
        this.name = 'HttpError';
    }
}

async function fetchJson<T>(path: string, signal?: AbortSignal): Promise<T> {
    const url = `${HN_API_BASE_URL}${path}`;
    const res = await fetch(url, { signal });
    if (!res.ok) {
        throw new HttpError(res.status, url);
    }
    return (await res.json()) as T;
}

export function fetchFeed(feedType: FeedType, page: number, signal?: AbortSignal): Promise<Story[]> {
    return fetchJson<Story[]>(`/${feedType}?page=${page}`, signal);
}

export function fetchPollContent(id: number, signal?: AbortSignal): Promise<PollResult> {
    return fetchJson<PollResult>(`/item/${id}`, signal);
}

/**
 * Fetches a story with its comment tree. For polls the Angular service mutated the
 * story in place as each poll-option request resolved; here we wait for every option
 * with `Promise.all` and return a fully populated story.
 */
export async function fetchItemContent(id: number, signal?: AbortSignal): Promise<Story> {
    const story = await fetchJson<Story>(`/item/${id}`, signal);
    if (story.type === 'poll' && Array.isArray(story.poll)) {
        const options = await Promise.all(
            story.poll.map((_option, index) => fetchPollContent(story.id + index + 1, signal))
        );
        return {
            ...story,
            poll: options,
            poll_votes_count: options.reduce((total, option) => total + (option.points ?? 0), 0),
        };
    }
    return story;
}

export function fetchUser(id: string, signal?: AbortSignal): Promise<User> {
    return fetchJson<User>(`/user/${encodeURIComponent(id)}`, signal);
}
