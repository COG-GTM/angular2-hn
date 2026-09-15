import type { PollResult, Story, User } from '../models';

export const BASE_URL = 'https://node-hnapi.herokuapp.com';

async function getJson<T>(url: string): Promise<T> {
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
    }

    return response.json() as Promise<T>;
}

export function fetchFeed(feedType: string, page: number): Promise<Story[]> {
    return getJson<Story[]>(`${BASE_URL}/${feedType}?page=${page}`);
}

export async function fetchItemContent(id: number): Promise<Story> {
    const story = await getJson<Story>(`${BASE_URL}/item/${id}`);

    if (story.type === 'poll') {
        const pollResults = await Promise.all(
            Array.from({ length: story.poll.length }, (_, index) => fetchPollContent(story.id + index + 1)),
        );

        pollResults.forEach((result, index) => {
            story.poll[index] = result;
        });
        story.poll_votes_count = pollResults.reduce((total, result) => total + result.points, 0);
    }

    return story;
}

export function fetchPollContent(id: number): Promise<PollResult> {
    return getJson<PollResult>(`${BASE_URL}/item/${id}`);
}

export function fetchUser(id: string): Promise<User> {
    return getJson<User>(`${BASE_URL}/user/${id}`);
}
