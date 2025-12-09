export interface Story {
    id: number;
    title: string;
    url?: string;
    points: number;
    user: string;
    time: number;
    time_ago: string;
    type: string;
    domain?: string;
    comments?: Comment[];
    comments_count: number;
    deleted?: boolean;
    dead?: boolean;
    content?: string;
}

export interface Comment {
    id: number;
    level: number;
    user: string;
    time: number;
    time_ago: string;
    content: string;
    deleted?: boolean;
    comments?: Comment[];
}

export interface User {
    id: string;
    created_time?: number;
    created: string;
    karma: number;
    avg?: number;
    about?: string;
}
