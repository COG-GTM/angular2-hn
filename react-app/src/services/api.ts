/**
 * Hacker News API Service
 * Migrated from Angular HackerNewsAPIService
 * 
 * This module provides fetch utilities and API functions for the Hacker News API.
 * Replaces RxJS Observables with Promises for use with React Query.
 */

import type { Story, User, PollResult, FeedName } from '../types';

const BASE_URL = 'https://node-hnapi.herokuapp.com';

/**
 * Simple fetch wrapper that handles JSON parsing and errors
 * Replaces the Angular lazyFetch Observable wrapper
 */
async function fetchJSON<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, options);
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return response.json();
}

/**
 * Fetch a paginated feed of stories
 * @param feedType - Type of feed (news, newest, show, ask, jobs)
 * @param page - Page number (1-indexed)
 * @returns Promise resolving to array of stories
 */
export async function fetchFeed(feedType: FeedName, page: number): Promise<Story[]> {
  return fetchJSON<Story[]>(`${BASE_URL}/${feedType}?page=${page}`);
}

/**
 * Fetch poll option content
 * @param id - Poll option ID
 * @returns Promise resolving to poll result
 */
export async function fetchPollContent(id: number): Promise<PollResult> {
  return fetchJSON<PollResult>(`${BASE_URL}/item/${id}`);
}

/**
 * Fetch item content with comments
 * Handles poll items by fetching additional poll option data
 * @param id - Item ID
 * @returns Promise resolving to story with comments
 */
export async function fetchItemContent(id: number): Promise<Story> {
  const story = await fetchJSON<Story>(`${BASE_URL}/item/${id}`);
  
  if (story.type === 'poll' && story.poll && story.poll.length > 0) {
    const numberOfPollOptions = story.poll.length;
    story.poll_votes_count = 0;
    
    const pollPromises = Array.from({ length: numberOfPollOptions }, (_, i) =>
      fetchPollContent(story.id + i + 1)
    );
    
    const pollResults = await Promise.all(pollPromises);
    
    pollResults.forEach((pollResult, i) => {
      story.poll[i] = pollResult;
      story.poll_votes_count += pollResult.points;
    });
  }
  
  return story;
}

/**
 * Fetch user profile
 * @param id - User ID (username)
 * @returns Promise resolving to user data
 */
export async function fetchUser(id: string): Promise<User> {
  return fetchJSON<User>(`${BASE_URL}/user/${id}`);
}

/**
 * API object for convenient access to all API methods
 */
export const hackerNewsAPI = {
  fetchFeed,
  fetchItemContent,
  fetchPollContent,
  fetchUser,
  BASE_URL,
};

export default hackerNewsAPI;
