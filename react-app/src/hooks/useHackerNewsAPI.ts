import { useState, useEffect, useCallback } from 'react';
import { Story, User, PollResult } from '../types';

const BASE_URL = 'https://node-hnapi.herokuapp.com';

interface APIState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

function useFetch<T>(url: string | null): APIState<T> {
  const [state, setState] = useState<APIState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  useEffect(() => {
    if (!url) return;

    const abortController = new AbortController();
    
    setState(prev => ({ ...prev, loading: true, error: null }));

    fetch(url, { signal: abortController.signal })
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        if (!abortController.signal.aborted) {
          setState({ data, loading: false, error: null });
        }
      })
      .catch(err => {
        if (!abortController.signal.aborted) {
          setState(prev => ({ 
            ...prev, 
            loading: false, 
            error: err.message || 'An error occurred' 
          }));
        }
      });

    return () => {
      abortController.abort();
    };
  }, [url]);

  return state;
}

export function useHackerNewsAPI() {
  const fetchFeed = useCallback((feedType: string, page: number) => {
    return useFetch<Story[]>(`${BASE_URL}/${feedType}?page=${page}`);
  }, []);

  const fetchItemContent = useCallback((id: number) => {
    const { data, loading, error } = useFetch<Story>(`${BASE_URL}/item/${id}`);
    
    const [processedStory, setProcessedStory] = useState<Story | null>(null);
    
    useEffect(() => {
      if (data && data.type === 'poll') {
        const story = { ...data };
        const numberOfPollOptions = story.poll.length;
        story.poll_votes_count = 0;
        
        const fetchPollPromises: Promise<PollResult>[] = [];
        for (let i = 1; i <= numberOfPollOptions; i++) {
          fetchPollPromises.push(
            fetch(`${BASE_URL}/item/${story.id + i}`)
              .then(res => res.json())
              .then((pollResult: PollResult) => {
                story.poll[i - 1] = pollResult;
                story.poll_votes_count += pollResult.points;
                return pollResult;
              })
          );
        }
        
        Promise.all(fetchPollPromises).then(() => {
          setProcessedStory(story);
        });
      } else {
        setProcessedStory(data);
      }
    }, [data]);
    
    return { data: processedStory, loading, error };
  }, []);

  const fetchPollContent = useCallback((id: number) => {
    return useFetch<PollResult>(`${BASE_URL}/item/${id}`);
  }, []);

  const fetchUser = useCallback((id: string) => {
    return useFetch<User>(`${BASE_URL}/user/${id}`);
  }, []);

  return {
    fetchFeed,
    fetchItemContent,
    fetchPollContent,
    fetchUser,
  };
}
