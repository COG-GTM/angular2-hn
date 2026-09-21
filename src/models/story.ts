import type { Comment } from './comment';
import type { ItemType } from './feedType';
import type { PollResult } from './pollResult';

export interface Story {
    id: number;
    title: string;
    points: number;
    user: string;
    time: number;
    time_ago: number;
    type: ItemType;
    url: string;
    domain: string;
    comments: Comment[];
    comments_count: number;
    poll: PollResult[];
    poll_votes_count: number;
    deleted: boolean;
    dead: boolean;
    content?: string;
    text?: string;
}
