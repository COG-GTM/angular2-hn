import { Story } from '../models/story';
import { User } from '../models/user';
import { PollResult } from '../models/poll-result';

// node-hnapi-compatible HNPWA API. Serves the same JSON schema the original
// Angular app expected and (unlike the old Heroku host) still supports /user.
const BASE_URL = 'https://api.hnpwa.com/v0';

export async function fetchFeed(feedType: string, page: number): Promise<Story[]> {
  const res = await fetch(`${BASE_URL}/${feedType}/${page}.json`);
  if (!res.ok) throw new Error(`Failed to fetch ${feedType} feed`);
  return res.json();
}

export async function fetchItemContent(id: number): Promise<Story> {
  const res = await fetch(`${BASE_URL}/item/${id}.json`);
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

export async function fetchPollContent(id: number): Promise<PollResult> {
  const res = await fetch(`${BASE_URL}/item/${id}.json`);
  if (!res.ok) throw new Error(`Failed to fetch poll ${id}`);
  return res.json();
}

export async function fetchUser(id: string): Promise<User> {
  const res = await fetch(`${BASE_URL}/user/${id}.json`);
  if (!res.ok) throw new Error(`Failed to fetch user ${id}`);
  return res.json();
}
