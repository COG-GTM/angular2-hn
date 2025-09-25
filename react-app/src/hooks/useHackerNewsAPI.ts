import { useState, useEffect, useCallback } from 'react';
import { Story, User, PollResult } from '../types';

const BASE_URL = 'https://node-hnapi.herokuapp.com';

function createCancellableFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const signal = controller.signal;

  const fetchPromise = fetch(url, { ...options, signal })
    .then(res => {
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return res.json();
    });

  (fetchPromise as any).cancel = () => controller.abort();
  return fetchPromise;
}

export function useFetchFeed(feedType: string, page: number) {
  const [data, setData] = useState<Story[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFeed = useCallback(async () => {
    if (!feedType) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const url = `${BASE_URL}/${feedType}?page=${page}`;
      const stories = await createCancellableFetch<Story[]>(url);
      setData(stories);
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setError(`Could not load ${feedType} stories.`);
      }
    } finally {
      setLoading(false);
    }
  }, [feedType, page]);

  useEffect(() => {
    fetchFeed();
  }, [fetchFeed]);

  return { data, loading, error, refetch: fetchFeed };
}

export function useFetchItemContent(id: number) {
  const [data, setData] = useState<Story | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPollContent = async (pollId: number): Promise<PollResult> => {
    return createCancellableFetch<PollResult>(`${BASE_URL}/item/${pollId}`);
  };

  const fetchItem = useCallback(async () => {
    if (!id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const story = await createCancellableFetch<Story>(`${BASE_URL}/item/${id}`);
      
      if (story.type === 'poll' && story.poll) {
        const numberOfPollOptions = story.poll.length;
        story.poll_votes_count = 0;
        
        const pollPromises: Promise<PollResult>[] = [];
        for (let i = 1; i <= numberOfPollOptions; i++) {
          pollPromises.push(fetchPollContent(story.id + i));
        }
        
        const pollResults = await Promise.all(pollPromises);
        pollResults.forEach((pollResult, index) => {
          story.poll[index] = pollResult;
          story.poll_votes_count += pollResult.points;
        });
      }
      
      setData(story);
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setError('Could not load item content.');
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchItem();
  }, [fetchItem]);

  return { data, loading, error, refetch: fetchItem };
}

export function useFetchUser(userId: string) {
  const [data, setData] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = useCallback(async () => {
    if (!userId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const user = await createCancellableFetch<User>(`${BASE_URL}/user/${userId}`);
      setData(user);
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setError('Could not load user data.');
      }
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return { data, loading, error, refetch: fetchUser };
}
