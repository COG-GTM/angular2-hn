import { useState, useEffect } from 'react';
import { Story, User, PollResult } from '../types';

const BASE_URL = 'https://node-hnapi.herokuapp.com';

async function fetchData<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
}

export function useFetchFeed(feedType: string, page: number) {
  const [data, setData] = useState<Story[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeed = async () => {
      setLoading(true);
      setError(null);
      try {
        const stories = await fetchData<Story[]>(`${BASE_URL}/${feedType}?page=${page}`);
        setData(stories);
      } catch (err) {
        setError(`Could not load ${feedType} stories.`);
      } finally {
        setLoading(false);
      }
    };

    fetchFeed();
  }, [feedType, page]);

  return { data, loading, error };
}

export function useFetchItemContent(id: number) {
  const [data, setData] = useState<Story | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchItem = async () => {
      setLoading(true);
      setError(null);
      try {
        const story = await fetchData<Story>(`${BASE_URL}/item/${id}`);
        
        if (story.type === 'poll') {
          const numberOfPollOptions = story.poll.length;
          story.poll_votes_count = 0;
          
          for (let i = 1; i <= numberOfPollOptions; i++) {
            try {
              const pollResult = await fetchData<PollResult>(`${BASE_URL}/item/${story.id + i}`);
              story.poll[i - 1] = pollResult;
              story.poll_votes_count += pollResult.points;
            } catch (pollError) {
              console.error(`Error fetching poll option ${i}:`, pollError);
            }
          }
        }
        
        setData(story);
      } catch (err) {
        setError('Could not load item comments.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchItem();
    }
  }, [id]);

  return { data, loading, error };
}

export function useFetchUser(id: string) {
  const [data, setData] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      setError(null);
      try {
        const user = await fetchData<User>(`${BASE_URL}/user/${id}`);
        setData(user);
      } catch (err) {
        setError(`Could not load user ${id}.`);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchUser();
    }
  }, [id]);

  return { data, loading, error };
}
