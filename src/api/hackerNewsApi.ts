import { PollResult, Story, User } from '../models';

const baseUrl = 'https://node-hnapi.herokuapp.com';

async function fetchJson<T>(url: string): Promise<T> {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
    }
    return (await response.json()) as T;
}

export function fetchFeed(feedType: string, page: number): Promise<Story[]> {
    return fetchJson<Story[]>(`${baseUrl}/${feedType}?page=${page}`);
}

export function fetchPollContent(id: number): Promise<PollResult> {
    return fetchJson<PollResult>(`${baseUrl}/item/${id}`);
}

export async function fetchItemContent(id: number): Promise<Story> {
    const story = await fetchJson<Story>(`${baseUrl}/item/${id}`);

    if (story.type === 'poll' && story.poll) {
        const options = await Promise.all(story.poll.map((_, index) => fetchPollContent(story.id + index + 1)));
        story.poll = options;
        story.poll_votes_count = options.reduce((total, option) => total + option.points, 0);
    }

    return story;
}

export function fetchUser(id: string): Promise<User> {
    return fetchJson<User>(`${baseUrl}/user/${id}`);
}
