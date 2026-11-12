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
        // Like the Angular service, a failed poll option leaves its entry as-is instead of failing the whole item.
        const poll = story.poll;
        const results = await Promise.allSettled(poll.map((_, i) => fetchPollContent(story.id + i + 1, signal)));
        signal?.throwIfAborted();
        story.poll = results.map((r, i) => (r.status === 'fulfilled' ? r.value : poll[i]));
        story.poll_votes_count = results.reduce((sum, r) => sum + (r.status === 'fulfilled' ? r.value.points : 0), 0);
    }
    return story;
}

export async function fetchUser(id: string, signal?: AbortSignal): Promise<User> {
    const user = await getJson<User | null>(`${HN_USER_API_BASE_URL}/user/${encodeURIComponent(id)}.json`, signal);
    // HNPWA answers 200 with `null` for unknown users.
    if (!user) {
        throw new Error(`User not found: ${id}`);
    }
    return user;
}
