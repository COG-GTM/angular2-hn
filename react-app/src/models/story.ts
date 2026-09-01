import type { Comment } from './comment';
import type { ItemType } from './feed-type.type';
import type { PollResult } from './poll-result';

export interface Story {
    id: number;
    title: string;
    points: number;
    user: string;
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
    deleted?: boolean;
    dead?: boolean;
}
