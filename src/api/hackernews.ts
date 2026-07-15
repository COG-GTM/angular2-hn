import { Story, User, PollResult } from '../models';

export const BASE_URL = 'https://node-hnapi.herokuapp.com';

function isAbortError(err: unknown): boolean {
    return err instanceof Error && err.name === 'AbortError';
}

// Mirrors the Angular `lazyFetch` cancel-token behavior: when the request is
// aborted we neither resolve nor throw an unhandled error (the promise simply
// never settles, like an Observable that never emits after being unsubscribed).
async function request<T>(url: string, signal?: AbortSignal): Promise<T> {
    try {
        const response = await fetch(url, { signal });
        return (await response.json()) as T;
    } catch (err) {
        if (signal?.aborted || isAbortError(err)) {
            return new Promise<T>(() => {});
        }
        throw err;
    }
}

// GET /${feedType}?page=${page}
export function fetchFeed(
    feedType: string,
    page: number,
    signal?: AbortSignal
): Promise<Story[]> {
    return request<Story[]>(`${BASE_URL}/${feedType}?page=${page}`, signal);
}

// GET /item/${id}. Reproduces the Angular poll aggregation: when the story is a
// poll, fetch each poll option (id + i for i = 1..poll.length), assign the
// result into poll[i - 1], and accumulate poll_votes_count from each option's
// points. All option fetches are awaited before resolving.
export async function fetchItem(id: number, signal?: AbortSignal): Promise<Story> {
    const story = await request<Story>(`${BASE_URL}/item/${id}`, signal);
    if (story.type === 'poll') {
        const numberOfPollOptions = story.poll.length;
        story.poll_votes_count = 0;
        await Promise.all(
            Array.from({ length: numberOfPollOptions }, (_unused, index) => {
                const i = index + 1;
                return fetchPoll(story.id + i, signal).then((pollResult) => {
                    story.poll[i - 1] = pollResult;
                    story.poll_votes_count += pollResult.points;
                });
            })
        );
    }
    return story;
}

// GET /item/${id}
export function fetchPoll(id: number, signal?: AbortSignal): Promise<PollResult> {
    return request<PollResult>(`${BASE_URL}/item/${id}`, signal);
}

// GET /user/${id}
export function fetchUser(id: string, signal?: AbortSignal): Promise<User> {
    return request<User>(`${BASE_URL}/user/${id}`, signal);
}
