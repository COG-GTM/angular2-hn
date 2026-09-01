import type { FeedType } from '../models/feed-type.type';
import type { PollResult } from '../models/poll-result';
import type { Story } from '../models/story';
import type { User } from '../models/user';

export const BASE_URL = 'https://node-hnapi.herokuapp.com';

async function getJson<T>(url: string, signal?: AbortSignal): Promise<T> {
    const response = await fetch(url, { signal });
    if (!response.ok) {
        throw new Error(`Request to ${url} failed with status ${response.status}`);
    }
    return (await response.json()) as T;
}

export function fetchFeed(feedType: FeedType | string, page: number, signal?: AbortSignal): Promise<Story[]> {
    return getJson<Story[]>(`${BASE_URL}/${feedType}?page=${page}`, signal);
}

export function fetchPollContent(id: number, signal?: AbortSignal): Promise<PollResult> {
    return getJson<PollResult>(`${BASE_URL}/item/${id}`, signal);
}

/**
 * Fetches an item. Polls have their options stored as the items following the poll id,
 * so they are fetched separately and aggregated onto the story alongside the total vote count.
 */
export async function fetchItemContent(id: number, signal?: AbortSignal): Promise<Story> {
    const story = await getJson<Story>(`${BASE_URL}/item/${id}`, signal);

    if (story.type === 'poll' && story.poll) {
        const options = await Promise.all(
            story.poll.map((_, index) => fetchPollContent(story.id + index + 1, signal))
        );
        story.poll = options;
        story.poll_votes_count = options.reduce((total, option) => total + option.points, 0);
    }

    return story;
}

export function fetchUser(id: string, signal?: AbortSignal): Promise<User> {
    return getJson<User>(`${BASE_URL}/user/${id}`, signal);
}
