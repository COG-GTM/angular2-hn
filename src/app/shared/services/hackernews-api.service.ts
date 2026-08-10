import { Story } from '../models/story';
import { User } from '../models/user';
import { PollResult } from '../models/poll-result';

const baseUrl = 'https://node-hnapi.herokuapp.com';

async function getJSON<T>(url: string): Promise<T> {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
    }
    return response.json() as Promise<T>;
}

export function fetchFeed(feedType: string, page: number): Promise<Story[]> {
    return getJSON<Story[]>(`${baseUrl}/${feedType}?page=${page}`);
}

export function fetchPollContent(id: number): Promise<PollResult> {
    return getJSON<PollResult>(`${baseUrl}/item/${id}`);
}

export async function fetchItemContent(id: number): Promise<Story> {
    const story = await getJSON<Story>(`${baseUrl}/item/${id}`);
    if (story.type === 'poll') {
        const numberOfPollOptions = story.poll.length;
        story.poll_votes_count = 0;
        for (let i = 1; i <= numberOfPollOptions; i++) {
            const pollResults = await fetchPollContent(story.id + i);
            story.poll[i - 1] = pollResults;
            story.poll_votes_count += pollResults.points;
        }
    }
    return story;
}

export function fetchUser(id: string): Promise<User> {
    return getJSON<User>(`${baseUrl}/user/${id}`);
}
