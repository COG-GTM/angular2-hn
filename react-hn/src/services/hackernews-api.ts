import type { Story } from '../models/story';

const BASE_URL = 'https://node-hnapi.herokuapp.com';

export async function fetchFeed(feedType: string, page: number): Promise<Story[]> {
  const response = await fetch(`${BASE_URL}/${feedType}?page=${page}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${feedType} feed`);
  }
  return response.json();
}

export async function fetchItemContent(id: number): Promise<Story> {
  const response = await fetch(`${BASE_URL}/item/${id}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch item ${id}`);
  }
  return response.json();
}

export async function fetchUser(id: string) {
  const response = await fetch(`${BASE_URL}/user/${id}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch user ${id}`);
  }
  return response.json();
}
