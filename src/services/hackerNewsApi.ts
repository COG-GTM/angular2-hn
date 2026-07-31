import { PollResult, Story, User } from '../types';

const BASE_URL = 'https://node-hnapi.herokuapp.com';

async function get<T>(path: string, signal?: AbortSignal): Promise<T> {
    const response = await fetch(`${BASE_URL}${path}`, { signal });
    if (!response.ok) {
        throw new Error(`Request to ${path} failed with status ${response.status}`);
    }
    return (await response.json()) as T;
}

export function fetchFeed(feedType: string, page: number, signal?: AbortSignal): Promise<Story[]> {
    return get<Story[]>(`/${feedType}?page=${page}`, signal);
}

export function fetchPollContent(id: number, signal?: AbortSignal): Promise<PollResult> {
    return get<PollResult>(`/item/${id}`, signal);
}

export function fetchUser(id: string, signal?: AbortSignal): Promise<User> {
    return get<User>(`/user/${id}`, signal);
}

// Poll options live at consecutive item ids after the poll itself, so they are
// fetched separately and folded back into the story. An option that cannot be
// loaded keeps its placeholder rather than failing the whole story.
export async function fetchItemContent(id: number, signal?: AbortSignal): Promise<Story> {
    const story = await get<Story>(`/item/${id}`, signal);

    if (story.type !== 'poll' || !story.poll) {
        return story;
    }

    const results = await Promise.all(
        story.poll.map((option, index) =>
            fetchPollContent(story.id + index + 1, signal).catch((error: unknown) => {
                if (error instanceof Error && error.name === 'AbortError') {
                    throw error;
                }
                return { ...option, points: 0 };
            })
        )
    );

    return {
        ...story,
        poll: results,
        poll_votes_count: results.reduce((total, result) => total + result.points, 0),
    };
}
