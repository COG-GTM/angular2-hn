import { useState, useEffect } from 'react';
import { Story, PollResult } from '../models';

const BASE_URL = 'https://node-hnapi.herokuapp.com';

export function useItemDetails(id: number | null) {
  const [item, setItem] = useState<Story | null>(null);
  const [loading, setLoading] = useState(!!id);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setItem(null);
      setLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;

    const fetchItem = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${BASE_URL}/item/${id}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const story: Story = await response.json();

        if (cancelled) return;

        if (story.type === 'poll' && story.poll && story.poll.length > 0) {
          const numberOfPollOptions = story.poll.length;
          let pollVotesCount = 0;
          const pollResults: PollResult[] = [];

          for (let i = 1; i <= numberOfPollOptions; i++) {
            try {
              const pollResponse = await fetch(`${BASE_URL}/item/${story.id + i}`);
              if (pollResponse.ok) {
                const pollResult: PollResult = await pollResponse.json();
                pollResults.push(pollResult);
                pollVotesCount += pollResult.points;
              }
            } catch {
              // Ignore poll fetch errors
            }
          }

          if (!cancelled) {
            story.poll = pollResults;
            story.poll_votes_count = pollVotesCount;
          }
        }

        if (!cancelled) {
          setItem(story);
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setError('Could not load item comments.');
          setLoading(false);
        }
      }
    };

    fetchItem();

    return () => {
      cancelled = true;
    };
  }, [id]);

  return { item, loading, error };
}
