export interface Story {
    id: number;
    title: string;
    points: number;
    user: string;
    time: number;
    time_ago: string;
    comments_count: number;
    type: string;
    url: string;
    domain: string;
}

export interface Comment {
    id: number;
    user: string;
    time: number;
    time_ago: string;
    content: string;
    comments: Comment[];
    level: number;
}

export interface User {
    id: string;
    created: string;
    karma: number;
    about: string;
}

export type FeedType = 'news' | 'newest' | 'show' | 'ask' | 'jobs';
