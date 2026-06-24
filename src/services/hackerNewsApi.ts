import { Story } from '../types/story';
import { User } from '../types/user';
import { PollResult } from '../types/pollResult';

const BASE_URL = 'https://node-hnapi.herokuapp.com';

async function fetchJson<T>(url: string): Promise<T> {
    const res = await fetch(url);
    if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }
    return res.json();
}

export async function fetchFeed(feedType: string, page: number): Promise<Story[]> {
    return fetchJson<Story[]>(`${BASE_URL}/${feedType}?page=${page}`);
}

export async function fetchItemContent(id: number): Promise<Story> {
    const story = await fetchJson<Story>(`${BASE_URL}/item/${id}`);
    if (story.type === 'poll') {
        const pollPromises = story.poll.map((_, i) =>
            fetchPollContent(story.id + i + 1)
        );
        const pollResults = await Promise.all(pollPromises);
        story.poll = pollResults;
        story.poll_votes_count = pollResults.reduce((sum, p) => sum + p.points, 0);
    }
    return story;
}

export async function fetchPollContent(id: number): Promise<PollResult> {
    return fetchJson<PollResult>(`${BASE_URL}/item/${id}`);
}

export async function fetchUser(id: string): Promise<User> {
    return fetchJson<User>(`${BASE_URL}/user/${id}`);
}
