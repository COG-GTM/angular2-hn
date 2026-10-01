const MINUTE = 60;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

function phrase(n: number, unit: string, article: string): string {
  return n === 1 ? `${article} ${unit} ago` : `${n} ${unit}s ago`;
}

/**
 * Relative age in node-hnapi's `time_ago` format (moment.js `fromNow`
 * thresholds), e.g. "a few seconds ago", "an hour ago", "3 days ago".
 * @param time unix seconds
 * @param now epoch milliseconds
 */
export function timeAgo(time: number, now: number = Date.now()): string {
  const s = Math.max(0, Math.round(now / 1000 - time));
  const m = Math.round(s / MINUTE);
  const h = Math.round(s / HOUR);
  const d = Math.round(s / DAY);
  const mo = Math.round(s / (DAY * 30.436875));
  const y = Math.round(s / (DAY * 365.2425));

  if (s < 45) return 'a few seconds ago';
  if (s < 90) return phrase(1, 'minute', 'a');
  if (m < 45) return phrase(m, 'minute', 'a');
  if (m < 90) return phrase(1, 'hour', 'an');
  if (h < 22) return phrase(h, 'hour', 'an');
  if (h < 36) return phrase(1, 'day', 'a');
  if (d < 26) return phrase(d, 'day', 'a');
  if (d < 46) return phrase(1, 'month', 'a');
  if (d < 320) return phrase(mo, 'month', 'a');
  if (d < 548) return phrase(1, 'year', 'a');
  return phrase(y, 'year', 'a');
}
