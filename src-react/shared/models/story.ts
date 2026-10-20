import type { Comment } from './comment';
import type { ItemType } from './feed-type';
import type { PollResult } from './poll-result';

export interface Story {
    id: number;
    title: string;
    points: number | null;
    user: string | null;
    time: number;
    /** Pre-formatted by the API (e.g. "3 hours ago"). Angular typed it as number; it is a string. */
    time_ago: string;
    type: ItemType;
    url: string;
    domain?: string;
    /** HTML body of Ask/Show/job posts (item endpoint only). Sanitize before rendering. */
    content?: string;
    comments: Comment[];
    comments_count: number;
    /** Only for `type === 'poll'`, filled in by `fetchItemContent`. */
    poll?: PollResult[];
    poll_votes_count?: number;
    deleted?: boolean;
    dead?: boolean;
}
