import { PollResult, Story, User } from '../models';

export const BASE_URL = 'https://node-hnapi.herokuapp.com';

async function get<T>(path: string, signal?: AbortSignal): Promise<T> {
    const response = await fetch(`${BASE_URL}${path}`, { signal });
    if (!response.ok) {
        throw new Error(`Request to ${path} failed with status ${response.status}`);
    }

    const payload = (await response.json()) as T & { error?: string | boolean };
    // The API answers unknown ids with 200 and an { error } body.
    if (payload && typeof payload === 'object' && !Array.isArray(payload) && payload.error) {
        throw new Error(typeof payload.error === 'string' ? payload.error : `Request to ${path} failed`);
    }

    return payload;
}

export function fetchFeed(feedType: string, page: number, signal?: AbortSignal): Promise<Story[]> {
    return get<Story[]>(`/${feedType}?page=${page}`, signal);
}

export function fetchPollContent(id: number, signal?: AbortSignal): Promise<PollResult> {
    return get<PollResult>(`/item/${id}`, signal);
}

export async function fetchItemContent(id: number, signal?: AbortSignal): Promise<Story> {
    const story = await get<Story>(`/item/${id}`, signal);
    if (story.type === 'poll' && story.poll) {
        const settled = await Promise.allSettled(
            story.poll.map((_, index) => fetchPollContent(story.id + index + 1, signal))
        );
        // A failing option must not take down the whole item page.
        story.poll = story.poll.map((option, index) => {
            const result = settled[index];
            return result.status === 'fulfilled' ? result.value : option;
        });
        story.poll_votes_count = story.poll.reduce((total, option) => total + (option.points || 0), 0);
    }
    return story;
}

export function fetchUser(id: string, signal?: AbortSignal): Promise<User> {
    return get<User>(`/user/${id}`, signal);
}
