import { Story } from '../models/Story';
import { User } from '../models/User';

const BASE_URL = 'https://node-hnapi.herokuapp.com';

export const hackerNewsApi = {
  fetchFeed: async (feedType: string, page: number): Promise<Story[]> => {
    const response = await fetch(`${BASE_URL}/${feedType}?page=${page}`);
    if (!response.ok) throw new Error('Failed to fetch feed');
    return response.json();
  },

  fetchItemContent: async (id: number): Promise<Story> => {
    const response = await fetch(`${BASE_URL}/item/${id}`);
    if (!response.ok) throw new Error('Failed to fetch item');
    return response.json();
  },

  fetchUser: async (id: string): Promise<User> => {
    const response = await fetch(`${BASE_URL}/user/${id}`);
    if (!response.ok) throw new Error('Failed to fetch user');
    return response.json();
  }
};
