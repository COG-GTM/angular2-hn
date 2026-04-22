import type { Story } from '../types/story';
import type { User } from '../types/user';
import type { PollResult } from '../types/pollResult';

const BASE_URL = 'https://node-hnapi.herokuapp.com';

async function fetchJson<T>(url: string, signal?: AbortSignal): Promise<T> {
    const res = await fetch(url, { signal });
    if (!res.ok) {
        throw new Error(`Request failed: ${res.status} ${res.statusText}`);
    }
    return (await res.json()) as T;
}

export function fetchFeed(feedType: string, page: number, signal?: AbortSignal): Promise<Story[]> {
    return fetchJson<Story[]>(`${BASE_URL}/${feedType}?page=${page}`, signal);
}

export async function fetchItemContent(id: number, signal?: AbortSignal): Promise<Story> {
    const story = await fetchJson<Story>(`${BASE_URL}/item/${id}`, signal);
    if (story.type === ('poll' as Story['type']) && story.poll && story.poll.length > 0) {
        const numberOfPollOptions = story.poll.length;
        const pollIds = Array.from({ length: numberOfPollOptions }, (_, i) => story.id + (i + 1));
        const results = await Promise.all(pollIds.map((pollId) => fetchPollContent(pollId, signal)));
        story.poll = results;
        story.poll_votes_count = results.reduce((sum, p) => sum + p.points, 0);
    }
    return story;
}

export function fetchPollContent(id: number, signal?: AbortSignal): Promise<PollResult> {
    return fetchJson<PollResult>(`${BASE_URL}/item/${id}`, signal);
}

export function fetchUser(id: string, signal?: AbortSignal): Promise<User> {
    return fetchJson<User>(`${BASE_URL}/user/${id}`, signal);
}
