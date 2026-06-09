import type { Story, User, PollResult } from '../types';

const baseUrl = 'https://node-hnapi.herokuapp.com';

async function lazyFetch<T>(url: string, signal?: AbortSignal): Promise<T> {
    const res = await fetch(url, { signal });
    return (await res.json()) as T;
}

export function fetchFeed(
    feedType: string,
    page: number,
    signal?: AbortSignal
): Promise<Story[]> {
    return lazyFetch<Story[]>(`${baseUrl}/${feedType}?page=${page}`, signal);
}

export async function fetchItemContent(
    id: number,
    signal?: AbortSignal
): Promise<Story> {
    const story = await lazyFetch<Story>(`${baseUrl}/item/${id}`, signal);
    if (story.type === 'poll' && story.poll) {
        const numberOfPollOptions = story.poll.length;
        story.poll_votes_count = 0;
        for (let i = 1; i <= numberOfPollOptions; i++) {
            const pollResults = await fetchPollContent(story.id + i, signal);
            story.poll[i - 1] = pollResults;
            story.poll_votes_count += pollResults.points;
        }
    }
    return story;
}

export function fetchPollContent(
    id: number,
    signal?: AbortSignal
): Promise<PollResult> {
    return lazyFetch<PollResult>(`${baseUrl}/item/${id}`, signal);
}

export function fetchUser(id: string, signal?: AbortSignal): Promise<User> {
    return lazyFetch<User>(`${baseUrl}/user/${id}`, signal);
}
