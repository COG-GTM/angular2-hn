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
    if (story.type === 'poll' && story.poll) {
        const numberOfPollOptions = story.poll.length;
        story.poll_votes_count = 0;
        const optionIndexes = Array.from({ length: numberOfPollOptions }, (_, index) => index + 1);
        const pollResults = await Promise.all(
            optionIndexes.map(i => fetchPollContent(story.id + i).catch(() => undefined))
        );
        pollResults.forEach((pollResult, index) => {
            if (pollResult) {
                story.poll[index] = pollResult;
                story.poll_votes_count += pollResult.points;
            }
        });
    }
    return story;
}

export function fetchUser(id: string): Promise<User> {
    return getJSON<User>(`${baseUrl}/user/${id}`);
}
