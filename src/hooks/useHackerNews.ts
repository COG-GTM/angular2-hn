import { useQuery } from '@tanstack/react-query';
import { Story, User, PollResult } from '../types';

const BASE_URL = 'https://node-hnapi.herokuapp.com';

async function fetchFeed(feedType: string, page: number): Promise<Story[]> {
  const response = await fetch(`${BASE_URL}/${feedType}?page=${page}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${feedType} feed`);
  }
  return response.json();
}

async function fetchPollContent(id: number): Promise<PollResult> {
  const response = await fetch(`${BASE_URL}/item/${id}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch poll content ${id}`);
  }
  return response.json();
}

async function fetchItemContent(id: number): Promise<Story> {
  const response = await fetch(`${BASE_URL}/item/${id}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch item ${id}`);
  }
  const story: Story = await response.json();

  if (story.type === 'poll' && story.poll && story.poll.length > 0) {
    const numberOfPollOptions = story.poll.length;
    let pollVotesCount = 0;
    const pollResults: PollResult[] = [];

    for (let i = 1; i <= numberOfPollOptions; i++) {
      try {
        const pollResult = await fetchPollContent(story.id + i);
        pollResults.push(pollResult);
        pollVotesCount += pollResult.points;
      } catch {
        console.error(`Failed to fetch poll option ${i}`);
      }
    }

    story.poll = pollResults;
    story.poll_votes_count = pollVotesCount;
  }

  return story;
}

async function fetchUser(id: string): Promise<User> {
  const response = await fetch(`${BASE_URL}/user/${id}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch user ${id}`);
  }
  return response.json();
}

export function useFeed(feedType: string, page: number) {
  return useQuery({
    queryKey: ['feed', feedType, page],
    queryFn: () => fetchFeed(feedType, page),
    staleTime: 1000 * 60 * 5,
  });
}

export function useItemContent(id: number) {
  return useQuery({
    queryKey: ['item', id],
    queryFn: () => fetchItemContent(id),
    staleTime: 1000 * 60 * 5,
  });
}

export function useUser(id: string) {
  return useQuery({
    queryKey: ['user', id],
    queryFn: () => fetchUser(id),
    staleTime: 1000 * 60 * 5,
    enabled: !!id,
  });
}
