import type { PollResult, Story, User } from '../types';

export const baseUrl = 'https://node-hnapi.herokuapp.com';

export interface FetchOptions {
    signal?: AbortSignal;
}

async function lazyFetch<T>(url: string, options?: FetchOptions): Promise<T> {
    const response = await fetch(url, options);
    if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
    }
    return response.json() as Promise<T>;
}

export async function fetchFeed(feedType: string, page: number, options?: FetchOptions): Promise<Story[]> {
    return lazyFetch<Story[]>(`${baseUrl}/${feedType}?page=${page}`, options);
}

export async function fetchPollContent(id: number, options?: FetchOptions): Promise<PollResult> {
    return lazyFetch<PollResult>(`${baseUrl}/item/${id}`, options);
}

export async function fetchItemContent(id: number, options?: FetchOptions): Promise<Story> {
    const story = await lazyFetch<Story>(`${baseUrl}/item/${id}`, options);
    if (story.type === 'poll' && story.poll) {
        const pollResults = await Promise.all(
            story.poll.map((_, index) => fetchPollContent(story.id + index + 1, options)),
        );
        story.poll = pollResults;
        story.poll_votes_count = pollResults.reduce((total, result) => total + result.points, 0);
    }
    return story;
}

export async function fetchUser(id: string, options?: FetchOptions): Promise<User> {
    return lazyFetch<User>(`${baseUrl}/user/${id}`, options);
}

export const hackerNewsApi = { fetchFeed, fetchItemContent, fetchPollContent, fetchUser };
