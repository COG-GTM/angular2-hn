import { useQuery } from '@tanstack/react-query';

const BASE_URL = 'https://node-hnapi.herokuapp.com';

export interface PollResult {
    points: number;
    content: string;
}

export interface Comment {
    id: number;
    user: string;
    time: number;
    time_ago: string;
    content: string;
    comments: Comment[];
    level: number;
    deleted?: boolean;
    dead?: boolean;
}

export type FeedType = 'news' | 'newest' | 'ask' | 'show' | 'jobs';

export interface Story {
    id: number;
    title: string;
    points: number;
    user: string;
    time: number;
    time_ago: string;
    type: FeedType | 'poll' | 'comment' | 'link';
    url: string;
    domain: string;
    comments: Comment[];
    comments_count: number;
    poll: PollResult[];
    poll_votes_count: number;
    deleted: boolean;
    dead: boolean;
}

export interface User {
    id: string;
    created_time: number;
    created: string;
    karma: number;
    avg: number;
    about: string;
}

async function fetchWithAbort<T>(url: string, signal?: AbortSignal): Promise<T> {
    const response = await fetch(url, { signal });
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
}

async function fetchPollContent(id: number, signal?: AbortSignal): Promise<PollResult> {
    return fetchWithAbort<PollResult>(`${BASE_URL}/item/${id}`, signal);
}

export function useFetchFeed(feedType: string, page: number) {
    return useQuery<Story[]>({
        queryKey: ['feed', feedType, page],
        queryFn: async ({ signal }) => {
            return fetchWithAbort<Story[]>(`${BASE_URL}/${feedType}?page=${page}`, signal);
        },
    });
}

export function useFetchItem(id: number) {
    return useQuery<Story>({
        queryKey: ['item', id],
        queryFn: async ({ signal }) => {
            const story = await fetchWithAbort<Story>(`${BASE_URL}/item/${id}`, signal);

            if (story.type === 'poll' && story.poll && story.poll.length > 0) {
                const numberOfPollOptions = story.poll.length;
                story.poll_votes_count = 0;

                const pollPromises = Array.from({ length: numberOfPollOptions }, (_, i) =>
                    fetchPollContent(story.id + i + 1, signal)
                );

                const pollResults = await Promise.all(pollPromises);

                pollResults.forEach((pollResult, i) => {
                    story.poll[i] = pollResult;
                    story.poll_votes_count += pollResult.points;
                });
            }

            return story;
        },
        enabled: id > 0,
    });
}

export function useFetchUser(id: string) {
    return useQuery<User>({
        queryKey: ['user', id],
        queryFn: async ({ signal }) => {
            return fetchWithAbort<User>(`${BASE_URL}/user/${id}`, signal);
        },
        enabled: !!id,
    });
}
