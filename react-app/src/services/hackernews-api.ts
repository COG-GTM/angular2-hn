import axios from 'axios';
import { Story, User, PollResult } from '../models';

const BASE_URL = 'https://node-hnapi.herokuapp.com';

export const hackerNewsApi = {
  fetchFeed: async (feedType: string, page: number): Promise<Story[]> => {
    const response = await axios.get<Story[]>(`${BASE_URL}/${feedType}?page=${page}`);
    return response.data;
  },

  fetchItemContent: async (id: number): Promise<Story> => {
    const response = await axios.get<Story>(`${BASE_URL}/item/${id}`);
    const story = response.data;
    
    if (story.type === 'poll' && story.poll) {
      const numberOfPollOptions = story.poll.length;
      story.poll_votes_count = 0;
      
      const pollPromises = [];
      for (let i = 1; i <= numberOfPollOptions; i++) {
        pollPromises.push(hackerNewsApi.fetchPollContent(story.id + i));
      }
      
      const pollResults = await Promise.all(pollPromises);
      pollResults.forEach((pollResult, index) => {
        story.poll[index] = pollResult;
        story.poll_votes_count += pollResult.points;
      });
    }
    
    return story;
  },

  fetchPollContent: async (id: number): Promise<PollResult> => {
    const response = await axios.get<PollResult>(`${BASE_URL}/item/${id}`);
    return response.data;
  },

  fetchUser: async (id: string): Promise<User> => {
    const response = await axios.get<User>(`${BASE_URL}/user/${id}`);
    return response.data;
  },
};
