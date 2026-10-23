import type { FeedType, PollResult, Story, User } from '../types';
import { isFeedType } from '../types';
import { ApiError } from './ApiError';
import { fetchJson, toPositiveInt } from './fetchJson';

/** Port of Angular's `HackerNewsAPIService` (`src/app/shared/services/hackernews-api.service.ts`). */
export const HN_API_BASE_URL = 'https://node-hnapi.herokuapp.com';
/** node-hnapi answers every `/user/*` request with 404, so profiles come from HNPWA (same data shape). */
export const HNPWA_API_BASE_URL = 'https://api.hnpwa.com/v0';

/** Exact request URLs (also the keys for `mockFetch` in tests). */
export const apiUrls = {
    feed: (feedType: FeedType, page: number) => `${HN_API_BASE_URL}/${feedType}?page=${page}`,
    item: (id: number) => `${HN_API_BASE_URL}/item/${id}`,
    user: (id: string) => `${HNPWA_API_BASE_URL}/user/${encodeURIComponent(id)}.json`,
};

/** `story.poll[i]` as node-hnapi embeds it, before the options are fetched. */
interface RawPollOption {
    item?: string;
    content?: string;
    points?: number | null;
}

function invalid(message: string): ApiError {
    return new ApiError(message, 'invalid-param');
}

function assertObjectWith<K extends string>(value: unknown, key: K, type: 'number' | 'string'): boolean {
    return (
        typeof value === 'object' &&
        value !== null &&
        !Array.isArray(value) &&
        typeof (value as Record<K, unknown>)[key] === type
    );
}

/** One feed page (30 stories). `page` may be the raw `:page` route param. */
export async function fetchFeed(feedType: FeedType, page: number | string, signal?: AbortSignal): Promise<Story[]> {
    if (!isFeedType(feedType)) throw invalid(`Unknown feed type: ${String(feedType)}`);
    const pageNumber = toPositiveInt(page);
    if (Number.isNaN(pageNumber)) throw invalid(`Invalid page: ${String(page)}`);
    const stories = await fetchJson<unknown>(apiUrls.feed(feedType, pageNumber), { signal });
    if (!Array.isArray(stories)) throw new ApiError('Feed response is not a list', 'parse');
    return stories as Story[];
}

/** One poll option (`/item/{id}`, type `pollopt`) → `{ points, content }`. */
export async function fetchPollContent(id: number, signal?: AbortSignal): Promise<PollResult> {
    const itemId = toPositiveInt(id);
    if (Number.isNaN(itemId)) throw invalid(`Invalid item id: ${String(id)}`);
    const item = await fetchJson<{ points?: number | null; content?: string }>(apiUrls.item(itemId), { signal });
    return { points: item.points ?? 0, content: item.content ?? '' };
}

/**
 * An item with its comment tree. Polls keep Angular's logic: option `i` (1-based) is fetched from
 * `/item/{story.id + i}` and `poll_votes_count` is the sum of the options' `points`. Unlike Angular (which
 * patched the story after emitting it), every option is awaited before resolving. A failed option falls back
 * to the data embedded in the poll.
 */
export async function fetchItemContent(id: number | string, signal?: AbortSignal): Promise<Story> {
    const itemId = toPositiveInt(id);
    if (Number.isNaN(itemId)) throw invalid(`Invalid item id: ${String(id)}`);
    const story = await fetchJson<Story>(apiUrls.item(itemId), { signal });
    if (!assertObjectWith(story, 'id', 'number')) {
        throw new ApiError(`Item not found: ${itemId}`, 'not-found', { url: apiUrls.item(itemId) });
    }

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

/** A user profile. Unknown users (HNPWA: HTTP 200 with `null` or plain text) reject with an `ApiError`. */
export async function fetchUser(id: string | undefined, signal?: AbortSignal): Promise<User> {
    const userId = typeof id === 'string' ? id.trim() : '';
    if (!userId) throw invalid(`Invalid user id: ${String(id)}`);
    const user = await fetchJson<User>(apiUrls.user(userId), { signal });
    if (!assertObjectWith(user, 'id', 'string')) {
        throw new ApiError(`User not found: ${userId}`, 'not-found', { url: apiUrls.user(userId) });
    }
    return user;
}
