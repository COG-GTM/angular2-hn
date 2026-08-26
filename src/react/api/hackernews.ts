import { FeedName } from '../models/feed-name.type';
import { PollResult } from '../models/poll-result';
import { Story } from '../models/story';
import { User } from '../models/user';

const BASE_URL = 'https://node-hnapi.herokuapp.com';

async function getJson<T>(path: string): Promise<T> {
    const response = await fetch(`${BASE_URL}${path}`);

    if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
    }

    return response.json() as Promise<T>;
}

export function fetchFeed(feedName: FeedName, page: number): Promise<Story[]> {
    return getJson<Story[]>(`/${feedName}?page=${page}`);
}

export async function fetchItemContent(id: number): Promise<Story> {
    const story = await getJson<Story>(`/item/${id}`);

    if (story.type === 'poll') {
        story.poll_votes_count = 0;
        const pollResults = await Promise.all(
            story.poll.map((_, index) => fetchPollContent(story.id + index + 1))
        );

        pollResults.forEach((pollResult, index) => {
            story.poll[index] = pollResult;
            story.poll_votes_count += pollResult.points;
        });
    }

    return story;
}

export function fetchPollContent(id: number): Promise<PollResult> {
    return getJson<PollResult>(`/item/${id}`);
}

export function fetchUser(id: string): Promise<User> {
    return getJson<User>(`/user/${id}`);
}
