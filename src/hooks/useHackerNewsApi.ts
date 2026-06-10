import { useEffect, useState } from 'react';
import { Story } from '../models/story';
import { User } from '../models/user';
import { PollResult } from '../models/poll-result';

const baseUrl = 'https://node-hnapi.herokuapp.com';

async function getJson<T>(url: string): Promise<T> {
    const res = await fetch(url);
    return (await res.json()) as T;
}

export function fetchFeed(feedType: string, page: number): Promise<Story[]> {
    return getJson<Story[]>(`${baseUrl}/${feedType}?page=${page}`);
}

export function fetchPollContent(id: number): Promise<PollResult> {
    return getJson<PollResult>(`${baseUrl}/item/${id}`);
}

export async function fetchItemContent(id: number): Promise<Story> {
    const story = await getJson<Story>(`${baseUrl}/item/${id}`);
    if (story.type === 'poll' && story.poll) {
        const numberOfPollOptions = story.poll.length;
        story.poll_votes_count = 0;
        for (let i = 1; i <= numberOfPollOptions; i++) {
            const pollResults = await fetchPollContent(story.id + i);
            story.poll[i - 1] = pollResults;
            story.poll_votes_count += pollResults.points;
        }
    }
    return story;
}

export function fetchUser(id: string): Promise<User> {
    return getJson<User>(`${baseUrl}/user/${id}`);
}

interface ApiFetchState<T> {
    data: T | null;
    error: string;
}

/**
 * Generic data-fetching hook. Re-runs whenever `deps` change. `errorMessage`
 * mirrors the per-view error strings used by the original Angular components.
 */
export function useApiFetch<T>(
    fetchFn: () => Promise<T>,
    deps: ReadonlyArray<unknown>,
    errorMessage: string,
    onSuccess?: () => void,
): ApiFetchState<T> {
    const [data, setData] = useState<T | null>(null);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        let cancelled = false;
        setData(null);
        setError('');
        fetchFn()
            .then((result) => {
                if (cancelled) return;
                setData(result);
                onSuccess?.();
            })
            .catch(() => {
                if (cancelled) return;
                setError(errorMessage);
            });
        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps);

    return { data, error };
}
