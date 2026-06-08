import { Story } from '../types/story';
import { PollResult } from '../types/poll-result';
import { User } from '../types/user';

const BASE_URL = 'https://node-hnapi.herokuapp.com';

export async function fetchFeed(
    feedType: string,
    page: number,
    signal?: AbortSignal
): Promise<Story[]> {
    const res = await fetch(`${BASE_URL}/${feedType}?page=${page}`, { signal });
    return res.json();
}

export async function fetchPollContent(
    id: number,
    signal?: AbortSignal
): Promise<PollResult> {
    const res = await fetch(`${BASE_URL}/item/${id}`, { signal });
    return res.json();
}

export async function fetchItemContent(
    id: number,
    signal?: AbortSignal
): Promise<Story> {
    const res = await fetch(`${BASE_URL}/item/${id}`, { signal });
    const story: Story = await res.json();
    if (story.type === 'poll' && story.poll) {
        const numberOfPollOptions = story.poll.length;
        const pollPromises = [];
        for (let i = 1; i <= numberOfPollOptions; i++) {
            pollPromises.push(fetchPollContent(story.id + i, signal));
        }
        story.poll = await Promise.all(pollPromises);
        story.poll_votes_count = story.poll.reduce((sum, p) => sum + p.points, 0);
    }
    return story;
}

export async function fetchUser(
    id: string,
    signal?: AbortSignal
): Promise<User> {
    const res = await fetch(`${BASE_URL}/user/${id}`, { signal });
    return res.json();
}
