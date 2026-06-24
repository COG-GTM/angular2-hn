import { Story } from '../models/Story';
import { User } from '../models/User';
import { PollResult } from '../models/PollResult';

const BASE_URL = 'https://node-hnapi.herokuapp.com';

export async function fetchFeed(feedType: string, page: number, signal?: AbortSignal): Promise<Story[]> {
    const res = await fetch(`${BASE_URL}/${feedType}?page=${page}`, { signal });
    if (!res.ok) throw new Error(`Failed to fetch ${feedType} feed`);
    return res.json();
}

export async function fetchPollContent(id: number, signal?: AbortSignal): Promise<PollResult> {
    const res = await fetch(`${BASE_URL}/item/${id}`, { signal });
    if (!res.ok) throw new Error(`Failed to fetch poll content ${id}`);
    return res.json();
}

export async function fetchItemContent(id: number, signal?: AbortSignal): Promise<Story> {
    const res = await fetch(`${BASE_URL}/item/${id}`, { signal });
    if (!res.ok) throw new Error(`Failed to fetch item ${id}`);
    const story: Story = await res.json();

    if (story.type === 'poll' && story.poll) {
        const numberOfPollOptions = story.poll.length;
        const pollResults = await Promise.all(
            Array.from({ length: numberOfPollOptions }, (_, i) =>
                fetchPollContent(story.id + i + 1, signal)
            )
        );
        story.poll = pollResults;
        story.poll_votes_count = pollResults.reduce((sum, p) => sum + p.points, 0);
    }

    return story;
}

export async function fetchUser(id: string, signal?: AbortSignal): Promise<User> {
    const res = await fetch(`${BASE_URL}/user/${id}`, { signal });
    if (!res.ok) throw new Error(`Failed to fetch user ${id}`);
    return res.json();
}
