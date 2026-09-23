import type { FeedType, PollResult, Story, User } from './types';

export const HN_API_BASE_URL = 'https://node-hnapi.herokuapp.com';

/** Number of stories the API returns per feed page. */
export const STORIES_PER_PAGE = 30;

/** Rank of the first story on a page, so rank numbering continues across pages. */
export function listStartForPage(page: number): number {
    return (page - 1) * STORIES_PER_PAGE + 1;
}

async function getJson<T>(path: string, signal?: AbortSignal): Promise<T> {
    const response = await fetch(`${HN_API_BASE_URL}${path}`, { signal });
    if (!response.ok) {
        throw new Error(`Request to ${path} failed with status ${response.status}`);
    }
    return (await response.json()) as T;
}

export function fetchFeed(feedType: FeedType, page: number, signal?: AbortSignal): Promise<Story[]> {
    return getJson<Story[]>(`/${feedType}?page=${page}`, signal);
}

export function fetchPollResult(id: number, signal?: AbortSignal): Promise<PollResult> {
    return getJson<PollResult>(`/item/${id}`, signal);
}

export function fetchUser(id: string, signal?: AbortSignal): Promise<User> {
    return getJson<User>(`/user/${id}`, signal);
}

/**
 * Fetches an item and, for polls, resolves each poll option from the
 * consecutive item ids that follow the poll id, totalling their points.
 */
export async function fetchItem(id: number, signal?: AbortSignal): Promise<Story> {
    const story = await getJson<Story>(`/item/${id}`, signal);
    if (story.type !== 'poll' || !story.poll) {
        return story;
    }
    const options = await Promise.all(
        story.poll.map((_, index) => fetchPollResult(story.id + index + 1, signal))
    );
    return {
        ...story,
        poll: options,
        poll_votes_count: options.reduce((total, option) => total + option.points, 0),
    };
}
