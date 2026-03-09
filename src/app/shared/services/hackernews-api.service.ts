import { Story } from '../models/story';
import { User } from '../models/user';
import { PollResult } from '../models/poll-result';

const BASE_URL = 'https://node-hnapi.herokuapp.com';

export function fetchFeed(feedType: string, page: number, signal?: AbortSignal): Promise<Story[]> {
    return fetch(`${BASE_URL}/${feedType}?page=${page}`, { signal }).then((res) => res.json());
}

export async function fetchItemContent(id: number, signal?: AbortSignal): Promise<Story> {
    const story: Story = await fetch(`${BASE_URL}/item/${id}`, { signal }).then((res) => res.json());
    if (story.type === 'poll') {
        const numberOfPollOptions = story.poll.length;
        story.poll_votes_count = 0;
        const pollPromises = [];
        for (let i = 1; i <= numberOfPollOptions; i++) {
            pollPromises.push(
                fetchPollContent(story.id + i).then((pollResult) => {
                    story.poll[i - 1] = pollResult;
                    story.poll_votes_count += pollResult.points;
                })
            );
        }
        await Promise.all(pollPromises);
    }
    return story;
}

export function fetchPollContent(id: number, signal?: AbortSignal): Promise<PollResult> {
    return fetch(`${BASE_URL}/item/${id}`, { signal }).then((res) => res.json());
}

export function fetchUser(id: string, signal?: AbortSignal): Promise<User> {
    return fetch(`${BASE_URL}/user/${id}`, { signal }).then((res) => res.json());
}
