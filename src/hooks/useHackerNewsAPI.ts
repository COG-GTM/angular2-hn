import { useState, useEffect } from 'react';
import { Story } from '../types/story';
import { User } from '../types/user';
import { PollResult } from '../types/poll-result';

const BASE_URL = 'https://node-hnapi.herokuapp.com';

export const useHackerNewsAPI = () => {
  const fetchFeed = async (feedType: string, page: number): Promise<Story[]> => {
    const response = await fetch(`${BASE_URL}/${feedType}?page=${page}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch feed: ${response.statusText}`);
    }
    return response.json();
  };

  const fetchItemContent = async (id: number): Promise<Story> => {
    const response = await fetch(`${BASE_URL}/item/${id}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch item: ${response.statusText}`);
    }
    const story: Story = await response.json();
    
    if (story.type === 'poll' && story.poll) {
      let numberOfPollOptions = story.poll.length;
      story.poll_votes_count = 0;
      
      const pollPromises: Promise<PollResult>[] = [];
      for (let i = 1; i <= numberOfPollOptions; i++) {
        pollPromises.push(fetchPollContent(story.id + i));
      }
      
      try {
        const pollResults = await Promise.all(pollPromises);
        pollResults.forEach((pollResult, index) => {
          story.poll[index] = pollResult;
          story.poll_votes_count += pollResult.points;
        });
      } catch (error) {
        console.error('Error fetching poll results:', error);
      }
    }
    
    return story;
  };

  const fetchPollContent = async (id: number): Promise<PollResult> => {
    const response = await fetch(`${BASE_URL}/item/${id}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch poll content: ${response.statusText}`);
    }
    return response.json();
  };

  const fetchUser = async (id: string): Promise<User> => {
    const response = await fetch(`${BASE_URL}/user/${id}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch user: ${response.statusText}`);
    }
    return response.json();
  };

  return { fetchFeed, fetchItemContent, fetchUser };
};
