import type { FeedName, PollResult, Story, User } from '../models';

export const HN_API_BASE_URL = 'https://node-hnapi.herokuapp.com';

async function getJson<T>(path: string, signal?: AbortSignal): Promise<T> {
    if (signal?.aborted) {
        throw signal.reason ?? new DOMException('The operation was aborted.', 'AbortError');
    }
    const response = await fetch(`${HN_API_BASE_URL}${path}`, { signal });
    if (!response.ok) {
        throw new Error(`HN API request to ${path} failed with status ${response.status}`);
    }
    return (await response.json()) as T;
}

export function fetchFeed(feedType: FeedName, page: number, signal?: AbortSignal): Promise<Story[]> {
    return getJson<Story[]>(`/${feedType}?page=${page}`, signal);
}

export async function fetchItemContent(id: number, signal?: AbortSignal): Promise<Story> {
    const story = await getJson<Story>(`/item/${id}`, signal);
    if (story.type === 'poll') {
        const optionCount = story.poll?.length ?? 0;
        const results = await Promise.all(
            Array.from({ length: optionCount }, (_, i) => fetchPollContent(story.id + i + 1, signal))
        );
        story.poll = results;
        story.poll_votes_count = results.reduce((total, result) => total + result.points, 0);
    }
    return story;
}

export function fetchPollContent(id: number, signal?: AbortSignal): Promise<PollResult> {
    return getJson<PollResult>(`/item/${id}`, signal);
}

export function fetchUser(id: string, signal?: AbortSignal): Promise<User> {
    return getJson<User>(`/user/${id}`, signal);
}
