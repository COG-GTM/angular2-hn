import { Story } from '../types/story';
import { User } from '../types/user';
import { PollResult } from '../types/poll-result';

const BASE_URL = 'https://node-hnapi.herokuapp.com';

export async function fetchFeed(feedType: string, page: number, signal?: AbortSignal): Promise<Story[]> {
    const res = await fetch(`${BASE_URL}/${feedType}?page=${page}`, { signal });
    return res.json();
}

export async function fetchItemContent(id: number, signal?: AbortSignal): Promise<Story> {
    const res = await fetch(`${BASE_URL}/item/${id}`, { signal });
    const story: Story = await res.json();

    if (story.type === 'poll' && story.poll) {
        const numberOfPollOptions = story.poll.length;
        story.poll_votes_count = 0;
        const pollPromises = [];
        for (let i = 1; i <= numberOfPollOptions; i++) {
            pollPromises.push(fetchPollContent(story.id + i, signal));
        }
        const pollResults = await Promise.all(pollPromises);
        pollResults.forEach((result, index) => {
            story.poll[index] = result;
            story.poll_votes_count += result.points;
        });
    }

    return story;
}

export async function fetchPollContent(id: number, signal?: AbortSignal): Promise<PollResult> {
    const res = await fetch(`${BASE_URL}/item/${id}`, { signal });
    return res.json();
}

export async function fetchUser(id: string, signal?: AbortSignal): Promise<User> {
    const res = await fetch(`${BASE_URL}/user/${id}`, { signal });
    return res.json();
}
