import type { Feed } from '../models/feed';
import type { PollResult } from '../models/poll-result';
import type { Story } from '../models/story';
import type { User } from '../models/user';

export const API_BASE_URL = 'https://node-hnapi.herokuapp.com';
// node-hnapi no longer serves /user/:id (404); HNPWA returns the same shape.
export const USER_API_BASE_URL = 'https://api.hnpwa.com/v0';

async function fetchJson<T>(url: string, signal?: AbortSignal): Promise<T> {
    const res = await fetch(url, { signal });
    if (!res.ok) {
        throw new Error(`Request to ${url} failed with status ${res.status}`);
    }
    const data = (await res.json()) as T | null;
    if (data === null) {
        throw new Error(`Request to ${url} returned no data`);
    }
    return data;
}

export function fetchFeed(feedType: Feed, page: number, signal?: AbortSignal): Promise<Story[]> {
    return fetchJson<Story[]>(`${API_BASE_URL}/${feedType}?page=${page}`, signal);
}

export function fetchPollContent(id: number, signal?: AbortSignal): Promise<PollResult> {
    return fetchJson<PollResult>(`${API_BASE_URL}/item/${id}`, signal);
}

export async function fetchItemContent(id: number, signal?: AbortSignal): Promise<Story> {
    const story = await fetchJson<Story>(`${API_BASE_URL}/item/${id}`, signal);
    if (story.type === 'poll' && story.poll) {
        // Poll options are stored as the items immediately following the poll.
        const results = await Promise.all(story.poll.map((_, i) => fetchPollContent(story.id + i + 1, signal)));
        story.poll = results;
        story.poll_votes_count = results.reduce((sum, r) => sum + r.points, 0);
    }
    return story;
}

export function fetchUser(id: string, signal?: AbortSignal): Promise<User> {
    return fetchJson<User>(`${USER_API_BASE_URL}/user/${encodeURIComponent(id)}.json`, signal);
}
