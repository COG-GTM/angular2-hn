import type { FeedType, PollResult, Story, User } from '../models';

export const BASE_URL = 'https://node-hnapi.herokuapp.com';

async function request<T>(url: string): Promise<T> {
    const response = await fetch(url);
    return (await response.json()) as T;
}

export function fetchFeed(feedType: FeedType | string, page: number): Promise<Story[]> {
    return request<Story[]>(`${BASE_URL}/${feedType}?page=${page}`);
}

export function fetchPollContent(id: number): Promise<PollResult> {
    return request<PollResult>(`${BASE_URL}/item/${id}`);
}

export async function fetchItemContent(id: number): Promise<Story> {
    const story = await request<Story>(`${BASE_URL}/item/${id}`);

    if (story.type === 'poll') {
        const numberOfPollOptions = story.poll.length;
        story.poll_votes_count = 0;
        const pollResults = await Promise.all(
            Array.from({ length: numberOfPollOptions }, (_, index) => fetchPollContent(story.id + index + 1))
        );
        pollResults.forEach((pollResult, index) => {
            story.poll[index] = pollResult;
            story.poll_votes_count += pollResult.points;
        });
    }

    return story;
}

export function fetchUser(id: string): Promise<User> {
    return request<User>(`${BASE_URL}/user/${id}`);
}
