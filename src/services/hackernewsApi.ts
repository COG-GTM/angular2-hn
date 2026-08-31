import { FeedName } from '../models/feed-type.type';
import { PollResult } from '../models/poll-result';
import { Story } from '../models/story';
import { User } from '../models/user';

export const baseUrl = 'https://node-hnapi.herokuapp.com';

async function getJson<T>(url: string): Promise<T> {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Request to ${url} failed with status ${response.status}`);
    }
    return (await response.json()) as T;
}

export function fetchFeed(feedType: FeedName, page: number): Promise<Story[]> {
    return getJson<Story[]>(`${baseUrl}/${feedType}?page=${page}`);
}

export async function fetchItemContent(id: number): Promise<Story> {
    const story = await getJson<Story>(`${baseUrl}/item/${id}`);

    if (story.type === 'poll') {
        const pollResults = await Promise.all(
            story.poll.map((_, index) => fetchPollContent(story.id + index + 1))
        );
        story.poll = pollResults;
        story.poll_votes_count = pollResults.reduce((total, result) => total + result.points, 0);
    }

    return story;
}

export function fetchPollContent(id: number): Promise<PollResult> {
    return getJson<PollResult>(`${baseUrl}/item/${id}`);
}

export function fetchUser(id: string): Promise<User> {
    return getJson<User>(`${baseUrl}/user/${id}`);
}
