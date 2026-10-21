import type { FeedType, PollResult, Story, User } from '../models';
import { isFeedType } from '../models';
import { ApiError } from './errors';
import { fetchJson, toPositiveInt } from './fetch-json';

/** node-hnapi: feeds and items (same base URL as Angular's HackerNewsAPIService). */
export const HN_API_BASE_URL = 'https://node-hnapi.herokuapp.com';
/** node-hnapi `/user/*` returns 404 for every user, so users come from HNPWA. */
export const HNPWA_API_BASE_URL = 'https://api.hnpwa.com/v0';

/** Exact request URLs — use them as `mockFetch` keys in tests. */
export const apiUrls = {
    feed: (feedType: FeedType, page: number) => `${HN_API_BASE_URL}/${feedType}?page=${page}`,
    item: (id: number) => `${HN_API_BASE_URL}/item/${id}`,
    user: (id: string) => `${HNPWA_API_BASE_URL}/user/${encodeURIComponent(id)}.json`,
};

/** Shape of `story.poll[i]` as node-hnapi sends it, before options are resolved. */
interface RawPollOption {
    item?: string;
    content?: string;
    points?: number | null;
}

function invalid(message: string): ApiError {
    return new ApiError(message, 'invalid-param');
}

/** Feed page (30 stories). `page` may be the raw `:page` param; non-positive-integers reject `invalid-param`. */
export async function fetchFeed(feedType: FeedType, page: number | string, signal?: AbortSignal): Promise<Story[]> {
    if (!isFeedType(feedType)) throw invalid(`Unknown feed type: ${String(feedType)}`);
    const pageNumber = toPositiveInt(page);
    if (Number.isNaN(pageNumber)) throw invalid(`Invalid page: ${String(page)}`);
    const stories = await fetchJson<Story[]>(apiUrls.feed(feedType, pageNumber), { signal });
    if (!Array.isArray(stories)) throw new ApiError('Feed response is not a list', 'parse');
    return stories;
}

/** One poll option (`/item/{id}` of type `pollopt`) → `{ points, content }`. */
export async function fetchPollOption(id: number, signal?: AbortSignal): Promise<PollResult> {
    const itemId = toPositiveInt(id);
    if (Number.isNaN(itemId)) throw invalid(`Invalid item id: ${String(id)}`);
    const item = await fetchJson<{ points?: number | null; content?: string }>(apiUrls.item(itemId), { signal });
    return { points: item.points ?? 0, content: item.content ?? '' };
}

/**
 * Item with its comment tree. Polls: like Angular, option `i` (1-based) is fetched from
 * `/item/{story.id + i}`, but all options are awaited before the promise resolves, so `poll` is
 * `PollResult[]` and `poll_votes_count` is the sum of their `points`. A failed option falls back to the
 * `{ item, points }` data embedded in the poll. Invalid ids reject `invalid-param`; unknown ids `not-found`.
 */
export async function fetchItem(id: number | string, signal?: AbortSignal): Promise<Story> {
    const itemId = toPositiveInt(id);
    if (Number.isNaN(itemId)) throw invalid(`Invalid item id: ${String(id)}`);
    const story = await fetchJson<Story>(apiUrls.item(itemId), { signal });
    if (typeof story !== 'object' || Array.isArray(story) || typeof story.id !== 'number') {
        throw new ApiError(`Item not found: ${itemId}`, 'not-found', { url: apiUrls.item(itemId) });
    }

    if (story.type === 'poll' && Array.isArray(story.poll)) {
        const rawOptions = story.poll as unknown as RawPollOption[];
        const poll = await Promise.all(
            rawOptions.map(async (raw, index): Promise<PollResult> => {
                try {
                    return await fetchPollOption(story.id + index + 1, signal);
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

/**
 * User profile from HNPWA. Unknown users come back as HTTP 200 with a `null` body or plain text; both
 * reject (`empty` / `parse`), as does a body without a string `id` (`not-found`). Blank ids → `invalid-param`.
 */
export async function fetchUser(id: string | undefined, signal?: AbortSignal): Promise<User> {
    const userId = typeof id === 'string' ? id.trim() : '';
    if (!userId) throw invalid(`Invalid user id: ${String(id)}`);
    const user = await fetchJson<User>(apiUrls.user(userId), { signal });
    if (typeof user !== 'object' || Array.isArray(user) || typeof user.id !== 'string') {
        throw new ApiError(`User not found: ${userId}`, 'not-found', { url: apiUrls.user(userId) });
    }
    return user;
}
