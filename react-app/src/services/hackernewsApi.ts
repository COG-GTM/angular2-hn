import fetch from 'unfetch';

import type { Story } from '../models';
import type { User } from '../models';
import type { PollResult } from '../models';

const baseUrl = 'https://node-hnapi.herokuapp.com';

async function lazyFetch<T>(url: string): Promise<T> {
    const res = await fetch(url);
    return res.json() as Promise<T>;
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
        const results = await Promise.all(
            Array.from({ length: numberOfPollOptions }, (_, i) =>
                fetchPollContent(story.id + i + 1)
            )
        );
        results.forEach((pollResults, i) => {
            story.poll[i] = pollResults;
            story.poll_votes_count += pollResults.points;
        });
    }
    return story;
}

export function fetchUser(id: string): Promise<User> {
    return lazyFetch<User>(`${baseUrl}/user/${id}`);
}
