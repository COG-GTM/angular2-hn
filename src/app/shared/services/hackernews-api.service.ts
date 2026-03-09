import { Story } from '../models/story';
import { User } from '../models/user';
import { PollResult } from '../models/poll-result';

const BASE_URL = 'https://node-hnapi.herokuapp.com';

function handleResponse<T>(res: Response): Promise<T> {
    if (!res.ok) {
        throw new Error(`HTTP error ${res.status}`);
    }
    return res.json();
}

export function fetchFeed(feedType: string, page: number, signal?: AbortSignal): Promise<Story[]> {
    return fetch(`${BASE_URL}/${feedType}?page=${page}`, { signal }).then((res) => handleResponse<Story[]>(res));
}

export async function fetchItemContent(id: number, signal?: AbortSignal): Promise<Story> {
    const story: Story = await fetch(`${BASE_URL}/item/${id}`, { signal }).then((res) =>
        handleResponse<Story>(res)
    );
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
    return fetch(`${BASE_URL}/item/${id}`, { signal }).then((res) => handleResponse<PollResult>(res));
}

export function fetchUser(id: string, signal?: AbortSignal): Promise<User> {
    return fetch(`${BASE_URL}/user/${id}`, { signal }).then((res) => handleResponse<User>(res));
}
