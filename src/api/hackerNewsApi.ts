import type { PollResult, Story, User } from '../types';

export const BASE_URL = 'https://node-hnapi.herokuapp.com';

async function get<T>(path: string, signal?: AbortSignal): Promise<T> {
    const response = await fetch(`${BASE_URL}${path}`, { signal });

    if (!response.ok) {
        throw new Error(`Request to ${path} failed with status ${response.status}`);
    }

    return (await response.json()) as T;
}

export function fetchFeed(feedType: string, page: number, signal?: AbortSignal): Promise<Story[]> {
    return get<Story[]>(`/${feedType}?page=${page}`, signal);
}

export function fetchPollContent(id: number, signal?: AbortSignal): Promise<PollResult> {
    return get<PollResult>(`/item/${id}`, signal);
}

export function fetchUser(id: string, signal?: AbortSignal): Promise<User> {
    return get<User>(`/user/${encodeURIComponent(id)}`, signal);
}

/**
 * Poll options are stored as items with ids following the poll's own id, so they
 * are fetched separately and folded back into the story alongside their total.
 */
export async function fetchItemContent(id: number, signal?: AbortSignal): Promise<Story> {
    const story = await get<Story>(`/item/${id}`, signal);

    if (story.type !== 'poll' || !story.poll) {
        return story;
    }

    const pollResults = await Promise.all(
        story.poll.map((_option, index) => fetchPollContent(story.id + index + 1, signal))
    );

    return {
        ...story,
        poll: pollResults,
        poll_votes_count: pollResults.reduce((total, option) => total + option.points, 0),
    };
}
