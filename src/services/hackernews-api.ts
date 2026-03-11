import { Story } from '../types/story';
import { User } from '../types/user';
import { PollResult } from '../types/poll-result';

const BASE_URL = 'https://node-hnapi.herokuapp.com';

export async function fetchFeed(feedType: string, page: number): Promise<Story[]> {
    const res = await fetch(`${BASE_URL}/${feedType}?page=${page}`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return res.json();
}

export async function fetchItemContent(id: number): Promise<Story> {
    const res = await fetch(`${BASE_URL}/item/${id}`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const story: Story = await res.json();
    if (story.type === 'poll' && story.poll) {
        const numberOfPollOptions = story.poll.length;
        story.poll_votes_count = 0;
        const pollResults = await Promise.all(
            Array.from({ length: numberOfPollOptions }, (_, i) => fetchPollContent(story.id + i + 1))
        );
        pollResults.forEach((result, i) => {
            story.poll[i] = result;
            story.poll_votes_count += result.points;
        });
    }
    return story;
}

export async function fetchPollContent(id: number): Promise<PollResult> {
    const res = await fetch(`${BASE_URL}/item/${id}`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return res.json();
}

export async function fetchUser(id: string): Promise<User> {
    const res = await fetch(`${BASE_URL}/user/${id}`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return res.json();
}
