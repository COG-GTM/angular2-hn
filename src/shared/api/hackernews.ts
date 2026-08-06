import type { PollResult } from '../models/poll-result';
import type { Story } from '../models/story';
import type { User } from '../models/user';

export const BASE_URL = 'https://node-hnapi.herokuapp.com';

async function fetchJSON<T>(url: string, signal?: AbortSignal): Promise<T> {
    const res = await fetch(url, { signal });
    return (await res.json()) as T;
}

export function fetchFeed(feedType: string, page: number, signal?: AbortSignal): Promise<Story[]> {
    return fetchJSON<Story[]>(`${BASE_URL}/${feedType}?page=${page}`, signal);
}

export function fetchPollContent(id: number, signal?: AbortSignal): Promise<PollResult> {
    return fetchJSON<PollResult>(`${BASE_URL}/item/${id}`, signal);
}

export async function fetchItemContent(id: number, signal?: AbortSignal): Promise<Story> {
    const story = await fetchJSON<Story>(`${BASE_URL}/item/${id}`, signal);
    if (story.type === 'poll' && story.poll) {
        const numberOfPollOptions = story.poll.length;
        story.poll_votes_count = 0;
        const pollResults = await Promise.all(
            Array.from({ length: numberOfPollOptions }, (_, i) => fetchPollContent(story.id + i + 1, signal))
        );
        pollResults.forEach((pollResult, i) => {
            story.poll![i] = pollResult;
            story.poll_votes_count! += pollResult.points;
        });
    }
    return story;
}

export function fetchUser(id: string, signal?: AbortSignal): Promise<User> {
    return fetchJSON<User>(`${BASE_URL}/user/${id}`, signal);
}
