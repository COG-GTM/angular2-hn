import { useState, useEffect } from 'react';
import { Story } from '../types/Story';
import { User } from '../types/User';

const BASE_URL = 'https://node-hnapi.herokuapp.com';

export function useFeed(feedType: string, page: number) {
  const [items, setItems] = useState<Story[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    setItems(null);
    setLoading(true);
    setError('');

    fetch(`${BASE_URL}/${feedType}?page=${page}`, { signal: controller.signal })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data: Story[]) => {
        setItems(data);
        setLoading(false);
        window.scrollTo(0, 0);
      })
      .catch(err => {
        if (err.name !== 'AbortError') {
          setError(`Could not load ${feedType} stories.`);
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, [feedType, page]);

  return { items, loading, error };
}

export function useItemDetails(id: number) {
  const [item, setItem] = useState<Story | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    setItem(null);
    setLoading(true);
    setError('');

    fetch(`${BASE_URL}/item/${id}`, { signal: controller.signal })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(async (story: Story) => {
        if (story.poll && story.poll.length > 0) {
          let pollVotesCount = 0;
          const pollPromises = story.poll.map((_pollItem, i) =>
            fetch(`${BASE_URL}/item/${story.id + i + 1}`, { signal: controller.signal })
              .then(res => res.json())
          );
          const pollResults = await Promise.all(pollPromises);
          for (const pollResult of pollResults) {
            if (pollResult.points) {
              pollVotesCount += pollResult.points;
            }
          }
          story.poll_votes_count = pollVotesCount;
        }
        setItem(story);
        setLoading(false);
        window.scrollTo(0, 0);
      })
      .catch(err => {
        if (err.name !== 'AbortError') {
          setError('Could not load item comments.');
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, [id]);

  return { item, loading, error };
}

export function useUser(id: string) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    setUser(null);
    setLoading(true);
    setError('');

    fetch(`${BASE_URL}/user/${id}`, { signal: controller.signal })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data: User) => {
        setUser(data);
        setLoading(false);
      })
      .catch(err => {
        if (err.name !== 'AbortError') {
          setError(`Could not load user ${id}.`);
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, [id]);

  return { user, loading, error };
}
