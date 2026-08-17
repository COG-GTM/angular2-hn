import type { PollResult } from '../models/poll-result';
import type { Story } from '../models/story';
import type { User } from '../models/user';

export const BASE_URL = 'https://node-hnapi.herokuapp.com';

async function getJson<T>(url: string, options?: RequestInit): Promise<T> {
    const response = await fetch(url, options);
    if (!response.ok) {
        throw new Error(`Request to ${url} failed with status ${response.status}`);
    }
    return (await response.json()) as T;
}

export function fetchFeed(feedType: string, page: number): Promise<Story[]> {
    return getJson<Story[]>(`${BASE_URL}/${feedType}?page=${page}`);
}

export async function fetchItemContent(id: number): Promise<Story> {
    const story = await getJson<Story>(`${BASE_URL}/item/${id}`);
    if (story.type === 'poll' && story.poll) {
        const results = await Promise.all(
            story.poll.map((_, index) => fetchPollContent(story.id + index + 1))
        );
        story.poll = results;
        story.poll_votes_count = results.reduce((total, result) => total + result.points, 0);
    }
    return story;
}

export function fetchPollContent(id: number): Promise<PollResult> {
    return getJson<PollResult>(`${BASE_URL}/item/${id}`);
}

export function fetchUser(id: string): Promise<User> {
    return getJson<User>(`${BASE_URL}/user/${id}`);
}
