import type { PollResult } from '../models/poll-result';
import type { Story } from '../models/story';
import type { User } from '../models/user';

export const baseUrl = 'https://node-hnapi.herokuapp.com';

async function getJson<T>(url: string, signal?: AbortSignal): Promise<T> {
    const response = await fetch(url, { signal });
    return (await response.json()) as T;
}

export function fetchFeed(feedType: string, page: number, signal?: AbortSignal): Promise<Story[]> {
    return getJson<Story[]>(`${baseUrl}/${feedType}?page=${page}`, signal);
}

export function fetchPollContent(id: number, signal?: AbortSignal): Promise<PollResult> {
    return getJson<PollResult>(`${baseUrl}/item/${id}`, signal);
}

export async function fetchItemContent(id: number, signal?: AbortSignal): Promise<Story> {
    const story = await getJson<Story>(`${baseUrl}/item/${id}`, signal);

    if (story.type === 'poll') {
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

export function fetchUser(id: string, signal?: AbortSignal): Promise<User> {
    return getJson<User>(`${baseUrl}/user/${id}`, signal);
}
