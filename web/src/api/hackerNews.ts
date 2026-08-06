import { PollResult } from '../models/poll-result';
import { Story } from '../models/story';
import { User } from '../models/user';

export const BASE_URL = 'https://node-hnapi.herokuapp.com';

async function lazyFetch<T>(url: string, options?: RequestInit): Promise<T> {
    const response = await fetch(url, options);
    if (!response.ok) {
        throw new Error(`Request to ${url} failed with status ${response.status}`);
    }
    return (await response.json()) as T;
}

export function fetchFeed(feedType: string, page: number): Promise<Story[]> {
    return lazyFetch<Story[]>(`${BASE_URL}/${feedType}?page=${page}`);
}

export function fetchPollContent(id: number): Promise<PollResult> {
    return lazyFetch<PollResult>(`${BASE_URL}/item/${id}`);
}

export async function fetchItemContent(id: number): Promise<Story> {
    const story = await lazyFetch<Story>(`${BASE_URL}/item/${id}`);

    if (story.type === 'poll' && story.poll) {
        const numberOfPollOptions = story.poll.length;
        const pollOptions = await Promise.all(
            Array.from({ length: numberOfPollOptions }, (_, index) => fetchPollContent(story.id + index + 1))
        );
        story.poll = pollOptions;
        story.poll_votes_count = pollOptions.reduce((votes, pollResult) => votes + pollResult.points, 0);
    }

    return story;
}

export function fetchUser(id: string): Promise<User> {
    return lazyFetch<User>(`${BASE_URL}/user/${id}`);
}
