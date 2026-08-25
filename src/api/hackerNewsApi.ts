import { PollResult } from '../models/poll-result';
import { Story } from '../models/story';
import { User } from '../models/user';

const baseUrl = 'https://node-hnapi.herokuapp.com';

async function fetchJson<T>(url: string): Promise<T> {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
    }
    return response.json() as Promise<T>;
}

export async function fetchFeed(feedType: string, page: number): Promise<Story[]> {
    return fetchJson<Story[]>(`${baseUrl}/${feedType}?page=${page}`);
}

export async function fetchItemContent(id: number): Promise<Story> {
    const story = await fetchJson<Story>(`${baseUrl}/item/${id}`);

    if (story.type === 'poll') {
        story.poll_votes_count = 0;
        const pollResults = await Promise.all(
            story.poll.map((_, index) => fetchPollContent(story.id + index + 1)),
        );
        pollResults.forEach((pollResult, index) => {
            story.poll[index] = pollResult;
            story.poll_votes_count += pollResult.points;
        });
    }

    return story;
}

export async function fetchPollContent(id: number): Promise<PollResult> {
    return fetchJson<PollResult>(`${baseUrl}/item/${id}`);
}

export async function fetchUser(id: string): Promise<User> {
    return fetchJson<User>(`${baseUrl}/user/${id}`);
}
