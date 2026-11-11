import type { FeedType, PollResult, Story, User } from '../models';

export const HN_API_BASE_URL = 'https://node-hnapi.herokuapp.com';
// node-hnapi no longer serves /user/:id (404), so profiles come from HNPWA, which returns the same shape.
export const HN_USER_API_BASE_URL = 'https://api.hnpwa.com/v0';

async function getJson<T>(url: string, signal?: AbortSignal): Promise<T> {
    const res = await fetch(url, { signal });
    if (!res.ok) {
        throw new Error(`Request failed (${res.status}): ${url}`);
    }
    return (await res.json()) as T;
}

export function fetchFeed(feedType: FeedType, page: number, signal?: AbortSignal): Promise<Story[]> {
    return getJson<Story[]>(`${HN_API_BASE_URL}/${feedType}?page=${page}`, signal);
}

export function fetchPollContent(id: number, signal?: AbortSignal): Promise<PollResult> {
    return getJson<PollResult>(`${HN_API_BASE_URL}/item/${id}`, signal);
}

export async function fetchItemContent(id: number, signal?: AbortSignal): Promise<Story> {
    const story = await getJson<Story>(`${HN_API_BASE_URL}/item/${id}`, signal);
    if (story.type === 'poll' && story.poll) {
        const results = await Promise.all(story.poll.map((_, i) => fetchPollContent(story.id + i + 1, signal)));
        story.poll = results;
        story.poll_votes_count = results.reduce((sum, r) => sum + r.points, 0);
    }
    return story;
}

export function fetchUser(id: string, signal?: AbortSignal): Promise<User> {
    return getJson<User>(`${HN_USER_API_BASE_URL}/user/${encodeURIComponent(id)}.json`, signal);
}
