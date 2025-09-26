import { useQuery } from '@tanstack/react-query';
import { Story, User, PollResult } from '../types';

const BASE_URL = 'https://node-hnapi.herokuapp.com';

const fetchJson = async <T>(url: string): Promise<T> => {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
};

export const useFeed = (feedType: string, page: number) => {
    return useQuery({
        queryKey: ['feed', feedType, page],
        queryFn: () => fetchJson<Story[]>(`${BASE_URL}/${feedType}?page=${page}`),
    });
};

export const useItem = (id: number) => {
    return useQuery({
        queryKey: ['item', id],
        queryFn: async () => {
            const story = await fetchJson<Story>(`${BASE_URL}/item/${id}`);
            if (story.type === 'poll') {
                const pollPromises = story.poll.map((_, index) =>
                    fetchJson<PollResult>(`${BASE_URL}/item/${story.id + index + 1}`)
                );
                const pollResults = await Promise.all(pollPromises);
                story.poll = pollResults;
                story.poll_votes_count = pollResults.reduce((sum, poll) => sum + poll.points, 0);
            }
            return story;
        },
    });
};

export const useUser = (id: string) => {
    return useQuery({
        queryKey: ['user', id],
        queryFn: () => fetchJson<User>(`${BASE_URL}/user/${id}`),
    });
};
