import { Story, User } from '../types/story';

export const useHackerNewsAPI = () => {
    const baseUrl = 'https://node-hnapi.herokuapp.com';

    const fetchFeed = async (feedType: string, page: number): Promise<Story[]> => {
        const response = await fetch(`${baseUrl}/${feedType}?page=${page}`);
        if (!response.ok) throw new Error('Failed to fetch feed');
        return response.json();
    };

    const fetchItem = async (id: string): Promise<Story> => {
        const response = await fetch(`${baseUrl}/item/${id}`);
        if (!response.ok) throw new Error('Failed to fetch item');
        return response.json();
    };

    const fetchUser = async (id: string): Promise<User> => {
        const response = await fetch(`${baseUrl}/user/${id}`);
        if (!response.ok) throw new Error('Failed to fetch user');
        return response.json();
    };

    return { fetchFeed, fetchItem, fetchUser };
};
