import { useState, useEffect } from 'react';
import { Story } from '../models/story';
import { PollResult } from '../models/poll-result';

const BASE_URL = 'https://node-hnapi.herokuapp.com';

export function useItemDetails(id: number) {
    const [item, setItem] = useState<Story | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setItem(null);
        setError(null);
        const controller = new AbortController();

        fetch(`${BASE_URL}/item/${id}`, { signal: controller.signal })
            .then((res) => res.json())
            .then(async (story: Story) => {
                if (story.type === 'poll' && story.poll && story.poll.length > 0) {
                    const numberOfPollOptions = story.poll.length;
                    let pollVotesCount = 0;
                    const pollResults: PollResult[] = [];

                    for (let i = 1; i <= numberOfPollOptions; i++) {
                        try {
                            const pollRes = await fetch(`${BASE_URL}/item/${story.id + i}`, {
                                signal: controller.signal,
                            });
                            const pollData: PollResult = await pollRes.json();
                            pollResults.push(pollData);
                            pollVotesCount += pollData.points;
                        } catch {
                            // skip failed poll fetches
                        }
                    }

                    story.poll = pollResults;
                    story.poll_votes_count = pollVotesCount;
                }
                setItem(story);
            })
            .catch((err) => {
                if (err.name !== 'AbortError') {
                    setError('Could not load item comments.');
                }
            });

        return () => controller.abort();
    }, [id]);

    return { item, error };
}
