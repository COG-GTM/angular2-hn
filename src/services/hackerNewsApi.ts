import type { PollResult, Story, User } from '../models';

const baseUrl = 'https://node-hnapi.herokuapp.com';

async function getJson<T>(url: string): Promise<T> {
    const res = await fetch(url);
    if (!res.ok) {
        throw new Error(`Request failed with status ${res.status}`);
    }
    const data: unknown = await res.json();
    // node-hnapi answers unknown ids with 200 + {"error": "..."} rather than a 404.
    if (data && typeof data === 'object' && 'error' in data) {
        throw new Error(String((data as { error: unknown }).error));
    }
    return data as T;
}

export function fetchFeed(feedType: string, page: number): Promise<Story[]> {
    return getJson<Story[]>(`${baseUrl}/${feedType}?page=${page}`);
}

export async function fetchItemContent(id: number): Promise<Story> {
    const story = await getJson<Story>(`${baseUrl}/item/${id}`);
    if (story.type === 'poll') {
        // Poll options are separate items; a failed option must not hide the poll itself.
        const results = await Promise.allSettled(story.poll.map((_, i) => fetchPollContent(story.id + i + 1)));
        story.poll = results.map((result, i) =>
            result.status === 'fulfilled' ? result.value : { ...story.poll[i], points: story.poll[i].points ?? 0 }
        );
        story.poll_votes_count = story.poll.reduce((sum, option) => sum + option.points, 0);
    }
    return story;
}

export function fetchPollContent(id: number): Promise<PollResult> {
    return getJson<PollResult>(`${baseUrl}/item/${id}`);
}

export function fetchUser(id: string): Promise<User> {
    return getJson<User>(`${baseUrl}/user/${id}`);
}
