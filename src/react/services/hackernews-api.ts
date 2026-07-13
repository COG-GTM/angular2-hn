import { Story } from '../models/story';
import { User } from '../models/user';
import { PollResult } from '../models/poll-result';

const baseUrl = 'https://node-hnapi.herokuapp.com';

async function lazyFetch<T>(url: string, signal?: AbortSignal): Promise<T> {
    const res = await fetch(url, { signal });
    return (await res.json()) as T;
}

export function fetchFeed(feedType: string, page: number, signal?: AbortSignal): Promise<Story[]> {
    return lazyFetch<Story[]>(`${baseUrl}/${feedType}?page=${page}`, signal);
}

export function fetchPollContent(id: number, signal?: AbortSignal): Promise<PollResult> {
    return lazyFetch<PollResult>(`${baseUrl}/item/${id}`, signal);
}

export async function fetchItemContent(id: number, signal?: AbortSignal): Promise<Story> {
    const story = await lazyFetch<Story>(`${baseUrl}/item/${id}`, signal);

    if (story.type === 'poll' && story.poll) {
        const numberOfPollOptions = story.poll.length;
        story.poll_votes_count = 0;
        const results = await Promise.all(
            Array.from({ length: numberOfPollOptions }, (_, i) => fetchPollContent(story.id + i + 1, signal))
        );
        results.forEach((pollResults, i) => {
            story.poll[i] = pollResults;
            story.poll_votes_count += pollResults.points;
        });
    }

    return story;
}

export function fetchUser(id: string, signal?: AbortSignal): Promise<User> {
    return lazyFetch<User>(`${baseUrl}/user/${id}`, signal);
}
