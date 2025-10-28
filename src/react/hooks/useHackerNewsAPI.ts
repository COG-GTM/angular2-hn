import { Story, User, PollResult } from '../types';

const BASE_URL = 'https://node-hnapi.herokuapp.com';

export const useHackerNewsAPI = () => {
  const fetchFeed = async (feedType: string, page: number): Promise<Story[]> => {
    const response = await fetch(`${BASE_URL}/${feedType}?page=${page}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${feedType} feed`);
    }
    return response.json();
  };

  const fetchItemContent = async (id: number): Promise<Story> => {
    const response = await fetch(`${BASE_URL}/item/${id}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch item ${id}`);
    }
    const story: Story = await response.json();

    if (story.type === 'poll' && story.poll && story.poll.length > 0) {
      const numberOfPollOptions = story.poll.length;
      
      const pollItemIds = Array.from(
        { length: numberOfPollOptions },
        (_, i) => story.id + i + 1
      );

      const pollResults = await Promise.all(
        pollItemIds.map(pollId => fetchPollContent(pollId))
      );

      story.poll = pollResults;
      story.poll_votes_count = pollResults.reduce(
        (total, result) => total + result.points,
        0
      );
    }

    return story;
  };

  const fetchPollContent = async (id: number): Promise<PollResult> => {
    const response = await fetch(`${BASE_URL}/item/${id}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch poll item ${id}`);
    }
    return response.json();
  };

  const fetchUser = async (id: string): Promise<User> => {
    const response = await fetch(`${BASE_URL}/user/${id}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch user ${id}`);
    }
    return response.json();
  };

  return {
    fetchFeed,
    fetchItemContent,
    fetchUser,
  };
};
