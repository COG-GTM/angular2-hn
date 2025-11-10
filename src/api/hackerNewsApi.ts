import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { Story, User, PollResult } from '../types';

const BASE_URL = 'https://node-hnapi.herokuapp.com';

async function customFetch<T>(url: string, signal?: AbortSignal): Promise<T> {
  try {
    const response = await fetch(url, { signal });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data as T;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request was cancelled');
    }
    throw error;
  }
}

export const fetchFeed = async (
  feedType: string,
  page: number,
  signal?: AbortSignal
): Promise<Story[]> => {
  return customFetch<Story[]>(`${BASE_URL}/${feedType}?page=${page}`, signal);
};

export const fetchItem = async (
  id: number,
  signal?: AbortSignal
): Promise<Story> => {
  const story = await customFetch<Story>(`${BASE_URL}/item/${id}`, signal);
  
  if (story.type === 'poll' && story.poll && story.poll.length > 0) {
    const numberOfPollOptions = story.poll.length;
    story.poll_votes_count = 0;
    
    const pollPromises = [];
    for (let i = 1; i <= numberOfPollOptions; i++) {
      pollPromises.push(fetchPoll(story.id + i, signal));
    }
    
    const pollResults = await Promise.all(pollPromises);
    pollResults.forEach((pollResult, index) => {
      story.poll[index] = pollResult;
      story.poll_votes_count += pollResult.points;
    });
  }
  
  return story;
};

export const fetchPoll = async (
  id: number,
  signal?: AbortSignal
): Promise<PollResult> => {
  return customFetch<PollResult>(`${BASE_URL}/item/${id}`, signal);
};

export const fetchUser = async (
  id: string,
  signal?: AbortSignal
): Promise<User> => {
  return customFetch<User>(`${BASE_URL}/user/${id}`, signal);
};

export const useFetchFeed = (
  feedType: string,
  page: number
): UseQueryResult<Story[], Error> => {
  return useQuery<Story[], Error>({
    queryKey: ['feed', feedType, page],
    queryFn: ({ signal }) => fetchFeed(feedType, page, signal),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  });
};

export const useFetchItem = (
  id: number,
  enabled: boolean = true
): UseQueryResult<Story, Error> => {
  return useQuery<Story, Error>({
    queryKey: ['item', id],
    queryFn: ({ signal }) => fetchItem(id, signal),
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useFetchUser = (
  id: string,
  enabled: boolean = true
): UseQueryResult<User, Error> => {
  return useQuery<User, Error>({
    queryKey: ['user', id],
    queryFn: ({ signal }) => fetchUser(id, signal),
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useFetchPoll = (
  id: number,
  enabled: boolean = true
): UseQueryResult<PollResult, Error> => {
  return useQuery<PollResult, Error>({
    queryKey: ['poll', id],
    queryFn: ({ signal }) => fetchPoll(id, signal),
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};
