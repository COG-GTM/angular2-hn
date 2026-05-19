import type { Story, User, PollResult } from '../types';

const BASE_URL = 'https://node-hnapi.herokuapp.com';

export async function fetchFeed(feedType: string, page: number): Promise<Story[]> {
    const res = await fetch(`${BASE_URL}/${feedType}?page=${page}`);
    if (!res.ok) throw new Error(`Failed to fetch ${feedType}`);
    return res.json();
}

export async function fetchItemContent(id: number): Promise<Story> {
    const res = await fetch(`${BASE_URL}/item/${id}`);
    if (!res.ok) throw new Error(`Failed to fetch item ${id}`);
    const story: Story = await res.json();

    if (story.type === 'poll' && story.poll) {
        const numberOfPollOptions = story.poll.length;
        let pollVotesCount = 0;
        const pollResults: PollResult[] = [];

        for (let i = 1; i <= numberOfPollOptions; i++) {
            const pollResult = await fetchPollContent(story.id + i);
            pollResults.push(pollResult);
            pollVotesCount += pollResult.points;
        }

        story.poll = pollResults;
        story.poll_votes_count = pollVotesCount;
    }

    return story;
}

export async function fetchPollContent(id: number): Promise<PollResult> {
    const res = await fetch(`${BASE_URL}/item/${id}`);
    if (!res.ok) throw new Error(`Failed to fetch poll ${id}`);
    return res.json();
}

export async function fetchUser(id: string): Promise<User> {
    const res = await fetch(`https://hacker-news.firebaseio.com/v0/user/${id}.json`);
    if (!res.ok) throw new Error(`Failed to fetch user ${id}`);
    const data = await res.json();
    return {
        id: data.id,
        created_time: data.created,
        created: new Date(data.created * 1000).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        }),
        karma: data.karma,
        avg: 0,
        about: data.about ?? '',
    };
}
