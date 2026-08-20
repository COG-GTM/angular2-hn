import type { PollResult, Story, User } from '../types';

export const BASE_URL = 'https://node-hnapi.herokuapp.com';

async function lazyFetch<T>(url: string, signal?: AbortSignal): Promise<T> {
    const response = await fetch(url, { signal });
    if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
    }
    return (await response.json()) as T;
}

export function fetchFeed(feedType: string, page: number, signal?: AbortSignal): Promise<Story[]> {
    return lazyFetch<Story[]>(`${BASE_URL}/${feedType}?page=${page}`, signal);
}

export function fetchPollContent(id: number, signal?: AbortSignal): Promise<PollResult> {
    return lazyFetch<PollResult>(`${BASE_URL}/item/${id}`, signal);
}

export async function fetchItemContent(id: number, signal?: AbortSignal): Promise<Story> {
    const story = await lazyFetch<Story>(`${BASE_URL}/item/${id}`, signal);
    if (story.type === 'poll' && story.poll) {
        const settled = await Promise.allSettled(
            story.poll.map((_, index) => fetchPollContent(story.id + index + 1, signal))
        );
        if (signal?.aborted) {
            throw new DOMException('The operation was aborted.', 'AbortError');
        }
        const results = settled
            .filter((entry): entry is PromiseFulfilledResult<PollResult> => entry.status === 'fulfilled')
            .map((entry) => entry.value);
        story.poll = results;
        story.poll_votes_count = results.reduce((total, result) => total + result.points, 0);
    }
    return story;
}

export function fetchUser(id: string, signal?: AbortSignal): Promise<User> {
    return lazyFetch<User>(`${BASE_URL}/user/${id}`, signal);
}
