/** `points / poll_votes_count * 100` as a CSS width (Angular's `[ngStyle]`); `0%` when there are no votes. */
export function pollBarWidth(points: number, votes: number | undefined): string {
    if (!votes || !Number.isFinite(points)) return '0%';
    return `${(points / votes) * 100}%`;
}
