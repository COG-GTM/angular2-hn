import type { Comment } from './comment';
import type { ItemType } from './feed-type';
import type { PollResult } from './poll-result';

export interface Story {
    id: number;
    title: string;
    points: number | null;
    user: string | null;
    time: number;
    time_ago: string;
    type: ItemType;
    url: string;
    domain?: string;
    content?: string;
    comments: Comment[];
    comments_count: number;
    poll?: PollResult[];
    poll_votes_count?: number;
    /** Set when at least one poll option request failed, so `poll_votes_count` is a lower bound. */
    poll_incomplete?: boolean;
    deleted?: boolean;
    dead?: boolean;
}
