import { useState, useCallback } from 'react';
import { Story, User, PollResult } from '../models';

const BASE_URL = 'https://node-hnapi.herokuapp.com';

export function useHackerNewsAPI() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFeed = useCallback(async (feedType: string, page: number): Promise<Story[]> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${BASE_URL}/${feedType}?page=${page}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch ${feedType} feed`);
      }
      const data = await response.json();
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPollContent = useCallback(async (id: number): Promise<PollResult> => {
    const response = await fetch(`${BASE_URL}/item/${id}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch poll content`);
    }
    return response.json();
  }, []);

  const fetchItemContent = useCallback(async (id: number): Promise<Story> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${BASE_URL}/item/${id}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch item content`);
      }
      const story: Story = await response.json();
      
      if (story.type === 'poll' && story.poll) {
        const numberOfPollOptions = story.poll.length;
        story.poll_votes_count = 0;
        
        const pollPromises = [];
        for (let i = 1; i <= numberOfPollOptions; i++) {
          pollPromises.push(fetchPollContent(story.id + i));
        }
        
        const pollResults = await Promise.all(pollPromises);
        pollResults.forEach((pollResult, index) => {
          story.poll[index] = pollResult;
          story.poll_votes_count += pollResult.points;
        });
      }
      
      return story;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchPollContent]);

  const fetchUser = useCallback(async (id: string): Promise<User> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${BASE_URL}/user/${id}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch user`);
      }
      return response.json();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    fetchFeed,
    fetchItemContent,
    fetchUser
  };
}
