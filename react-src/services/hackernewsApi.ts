import { PollResult } from '../models/poll-result';
import { Story } from '../models/story';
import { User } from '../models/user';

export const baseUrl = 'https://node-hnapi.herokuapp.com';

async function get<T>(url: string): Promise<T> {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
    }
    return (await response.json()) as T;
}

export function fetchFeed(feedType: string, page: number): Promise<Story[]> {
    return get<Story[]>(`${baseUrl}/${feedType}?page=${page}`);
}

export function fetchPollContent(id: number): Promise<PollResult> {
    return get<PollResult>(`${baseUrl}/item/${id}`);
}

export async function fetchItemContent(id: number): Promise<Story> {
    const story = await get<Story>(`${baseUrl}/item/${id}`);
    if (story.type === 'poll') {
        const numberOfPollOptions = story.poll.length;
        story.poll_votes_count = 0;
        const results = await Promise.all(
            Array.from({ length: numberOfPollOptions }, (_unused, index) => fetchPollContent(story.id + index + 1))
        );
        results.forEach((pollResult, index) => {
            story.poll[index] = pollResult;
            story.poll_votes_count += pollResult.points;
        });
    }
    return story;
}

export function fetchUser(id: string): Promise<User> {
    return get<User>(`${baseUrl}/user/${id}`);
}
