import { Story, User, PollResult } from '../models';

export const BASE_URL = 'https://node-hnapi.herokuapp.com';

// Feed types used by routes: 'news' | 'newest' | 'show' | 'ask' | 'jobs'
// STUB (Task 0): real implementations land in the data-layer task.
export async function fetchFeed(
    _feedType: string,
    _page: number,
    _signal?: AbortSignal
): Promise<Story[]> {
    return [];
}

// fetchItem must reproduce poll aggregation: when story.type === 'poll', fetch each
// poll option (id+i for i=1..poll.length), assign into story.poll[i-1], and sum
// story.poll_votes_count from each option's points.
export async function fetchItem(_id: number, _signal?: AbortSignal): Promise<Story> {
    return null as unknown as Story;
}

export async function fetchPoll(_id: number, _signal?: AbortSignal): Promise<PollResult> {
    return null as unknown as PollResult;
}

export async function fetchUser(_id: string, _signal?: AbortSignal): Promise<User> {
    return null as unknown as User;
}
