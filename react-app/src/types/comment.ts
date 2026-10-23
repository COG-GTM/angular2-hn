export interface Comment {
    id: number;
    level: number;
    user: string;
    time: number;
    time_ago: string;
    /** HTML. Sanitize before rendering. */
    content: string;
    deleted?: boolean;
    dead?: boolean;
    comments: Comment[];
}
