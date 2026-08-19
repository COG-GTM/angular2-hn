import { PollResult } from '../react/models/poll-result';
import { Story } from '../react/models/story';
import { User } from '../react/models/user';

export const baseUrl = 'https://node-hnapi.herokuapp.com';

async function getJson<T>(url: string): Promise<T> {
    const response = await fetch(url);
    return (await response.json()) as T;
}

export function fetchFeed(feedType: string, page: number): Promise<Story[]> {
    return getJson<Story[]>(`${baseUrl}/${feedType}?page=${page}`);
}

export async function fetchItemContent(id: number): Promise<Story> {
    const story = await getJson<Story>(`${baseUrl}/item/${id}`);

    if (story.type === 'poll') {
        const pollResults = await Promise.allSettled(
            story.poll.map((_, index) => fetchPollContent(story.id + index + 1))
        );

        story.poll_votes_count = 0;
        pollResults.forEach((pollResult, index) => {
            if (pollResult.status === 'fulfilled') {
                story.poll[index] = pollResult.value;
                story.poll_votes_count += pollResult.value.points;
            }
        });
    }

    return story;
}

export function fetchPollContent(id: number): Promise<PollResult> {
    return getJson<PollResult>(`${baseUrl}/item/${id}`);
}

export function fetchUser(id: string): Promise<User> {
    return getJson<User>(`${baseUrl}/user/${id}`);
}
