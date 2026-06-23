import { Story } from '../types/story';
import { User } from '../types/user';
import { PollResult } from '../types/poll-result';

const BASE_URL = 'https://node-hnapi.herokuapp.com';

export async function fetchFeed(feedType: string, page: number): Promise<Story[]> {
    const res = await fetch(`${BASE_URL}/${feedType}?page=${page}`);
    if (!res.ok) throw new Error(`Failed to fetch ${feedType} feed`);
    return res.json();
}

export async function fetchItem(id: number): Promise<Story> {
    const res = await fetch(`${BASE_URL}/item/${id}`);
    if (!res.ok) throw new Error(`Failed to fetch item ${id}`);
    const story: Story = await res.json();

    if (story.type === 'poll' && story.poll) {
        const numberOfPollOptions = story.poll.length;
        story.poll_votes_count = 0;
        const pollPromises = Array.from({ length: numberOfPollOptions }, (_, i) =>
            fetchPollContent(story.id + i + 1)
        );
        const pollResults = await Promise.all(pollPromises);
        pollResults.forEach((result, i) => {
            story.poll[i] = result;
            story.poll_votes_count += result.points;
        });
    }

    return story;
}

async function fetchPollContent(id: number): Promise<PollResult> {
    const res = await fetch(`${BASE_URL}/item/${id}`);
    if (!res.ok) throw new Error(`Failed to fetch poll item ${id}`);
    return res.json();
}

export async function fetchUser(id: string): Promise<User> {
    const res = await fetch(`https://hacker-news.firebaseio.com/v0/user/${id}.json`);
    if (!res.ok) throw new Error(`Failed to fetch user ${id}`);
    const data = await res.json();
    if (!data) throw new Error(`User ${id} not found`);
    const createdDate = new Date(data.created * 1000);
    return {
        id: data.id,
        crated_time: data.created,
        created: createdDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
        karma: data.karma,
        avg: 0,
        about: data.about || '',
    };
}
