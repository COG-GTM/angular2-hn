/** Mirrors `src/app/shared/models/poll-result.ts`. `content` is HTML: render via `sanitizeHtml`. */
export interface PollResult {
    points: number;
    content: string;
}
