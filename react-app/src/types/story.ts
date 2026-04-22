import type { Comment } from './comment';
import type { FeedType } from './feedType';
import type { PollResult } from './pollResult';

export interface Story {
    id: number;
    title: string;
    points: number;
    user: string;
    time: number;
    time_ago: string;
    type: FeedType;
    url: string;
    domain: string;
    comments: Comment[];
    comments_count: number;
    content?: string;
    poll?: PollResult[];
    poll_votes_count?: number;
    deleted?: boolean;
    dead?: boolean;
}
