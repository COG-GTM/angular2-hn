import type { Comment } from './comment';
import type { ItemType } from './item-type';
import type { PollResult } from './poll-result';

/** Mirrors `src/app/shared/models/story.ts` (node-hnapi feed/item shape). */
export interface Story {
    id: number;
    title: string;
    points: number;
    user: string;
    time: number;
    /** Angular typed this as `number`; node-hnapi actually sends a string such as `"3 hours ago"`. */
    time_ago: string;
    type: ItemType;
    url: string;
    domain?: string;
    /** Comment tree; present on `/item/:id`, empty on feed entries. */
    comments: Comment[];
    comments_count: number;
    /** Poll options, resolved by `fetchItem` (Angular: `story.id + i` → `{ points, content }`). */
    poll?: PollResult[];
    poll_votes_count?: number;
    /** HTML body for Ask HN / text posts (node-hnapi `content`). Sanitize before rendering. */
    content?: string;
    deleted?: boolean;
    dead?: boolean;
}
