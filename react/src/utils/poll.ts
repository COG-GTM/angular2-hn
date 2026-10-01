/** Poll bar width in percent, as in item-details `points / poll_votes_count * 100`. */
export function pollPercent(points: number, total: number | undefined): number {
  return total ? (points / total) * 100 : 0;
}
