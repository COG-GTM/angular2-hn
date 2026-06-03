import type { Comment } from './comment';
import type { ItemType } from './feedType';
import type { PollResult } from './pollResult';

export interface Story {
    id: number;
    title: string;
    points: number;
    user: string;
    time: number;
    time_ago: string;
    type: ItemType;
    url: string;
    domain: string;
    /** present on item detail responses */
    content?: string;
    text?: string;
    comments: Comment[];
    comments_count: number;
    poll: PollResult[];
    poll_votes_count: number;
    deleted: boolean;
    dead: boolean;
}
