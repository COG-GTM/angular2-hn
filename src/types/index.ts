export type FeedType = 'news' | 'newest' | 'show' | 'ask' | 'jobs' | string;

export interface Comment {
    id: number;
    level?: number;
    user: string;
    time?: number;
    time_ago: string;
    content: string;
    deleted?: boolean;
    comments: Comment[];
}

export interface PollResult {
    id?: number;
    item?: number;
    points: number;
    content: string;
}

export interface Story {
    id: number;
    title: string;
    points: number | null;
    user: string | null;
    time?: number;
    time_ago: string;
    comments_count: number;
    type: string;
    poll?: PollResult[];
    poll_votes_count?: number;
    comments?: Comment[];
    url?: string;
    domain?: string;
    content?: string;
    deleted?: boolean;
    dead?: boolean;
}

export interface User {
    id: string;
    created: string;
    karma: number;
    about?: string;
}

export interface Settings {
    showSettings: boolean;
    openLinkInNewTab: boolean;
    theme: string;
    titleFontSize: string;
    listSpacing: string;
}
