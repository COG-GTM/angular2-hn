export interface Comment {
    id: number;
    level: number;
    user: string;
    time: number;
    time_ago: string;
    content: string;
    comments: Comment[];
    deleted?: boolean;
    dead?: boolean;
}
