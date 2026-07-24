import type { PollResult, Story, User } from '../models';

const BASE_URL = 'https://node-hnapi.herokuapp.com';

async function get<T>(url: string): Promise<T> {
    const res = await fetch(url);
    if (!res.ok) {
        throw new Error(`Request to ${url} failed with status ${res.status}`);
    }
    return res.json() as Promise<T>;
}

export async function fetchFeed(feedType: string, page: number): Promise<Story[]> {
    return get<Story[]>(`${BASE_URL}/${feedType}?page=${page}`);
}

export async function fetchItemContent(id: number): Promise<Story> {
    const story = await get<Story>(`${BASE_URL}/item/${id}`);
    if (story.type === 'poll') {
        const pollResults = await Promise.all(
            story.poll.map((_, index) => fetchPollContent(story.id + index + 1))
        );
        story.poll_votes_count = 0;
        pollResults.forEach((pollResult, index) => {
            story.poll[index] = pollResult;
            story.poll_votes_count += pollResult.points;
        });
    }
    return story;
}

export async function fetchPollContent(id: number): Promise<PollResult> {
    return get<PollResult>(`${BASE_URL}/item/${id}`);
}

export async function fetchUser(id: string): Promise<User> {
    return get<User>(`${BASE_URL}/user/${id}`);
}
