import type { Story } from '../types/Story';
import type { PollResult } from '../types/PollResult';
import type { User } from '../types/User';

const BASE_URL = 'https://node-hnapi.herokuapp.com';

export async function fetchFeed(feedType: string, page: number): Promise<Story[]> {
  const res = await fetch(`${BASE_URL}/${feedType}?page=${page}`);
  return res.json();
}

export async function fetchItem(id: number): Promise<Story> {
  const res = await fetch(`${BASE_URL}/item/${id}`);
  return res.json();
}

export async function fetchPollContent(id: number): Promise<PollResult> {
  const res = await fetch(`${BASE_URL}/item/${id}`);
  return res.json();
}

export async function fetchUser(id: string): Promise<User> {
  const res = await fetch(`${BASE_URL}/user/${id}`);
  return res.json();
}
