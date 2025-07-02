import { useState, useEffect } from 'react';
import { Story, User } from '../types/story';
import { hackerNewsApi } from '../services/hackerNewsApi';

export function useFeed(feedType: string, page: number) {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchFeed = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const data = await hackerNewsApi.fetchFeed(feedType, page);
        setStories(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch feed'));
      } finally {
        setLoading(false);
      }
    };

    fetchFeed();
  }, [feedType, page]);

  return { stories, loading, error };
}

export function useStory(id: number) {
  const [story, setStory] = useState<Story | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchStory = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const data = await hackerNewsApi.fetchItemContent(id);
        setStory(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch story'));
      } finally {
        setLoading(false);
      }
    };

    fetchStory();
  }, [id]);

  return { story, loading, error };
}

export function useUser(id: string) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchUser = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const data = await hackerNewsApi.fetchUser(id);
        setUser(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch user'));
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  return { user, loading, error };
}
