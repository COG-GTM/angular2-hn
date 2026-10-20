/** Mirrors `src/app/shared/models/comment.ts`. `content` is HN HTML: render via `sanitizeHtml`. */
export interface Comment {
    id: number;
    level: number;
    user: string;
    time: number;
    time_ago: string;
    content: string;
    deleted?: boolean;
    dead?: boolean;
    comments: Comment[];
}
