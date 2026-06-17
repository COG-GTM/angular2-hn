import { Story } from '../models/story';
import { User } from '../models/user';
import { PollResult } from '../models/poll-result';

const BASE_URL = 'https://node-hnapi.herokuapp.com';

async function fetchJSON<T>(url: string): Promise<T> {
    const res = await fetch(url);
    if (!res.ok) {
        throw new Error(`HTTP error ${res.status}`);
    }
    return res.json() as Promise<T>;
}

export async function fetchFeed(feedType: string, page: number): Promise<Story[]> {
    return fetchJSON<Story[]>(`${BASE_URL}/${feedType}?page=${page}`);
}

export async function fetchItemContent(id: number): Promise<Story> {
    const story = await fetchJSON<Story>(`${BASE_URL}/item/${id}`);
    if (story.type === 'poll' && story.poll) {
        const numberOfPollOptions = story.poll.length;
        story.poll_votes_count = 0;
        const pollResults = await Promise.all(
            Array.from({ length: numberOfPollOptions }, (_, i) => fetchPollContent(story.id + i + 1))
        );
        story.poll = pollResults;
        story.poll_votes_count = pollResults.reduce((sum, p) => sum + p.points, 0);
    }
    return story;
}

export async function fetchPollContent(id: number): Promise<PollResult> {
    return fetchJSON<PollResult>(`${BASE_URL}/item/${id}`);
}

export async function fetchUser(id: string): Promise<User> {
    return fetchJSON<User>(`${BASE_URL}/user/${id}`);
}
