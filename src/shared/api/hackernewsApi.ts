import type { PollResult, Story, User } from '../models';

export const BASE_URL = 'https://node-hnapi.herokuapp.com';

async function request<T>(path: string, signal?: AbortSignal): Promise<T> {
    const response = await fetch(`${BASE_URL}${path}`, { signal });
    if (!response.ok) {
        throw new Error(`Request to ${path} failed with status ${response.status}`);
    }
    return (await response.json()) as T;
}

export function fetchFeed(feedType: string, page: number, signal?: AbortSignal): Promise<Story[]> {
    return request<Story[]>(`/${feedType}?page=${page}`, signal);
}

export function fetchPollContent(id: number, signal?: AbortSignal): Promise<PollResult> {
    return request<PollResult>(`/item/${id}`, signal);
}

export function fetchUser(id: string, signal?: AbortSignal): Promise<User> {
    return request<User>(`/user/${id}`, signal);
}

// Poll options live at consecutive item ids following the poll itself, and each
// one has to be fetched separately to aggregate the total vote count.
export async function fetchItemContent(id: number, signal?: AbortSignal): Promise<Story> {
    const story = await request<Story>(`/item/${id}`, signal);

    if (story.type === 'poll' && story.poll) {
        const options = await Promise.all(
            story.poll.map((_, index) => fetchPollContent(story.id + index + 1, signal))
        );
        story.poll = options;
        story.poll_votes_count = options.reduce((total, option) => total + option.points, 0);
    }

    return story;
}
