import type { PollResult, Story, User } from '../models';

export const baseUrl = 'https://node-hnapi.herokuapp.com';

async function get<T>(url: string, signal?: AbortSignal): Promise<T> {
    const response = await fetch(url, { signal });
    return (await response.json()) as T;
}

export function fetchFeed(feedType: string, page: number, signal?: AbortSignal): Promise<Story[]> {
    return get<Story[]>(`${baseUrl}/${feedType}?page=${page}`, signal);
}

export function fetchPollContent(id: number, signal?: AbortSignal): Promise<PollResult> {
    return get<PollResult>(`${baseUrl}/item/${id}`, signal);
}

export async function fetchItemContent(id: number, signal?: AbortSignal): Promise<Story> {
    const story = await get<Story>(`${baseUrl}/item/${id}`, signal);

    if (story.type === 'poll' && story.poll) {
        const results = await Promise.all(story.poll.map((_, index) => fetchPollContent(story.id + index + 1, signal)));
        story.poll = results;
        story.poll_votes_count = results.reduce((total, result) => total + result.points, 0);
    }

    return story;
}

export function fetchUser(id: string, signal?: AbortSignal): Promise<User> {
    return get<User>(`${baseUrl}/user/${id}`, signal);
}
