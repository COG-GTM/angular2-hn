import type { Story } from '../types/story';
import type { User } from '../types/user';
import type { PollResult } from '../types/pollResult';

const BASE_URL = 'https://node-hnapi.herokuapp.com';

async function getJSON<T>(url: string, signal?: AbortSignal): Promise<T> {
    const res = await fetch(url, { signal });
    if (!res.ok) {
        throw new Error(`Request failed: ${res.status}`);
    }
    return (await res.json()) as T;
}

export function fetchFeed(feedType: string, page: number, signal?: AbortSignal): Promise<Story[]> {
    return getJSON<Story[]>(`${BASE_URL}/${feedType}?page=${page}`, signal);
}

export function fetchPollContent(id: number, signal?: AbortSignal): Promise<PollResult> {
    return getJSON<PollResult>(`${BASE_URL}/item/${id}`, signal);
}

export async function fetchItemContent(id: number, signal?: AbortSignal): Promise<Story> {
    const story = await getJSON<Story>(`${BASE_URL}/item/${id}`, signal);

    if (story.type === 'poll' && Array.isArray(story.poll)) {
        const numberOfPollOptions = story.poll.length;
        story.poll_votes_count = 0;
        const results = await Promise.all(
            Array.from({ length: numberOfPollOptions }, (_, i) => fetchPollContent(story.id + i + 1, signal))
        );
        results.forEach((pollResult, index) => {
            story.poll[index] = pollResult;
            story.poll_votes_count += pollResult.points;
        });
    }

    return story;
}

export function fetchUser(id: string, signal?: AbortSignal): Promise<User> {
    return getJSON<User>(`${BASE_URL}/user/${id}`, signal);
}
