export type FeedType = 'news' | 'newest' | 'show' | 'ask' | 'jobs';

export type ItemType = 'poll' | 'story' | 'job' | 'link' | 'ask' | 'comment';

export interface Comment {
    id: number;
    level: number;
    user: string;
    time: number;
    time_ago: string;
    content: string;
    deleted?: boolean;
    comments: Comment[];
}

export interface PollResult {
    points: number;
    content: string;
}

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
    deleted?: boolean;
    dead?: boolean;
}

export interface User {
    id: string;
    created_time: number;
    created: string;
    karma: number;
    avg: number | null;
    about: string;
}

export interface Settings {
    showSettings: boolean;
    openLinkInNewTab: boolean;
    theme: string;
    titleFontSize: string;
    listSpacing: string;
}
