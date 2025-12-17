import { useState, useCallback } from 'react';

export function useHackerNewsAPI() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const baseUrl = 'https://node-hnapi.herokuapp.com';

  const fetchFeed = useCallback(async (feedType, page) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${baseUrl}/${feedType}?page=${page}`);
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchItemContent = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${baseUrl}/item/${id}`);
      if (!response.ok) throw new Error('Failed to fetch item');
      const story = await response.json();

      if (story.type === 'poll' && story.poll && story.poll.length > 0) {
        const numberOfPollOptions = story.poll.length;
        const pollPromises = [];
        
        for (let i = 1; i <= numberOfPollOptions; i++) {
          pollPromises.push(
            fetch(`${baseUrl}/item/${story.id + i}`).then(r => r.json())
          );
        }

        const pollResults = await Promise.all(pollPromises);
        story.poll = pollResults;
        story.poll_votes_count = pollResults.reduce((sum, poll) => sum + (poll.points || 0), 0);
      }

      return story;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUser = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${baseUrl}/user/${id}`);
      if (!response.ok) throw new Error('Failed to fetch user');
      const data = await response.json();
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { fetchFeed, fetchItemContent, fetchUser, loading, error };
}
