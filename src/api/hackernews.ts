import { Story } from '../types/story';
import { User } from '../types/user';
import { PollResult } from '../types/poll-result';

export const BASE_URL = 'https://node-hnapi.herokuapp.com';

async function getJSON<T>(url: string): Promise<T> {
    const response = await fetch(url);
    return (await response.json()) as T;
}

export function fetchFeed(feedType: string, page: number): Promise<Story[]> {
    return getJSON<Story[]>(`${BASE_URL}/${feedType}?page=${page}`);
}

export async function fetchItemContent(id: number): Promise<Story> {
    const story = await getJSON<Story>(`${BASE_URL}/item/${id}`);
    if (story.type === 'poll') {
        const numberOfPollOptions = story.poll.length;
        story.poll_votes_count = 0;
        const results = await Promise.all(
            Array.from({ length: numberOfPollOptions }, (_, i) => fetchPollContent(story.id + (i + 1)))
        );
        results.forEach((pollResult, index) => {
            story.poll[index] = pollResult;
            story.poll_votes_count += pollResult.points;
        });
    }
    return story;
}

export function fetchPollContent(id: number): Promise<PollResult> {
    return getJSON<PollResult>(`${BASE_URL}/item/${id}`);
}

export function fetchUser(id: string): Promise<User> {
    return getJSON<User>(`${BASE_URL}/user/${id}`);
}
