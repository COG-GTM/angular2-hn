import type { Comment } from './comment';
import type { ItemType } from './feedType';
import type { PollResult } from './pollResult';

export interface Story {
    id: number;
    title: string;
    points: number;
    user: string;
    time: number;
    /** e.g. "3 hours ago". Angular typed it `number`, but the API sends a string. */
    time_ago: string;
    type: ItemType;
    /** Absolute URL for links; HN-relative (`item?id=N`) for Ask/Show/text posts. */
    url: string;
    domain?: string;
    /** Comment tree on `/item/:id`; `[]` in feeds. */
    comments: Comment[];
    comments_count: number;
    /** Resolved by `fetchItemContent` when `type === 'poll'`. */
    poll?: PollResult[];
    /** Sum of `poll[].points`; can be 0, so guard divisions. */
    poll_votes_count?: number;
    /** HTML body of Ask HN / text posts. Sanitize before rendering. */
    content?: string;
    deleted?: boolean;
    dead?: boolean;
}
