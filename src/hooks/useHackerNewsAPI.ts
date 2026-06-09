import { useState, useEffect, useCallback } from 'react';
import { Story } from '../models/story';
import { User } from '../models/user';
import { PollResult } from '../models/poll-result';

const BASE_URL = 'https://node-hnapi.herokuapp.com';

export async function fetchFeed(feedType: string, page: number): Promise<Story[]> {
    const res = await fetch(`${BASE_URL}/${feedType}?page=${page}`);
    return res.json();
}

export async function fetchPollContent(id: number): Promise<PollResult> {
    const res = await fetch(`${BASE_URL}/item/${id}`);
    return res.json();
}

export async function fetchItemContent(id: number): Promise<Story> {
    const res = await fetch(`${BASE_URL}/item/${id}`);
    const story: Story = await res.json();
    if (story.type === 'poll' && story.poll) {
        const pollPromises = story.poll.map((_, i) => fetchPollContent(story.id + i + 1));
        const pollResults = await Promise.all(pollPromises);
        story.poll = pollResults;
        story.poll_votes_count = pollResults.reduce((sum, p) => sum + p.points, 0);
    }
    return story;
}

export async function fetchUser(id: string): Promise<User> {
    const res = await fetch(`${BASE_URL}/user/${id}`);
    return res.json();
}

export function useFeed(feedType: string, page: number) {
    const [items, setItems] = useState<Story[] | null>(null);
    const [error, setError] = useState('');

    useEffect(() => {
        let cancelled = false;
        setItems(null);
        setError('');
        fetchFeed(feedType, page)
            .then((data) => {
                if (!cancelled) setItems(data);
            })
            .catch(() => {
                if (!cancelled) setError(`Could not load ${feedType} stories.`);
            });
        return () => {
            cancelled = true;
        };
    }, [feedType, page]);

    return { items, error };
}

export function useItem(id: number) {
    const [item, setItem] = useState<Story | null>(null);
    const [error, setError] = useState('');

    const load = useCallback(() => {
        setItem(null);
        setError('');
        fetchItemContent(id)
            .then(setItem)
            .catch(() => setError('Could not load item comments.'));
    }, [id]);

    useEffect(() => {
        load();
    }, [load]);

    return { item, error };
}

export function useUser(id: string) {
    const [user, setUser] = useState<User | null>(null);
    const [error, setError] = useState('');

    useEffect(() => {
        let cancelled = false;
        setUser(null);
        setError('');
        fetchUser(id)
            .then((data) => {
                if (!cancelled) setUser(data);
            })
            .catch(() => {
                if (!cancelled) setError(`Could not load user ${id}.`);
            });
        return () => {
            cancelled = true;
        };
    }, [id]);

    return { user, error };
}
