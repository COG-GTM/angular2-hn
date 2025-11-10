import { useState, useEffect, useCallback } from 'react';
import { Story, User, PollResult } from '../types';

const BASE_URL = 'https://node-hnapi.herokuapp.com';

interface FetchState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

interface AbortableFetch<T> {
  promise: Promise<T>;
  abort: () => void;
}

function createAbortableFetch<T>(url: string, options?: RequestInit): AbortableFetch<T> {
  const abortController = new AbortController();
  
  const promise = fetch(url, {
    ...options,
    signal: abortController.signal,
  })
    .then(res => {
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return res.json();
    })
    .then(data => data as T);

  return {
    promise,
    abort: () => abortController.abort(),
  };
}

export async function fetchFeed(feedType: string, page: number): Promise<Story[]> {
  const response = await fetch(`${BASE_URL}/${feedType}?page=${page}`);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
}

export async function fetchItem(id: number): Promise<Story> {
  const response = await fetch(`${BASE_URL}/item/${id}`);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const story: Story = await response.json();
  
  if (story.type === 'poll') {
    const numberOfPollOptions = story.poll.length;
    story.poll_votes_count = 0;
    
    const pollPromises = [];
    for (let i = 1; i <= numberOfPollOptions; i++) {
      pollPromises.push(fetchPoll(story.id + i));
    }
    
    const pollResults = await Promise.all(pollPromises);
    pollResults.forEach((pollResult, index) => {
      story.poll[index] = pollResult;
      story.poll_votes_count += pollResult.points;
    });
  }
  
  return story;
}

export async function fetchPoll(id: number): Promise<PollResult> {
  const response = await fetch(`${BASE_URL}/item/${id}`);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
}

export async function fetchUser(id: string): Promise<User> {
  const response = await fetch(`${BASE_URL}/user/${id}`);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
}

export function useFetchFeed(feedType: string, page: number): FetchState<Story[]> {
  const [state, setState] = useState<FetchState<Story[]>>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let abortableFetch: AbortableFetch<Story[]> | null = null;

    setState({ data: null, loading: true, error: null });

    abortableFetch = createAbortableFetch<Story[]>(
      `${BASE_URL}/${feedType}?page=${page}`
    );

    abortableFetch.promise
      .then(data => {
        setState({ data, loading: false, error: null });
      })
      .catch(error => {
        if (error.name !== 'AbortError') {
          setState({ data: null, loading: false, error });
        }
      });

    return () => {
      if (abortableFetch) {
        abortableFetch.abort();
      }
    };
  }, [feedType, page]);

  return state;
}

export function useFetchItem(id: number): FetchState<Story> {
  const [state, setState] = useState<FetchState<Story>>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    setState({ data: null, loading: true, error: null });

    fetchItem(id)
      .then(data => {
        if (!cancelled) {
          setState({ data, loading: false, error: null });
        }
      })
      .catch(error => {
        if (!cancelled) {
          setState({ data: null, loading: false, error });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  return state;
}

export function useFetchUser(id: string): FetchState<User> {
  const [state, setState] = useState<FetchState<User>>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let abortableFetch: AbortableFetch<User> | null = null;

    setState({ data: null, loading: true, error: null });

    abortableFetch = createAbortableFetch<User>(`${BASE_URL}/user/${id}`);

    abortableFetch.promise
      .then(data => {
        setState({ data, loading: false, error: null });
      })
      .catch(error => {
        if (error.name !== 'AbortError') {
          setState({ data: null, loading: false, error });
        }
      });

    return () => {
      if (abortableFetch) {
        abortableFetch.abort();
      }
    };
  }, [id]);

  return state;
}

export function useFetchPoll(id: number): FetchState<PollResult> {
  const [state, setState] = useState<FetchState<PollResult>>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let abortableFetch: AbortableFetch<PollResult> | null = null;

    setState({ data: null, loading: true, error: null });

    abortableFetch = createAbortableFetch<PollResult>(`${BASE_URL}/item/${id}`);

    abortableFetch.promise
      .then(data => {
        setState({ data, loading: false, error: null });
      })
      .catch(error => {
        if (error.name !== 'AbortError') {
          setState({ data: null, loading: false, error });
        }
      });

    return () => {
      if (abortableFetch) {
        abortableFetch.abort();
      }
    };
  }, [id]);

  return state;
}
