import type { Story } from '../models/story';
import type { User } from '../models/user';
import type { PollResult } from '../models/poll-result';

export const BASE_URL = 'https://node-hnapi.herokuapp.com';
// node-hnapi no longer serves /user/:id, so user lookups fall back to the HNPWA API (same response shape).
export const USER_FALLBACK_URL = 'https://api.hnpwa.com/v0';

export class HttpError extends Error {
    constructor(
        readonly status: number,
        readonly url: string
    ) {
        super(`Request to ${url} failed with status ${status}`);
        this.name = 'HttpError';
    }
}

async function lazyFetch<T>(url: string, signal?: AbortSignal): Promise<T> {
    const res = await fetch(url, { signal });
    if (!res.ok) {
        throw new HttpError(res.status, url);
    }
    return (await res.json()) as T;
}

export function fetchFeed(feedType: string, page: number, signal?: AbortSignal): Promise<Story[]> {
    return lazyFetch<Story[]>(`${BASE_URL}/${feedType}?page=${page}`, signal);
}

export async function fetchItemContent(id: number, signal?: AbortSignal): Promise<Story> {
    const story = await lazyFetch<Story>(`${BASE_URL}/item/${id}`, signal);
    if (story.type === 'poll') {
        const numberOfPollOptions = story.poll.length;
        // Reject if any option fails so a partial vote total is never cached as a successful result.
        story.poll = await Promise.all(
            Array.from({ length: numberOfPollOptions }, (_, i) => fetchPollContent(story.id + i + 1, signal))
        );
        story.poll_votes_count = story.poll.reduce((total, pollResult) => total + pollResult.points, 0);
    }
    return story;
}

export function fetchPollContent(id: number, signal?: AbortSignal): Promise<PollResult> {
    return lazyFetch<PollResult>(`${BASE_URL}/item/${id}`, signal);
}

export async function fetchUser(id: string, signal?: AbortSignal): Promise<User> {
    try {
        return await lazyFetch<User>(`${BASE_URL}/user/${id}`, signal);
    } catch (error) {
        if (!(error instanceof HttpError && error.status === 404)) {
            throw error;
        }
        const user = await lazyFetch<User | null>(`${USER_FALLBACK_URL}/user/${id}.json`, signal);
        if (!user) {
            throw new Error(`User ${id} not found`);
        }
        return user;
    }
}
