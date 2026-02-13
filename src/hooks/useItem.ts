import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { Story, PollResult } from './types';

const BASE_URL = 'https://node-hnapi.herokuapp.com';

async function fetchPollOption(id: number): Promise<PollResult> {
    const response = await fetch(`${BASE_URL}/item/${id}`);
    if (!response.ok) {
        throw new Error(`Failed to fetch poll option: ${response.statusText}`);
    }
    return response.json();
}

async function fetchItem(id: number): Promise<Story> {
    const response = await fetch(`${BASE_URL}/item/${id}`);
    if (!response.ok) {
        throw new Error(`Failed to fetch item: ${response.statusText}`);
    }
    const story: Story = await response.json();

    if (story.type === 'poll') {
        const numberOfPollOptions = story.poll.length;
        const pollPromises: Promise<PollResult>[] = [];
        for (let i = 1; i <= numberOfPollOptions; i++) {
            pollPromises.push(fetchPollOption(story.id + i));
        }
        const pollResults = await Promise.all(pollPromises);
        story.poll = pollResults;
        story.poll_votes_count = pollResults.reduce(
            (total, result) => total + result.points,
            0
        );
    }

    return story;
}

export function useItem(id: number): UseQueryResult<Story> {
    return useQuery({
        queryKey: ['item', id],
        queryFn: () => fetchItem(id),
        enabled: id > 0,
    });
}
