import type { PollResult, Story, User } from '../models';

export const BASE_URL = 'https://node-hnapi.herokuapp.com';
export const FIREBASE_URL = 'https://hacker-news.firebaseio.com/v0';
export const PAGE_SIZE = 30;

async function fetchJson<T>(url: string, signal?: AbortSignal): Promise<T> {
    const res = await fetch(url, { signal });
    if (!res.ok) {
        throw new Error(`${res.status} ${res.statusText}: ${url}`);
    }
    return (await res.json()) as T;
}

export function fetchFeed(feedType: string, page: number, signal?: AbortSignal): Promise<Story[]> {
    return fetchJson<Story[]>(`${BASE_URL}/${feedType}?page=${page}`, signal);
}

export function fetchPollContent(id: number, signal?: AbortSignal): Promise<PollResult> {
    return fetchJson<PollResult>(`${BASE_URL}/item/${id}`, signal);
}

/**
 * Resolves with the item as soon as it loads. Poll options are fetched separately (their ids follow
 * the poll id); `onPollUpdate` receives an updated copy of the story as each option arrives.
 */
export async function fetchItemContent(
    id: number,
    signal?: AbortSignal,
    onPollUpdate?: (story: Story) => void
): Promise<Story> {
    const story = await fetchJson<Story>(`${BASE_URL}/item/${id}`, signal);
    if (story.type === 'poll' && story.poll) {
        const poll = [...story.poll];
        let votes = 0;
        story.poll_votes_count = 0;
        poll.forEach((_, index) => {
            fetchPollContent(story.id + index + 1, signal)
                .then((pollResult) => {
                    poll[index] = pollResult;
                    votes += pollResult.points;
                    onPollUpdate?.({ ...story, poll: [...poll], poll_votes_count: votes });
                })
                .catch(() => undefined);
        });
    }
    return story;
}

interface FirebaseUser {
    id: string;
    created: number;
    karma: number;
    about?: string;
}

function timeAgo(unixSeconds: number): string {
    const days = Math.floor((Date.now() / 1000 - unixSeconds) / 86400);
    const years = Math.floor(days / 365.25);
    if (years >= 1) return years === 1 ? 'a year ago' : `${years} years ago`;
    const months = Math.floor(days / 30);
    if (months >= 1) return months === 1 ? 'a month ago' : `${months} months ago`;
    return days <= 1 ? 'a day ago' : `${days} days ago`;
}

async function fetchFirebaseUser(id: string, signal?: AbortSignal): Promise<User> {
    const hn = await fetchJson<FirebaseUser | null>(`${FIREBASE_URL}/user/${encodeURIComponent(id)}.json`, signal);
    if (!hn) throw new Error(`User ${id} not found`);
    return {
        id: hn.id,
        created_time: hn.created,
        created: timeAgo(hn.created),
        karma: hn.karma,
        avg: null,
        about: hn.about ?? '',
    };
}

/** node-hnapi's /user endpoint is currently offline upstream, so fall back to the official HN API. */
export async function fetchUser(id: string, signal?: AbortSignal): Promise<User> {
    try {
        return await fetchJson<User>(`${BASE_URL}/user/${id}`, signal);
    } catch (error) {
        if (signal?.aborted) throw error;
        return fetchFirebaseUser(id, signal);
    }
}
