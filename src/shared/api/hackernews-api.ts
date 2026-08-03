import type { FeedName } from '../models/feed-name.type';
import type { PollResult } from '../models/poll-result';
import type { Story } from '../models/story';
import type { User } from '../models/user';

export const BASE_URL = 'https://node-hnapi.herokuapp.com';

async function getJson<T>(url: string, init?: RequestInit): Promise<T> {
    const response = await fetch(url, init);
    if (!response.ok) {
        throw new Error(`Request to ${url} failed with status ${response.status}`);
    }
    return (await response.json()) as T;
}

export function fetchFeed(feedType: FeedName | string, page: number, init?: RequestInit): Promise<Story[]> {
    return getJson<Story[]>(`${BASE_URL}/${feedType}?page=${page}`, init);
}

export function fetchPollContent(id: number, init?: RequestInit): Promise<PollResult> {
    return getJson<PollResult>(`${BASE_URL}/item/${id}`, init);
}

export function fetchUser(id: string, init?: RequestInit): Promise<User> {
    return getJson<User>(`${BASE_URL}/user/${id}`, init);
}

/**
 * Fetches an item. Poll items are followed by one sub-item per poll option, whose ids are the
 * poll id plus the option's one-based index; their points are aggregated into `poll_votes_count`.
 */
export async function fetchItemContent(id: number, init?: RequestInit): Promise<Story> {
    const story = await getJson<Story>(`${BASE_URL}/item/${id}`, init);

    if (story.type === 'poll' && story.poll?.length) {
        const pollResults = await Promise.all(
            story.poll.map((_option, index) => fetchPollContent(story.id + index + 1, init))
        );
        story.poll = pollResults;
        story.poll_votes_count = pollResults.reduce((total, result) => total + result.points, 0);
    }

    return story;
}
