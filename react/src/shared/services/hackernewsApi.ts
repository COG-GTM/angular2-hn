import { PollResult, Story, User } from '../models';

export const BASE_URL = 'https://node-hnapi.herokuapp.com';

async function getJson<T>(url: string): Promise<T> {
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Request to ${url} failed with status ${response.status}`);
    }

    return (await response.json()) as T;
}

export function fetchFeed(feedType: string, page: number): Promise<Story[]> {
    return getJson<Story[]>(`${BASE_URL}/${feedType}?page=${page}`);
}

export function fetchPollContent(id: number): Promise<PollResult> {
    return getJson<PollResult>(`${BASE_URL}/item/${id}`);
}

export function fetchUser(id: string): Promise<User> {
    return getJson<User>(`${BASE_URL}/user/${id}`);
}

/**
 * Fetches an item. Poll items are expanded: each poll option lives at `story.id + n`
 * and is fetched separately, then the individual option points are summed into
 * `poll_votes_count` — the same aggregation the Angular service performed.
 */
export async function fetchItemContent(id: number): Promise<Story> {
    const story = await getJson<Story>(`${BASE_URL}/item/${id}`);

    if (story.type === 'poll' && story.poll) {
        const pollResults = await Promise.all(story.poll.map((_, index) => fetchPollContent(story.id + index + 1)));

        story.poll = pollResults;
        story.poll_votes_count = pollResults.reduce((total, pollResult) => total + pollResult.points, 0);
    }

    return story;
}
