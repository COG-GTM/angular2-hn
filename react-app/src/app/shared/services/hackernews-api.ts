import type { PollResult, Story, User } from '../models/models';

const BASE_URL = 'https://node-hnapi.herokuapp.com';

async function request<T>(url: string, signal?: AbortSignal): Promise<T> {
    const response = await fetch(url, { signal });
    return (await response.json()) as T;
}

export function fetchFeed(feedType: string, page: number, signal?: AbortSignal): Promise<Story[]> {
    return request<Story[]>(`${BASE_URL}/${feedType}?page=${page}`, signal);
}

export function fetchUser(id: string, signal?: AbortSignal): Promise<User> {
    return request<User>(`${BASE_URL}/user/${id}`, signal);
}

function fetchPollContent(id: number, signal?: AbortSignal): Promise<PollResult> {
    return request<PollResult>(`${BASE_URL}/item/${id}`, signal);
}

/** Polls expose each option as its own item, mirroring the Angular service's fan-out. */
export async function fetchItemContent(id: number, signal?: AbortSignal): Promise<Story> {
    const story = await request<Story>(`${BASE_URL}/item/${id}`, signal);
    if (story.type === 'poll' && story.poll) {
        const options = await Promise.all(
            story.poll.map((_option, index) => fetchPollContent(story.id + index + 1, signal))
        );
        story.poll = options;
        story.poll_votes_count = options.reduce((total, option) => total + option.points, 0);
    }
    return story;
}
