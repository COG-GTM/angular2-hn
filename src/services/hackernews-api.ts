import { Story } from '../models/story';
import { User } from '../models/user';
import { PollResult } from '../models/poll-result';

const BASE_URL = 'https://node-hnapi.herokuapp.com';

async function fetchJson<T>(url: string): Promise<T> {
    const res = await fetch(url);
    if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }
    return res.json() as Promise<T>;
}

export async function fetchFeed(feedType: string, page: number): Promise<Story[]> {
    return fetchJson<Story[]>(`${BASE_URL}/${feedType}?page=${page}`);
}

export async function fetchItemContent(id: number): Promise<Story> {
    const story = await fetchJson<Story>(`${BASE_URL}/item/${id}`);
    if (story.type === 'poll' && story.poll) {
        const numberOfPollOptions = story.poll.length;
        story.poll_votes_count = 0;
        const pollPromises = Array.from({ length: numberOfPollOptions }, (_, i) => fetchPollContent(story.id + i + 1));
        const pollResults = await Promise.all(pollPromises);
        pollResults.forEach((result, i) => {
            story.poll[i] = result;
            story.poll_votes_count += result.points;
        });
    }
    return story;
}

export async function fetchPollContent(id: number): Promise<PollResult> {
    return fetchJson<PollResult>(`${BASE_URL}/item/${id}`);
}

export async function fetchUser(id: string): Promise<User> {
    return fetchJson<User>(`${BASE_URL}/user/${id}`);
}
