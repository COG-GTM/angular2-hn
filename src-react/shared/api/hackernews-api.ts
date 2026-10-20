import type { FeedType, PollResult, Story, User } from '../models';
import { FEED_TYPES } from '../models';
import { fetchJson, toPositiveInt } from './client';
import { ApiError } from './errors';

export const HN_API_BASE_URL = 'https://node-hnapi.herokuapp.com';
/** node-hnapi `/user/*` returns 404 for every user, so users come from HNPWA. */
export const HNPWA_API_BASE_URL = 'https://api.hnpwa.com/v0';

export const apiUrls = {
    feed: (feedType: FeedType, page: number) => `${HN_API_BASE_URL}/${feedType}?page=${page}`,
    item: (id: number) => `${HN_API_BASE_URL}/item/${id}`,
    user: (id: string) => `${HNPWA_API_BASE_URL}/user/${encodeURIComponent(id)}.json`,
};

interface RawPollOption {
    item?: string;
    content?: string;
    points?: number | null;
}

interface RawPollItem {
    content?: string;
    points?: number | null;
}

function invalid(message: string): ApiError {
    return new ApiError(message, 'invalid-param');
}

export async function fetchFeed(feedType: FeedType, page: number | string, signal?: AbortSignal): Promise<Story[]> {
    if (!FEED_TYPES.includes(feedType)) throw invalid(`Unknown feed type: ${String(feedType)}`);
    const pageNumber = toPositiveInt(page);
    if (Number.isNaN(pageNumber)) throw invalid(`Invalid page: ${String(page)}`);
    const stories = await fetchJson<Story[]>(apiUrls.feed(feedType, pageNumber), { signal });
    if (!Array.isArray(stories)) throw new ApiError('Feed response is not a list', 'parse');
    return stories;
}

export async function fetchPollContent(id: number, signal?: AbortSignal): Promise<PollResult> {
    const itemId = toPositiveInt(id);
    if (Number.isNaN(itemId)) throw invalid(`Invalid item id: ${String(id)}`);
    const item = await fetchJson<RawPollItem>(apiUrls.item(itemId), { signal });
    return { points: item.points ?? 0, content: item.content ?? '' };
}

/**
 * Fetches an item with its comment tree. For polls, every option is fetched from `item/<id + i>`
 * (same mapping as Angular) and resolved before the promise settles, so `poll` holds
 * `{ points, content }` and `poll_votes_count` is the sum of points. If an option request fails the
 * option falls back to the `{ item, points }` data embedded in the poll.
 */
export async function fetchItemContent(id: number | string, signal?: AbortSignal): Promise<Story> {
    const itemId = toPositiveInt(id);
    if (Number.isNaN(itemId)) throw invalid(`Invalid item id: ${String(id)}`);
    const story = await fetchJson<Story>(apiUrls.item(itemId), { signal });

    if (story.type === 'poll' && Array.isArray(story.poll)) {
        const rawOptions = story.poll as unknown as RawPollOption[];
        const poll = await Promise.all(
            rawOptions.map(async (raw, index): Promise<PollResult> => {
                try {
                    return await fetchPollContent(story.id + index + 1, signal);
                } catch (error) {
                    if (signal?.aborted) throw error;
                    return { points: raw.points ?? 0, content: raw.content ?? raw.item ?? '' };
                }
            })
        );
        return { ...story, poll, poll_votes_count: poll.reduce((sum, option) => sum + option.points, 0) };
    }

    return story;
}

export async function fetchUser(id: string | undefined, signal?: AbortSignal): Promise<User> {
    const userId = typeof id === 'string' ? id.trim() : '';
    if (!userId) throw invalid(`Invalid user id: ${String(id)}`);
    const user = await fetchJson<User>(apiUrls.user(userId), { signal });
    if (typeof user !== 'object' || typeof user.id !== 'string') {
        throw new ApiError(`User not found: ${userId}`, 'not-found', { url: apiUrls.user(userId) });
    }
    return user;
}
