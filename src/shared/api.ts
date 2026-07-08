import { Story } from './models/story';
import { User } from './models/user';
import { PollResult } from './models/poll-result';

const baseUrl = 'https://node-hnapi.herokuapp.com';

async function lazyFetch<T>(url: string, options?: RequestInit): Promise<T> {
    const res = await fetch(url, options);
    return (await res.json()) as T;
}

export function fetchFeed(feedType: string, page: number): Promise<Story[]> {
    return lazyFetch<Story[]>(`${baseUrl}/${feedType}?page=${page}`);
}

export function fetchPollContent(id: number): Promise<PollResult> {
    return lazyFetch<PollResult>(`${baseUrl}/item/${id}`);
}

export async function fetchItemContent(id: number): Promise<Story> {
    const story = await lazyFetch<Story>(`${baseUrl}/item/${id}`);
    if (story.type === 'poll' && story.poll) {
        const numberOfPollOptions = story.poll.length;
        story.poll_votes_count = 0;
        const pollResults = await Promise.all(
            Array.from({ length: numberOfPollOptions }, (_, i) => fetchPollContent(story.id + i + 1))
        );
        pollResults.forEach((pollResult, i) => {
            story.poll[i] = pollResult;
            story.poll_votes_count += pollResult.points;
        });
    }
    return story;
}

export function fetchUser(id: string): Promise<User> {
    return lazyFetch<User>(`${baseUrl}/user/${id}`);
}
