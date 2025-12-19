import { useCallback } from 'react';
import { Story, User, PollResult } from '../models';

const BASE_URL = 'https://node-hnapi.herokuapp.com';

export const useHackerNewsAPI = () => {
  const fetchFeed = useCallback(async (feedType: string, page: number): Promise<Story[]> => {
    const response = await fetch(`${BASE_URL}/${feedType}?page=${page}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${feedType} feed`);
    }
    return response.json();
  }, []);

  const fetchItemContent = useCallback(async (id: number): Promise<Story> => {
    const response = await fetch(`${BASE_URL}/item/${id}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch item ${id}`);
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
  }, []);

  const fetchPollContent = useCallback(async (id: number): Promise<PollResult> => {
    const response = await fetch(`${BASE_URL}/item/${id}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch poll ${id}`);
    }
    return response.json();
  }, []);

  const fetchUser = useCallback(async (id: string): Promise<User> => {
    const response = await fetch(`${BASE_URL}/user/${id}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch user ${id}`);
    }
    return response.json();
  }, []);

  return { fetchFeed, fetchItemContent, fetchPollContent, fetchUser };
};
