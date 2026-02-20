import { useState, useEffect } from 'react';
import type { Story, User, PollResult } from '../types';

const BASE_URL = 'https://node-hnapi.herokuapp.com';

async function apiFetch<T>(url: string, signal?: AbortSignal): Promise<T> {
  const res = await fetch(url, { signal });
  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`);
  }
  return res.json();
}

async function fetchPollContent(id: number, signal?: AbortSignal): Promise<PollResult> {
  return apiFetch<PollResult>(`${BASE_URL}/item/${id}`, signal);
}

export function useFeed(feedType: string, page: number) {
  const [items, setItems] = useState<Story[] | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    setItems(null);
    setError('');

    apiFetch<Story[]>(`${BASE_URL}/${feedType}?page=${page}`, controller.signal)
      .then(data => setItems(data))
      .catch(err => {
        if (!controller.signal.aborted) {
          setError(`Could not load ${feedType} stories.`);
          console.error(err);
        }
      });

    return () => controller.abort();
  }, [feedType, page]);

  return { items, error };
}

export function useItemContent(id: number) {
  const [item, setItem] = useState<Story | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    setItem(null);
    setError('');

    apiFetch<Story>(`${BASE_URL}/item/${id}`, controller.signal)
      .then(async (story) => {
        if (story.type === 'poll' && story.poll) {
          let pollVotesCount = 0;
          const pollResults: PollResult[] = [];
          for (let i = 1; i <= story.poll.length; i++) {
            try {
              const result = await fetchPollContent(story.id + i, controller.signal);
              pollResults.push(result);
              pollVotesCount += result.points;
            } catch {
              if (controller.signal.aborted) break;
            }
          }
          story.poll = pollResults;
          story.poll_votes_count = pollVotesCount;
        }
        if (!controller.signal.aborted) {
          setItem(story);
        }
      })
      .catch(err => {
        if (!controller.signal.aborted) {
          setError('Could not load item comments.');
          console.error(err);
        }
      });

    return () => controller.abort();
  }, [id]);

  return { item, error };
}

export function useUser(id: string) {
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    setUser(null);
    setError('');

    apiFetch<User>(`${BASE_URL}/user/${id}`, controller.signal)
      .then(data => setUser(data))
      .catch(err => {
        if (!controller.signal.aborted) {
          setError(`Could not load user ${id}.`);
          console.error(err);
        }
      });

    return () => controller.abort();
  }, [id]);

  return { user, error };
}
