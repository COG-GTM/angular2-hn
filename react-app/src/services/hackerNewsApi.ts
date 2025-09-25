import { useQuery } from '@tanstack/react-query';
import { Story } from '../models/Story';
import { User } from '../models/User';

const BASE_URL = 'https://node-hnapi.herokuapp.com';

const fetchWithCancel = async <T>(url: string): Promise<T> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
};

export const useFeed = (feedType: string, page: number) => {
  return useQuery({
    queryKey: ['feed', feedType, page],
    queryFn: () => fetchWithCancel<Story[]>(`${BASE_URL}/${feedType}?page=${page}`),
    enabled: !!feedType && page > 0,
  });
};

export const useItem = (id: number) => {
  return useQuery({
    queryKey: ['item', id],
    queryFn: async () => {
      const story = await fetchWithCancel<Story>(`${BASE_URL}/item/${id}`);
      
      if (story.type === 'poll' && story.poll) {
        let pollVotesCount = 0;
        const pollPromises = story.poll.map(async (_, index) => {
          try {
            const pollResult = await fetchWithCancel<any>(`${BASE_URL}/item/${story.id + index + 1}`);
            pollVotesCount += pollResult.points || 0;
            return pollResult;
          } catch (error) {
            console.error(`Failed to fetch poll option ${index + 1}:`, error);
            return story.poll[index];
          }
        });
        
        const pollResults = await Promise.all(pollPromises);
        story.poll = pollResults as any;
        story.poll_votes_count = pollVotesCount;
      }
      
      return story;
    },
    enabled: !!id,
  });
};

export const useUser = (id: string) => {
  return useQuery({
    queryKey: ['user', id],
    queryFn: () => fetchWithCancel<User>(`${BASE_URL}/user/${id}`),
    enabled: !!id,
  });
};
