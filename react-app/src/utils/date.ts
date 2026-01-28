/**
 * Date/time formatting utilities.
 * These functions replace Angular pipes for date formatting.
 */

/**
 * Formats a Unix timestamp to a human-readable relative time string.
 * @param timestamp - Unix timestamp in seconds
 * @returns Relative time string (e.g., "2 hours ago", "3 days ago")
 */
export function formatTimeAgo(timestamp: number): string {
  const now = Date.now();
  const date = new Date(timestamp * 1000);
  const seconds = Math.floor((now - date.getTime()) / 1000);

  if (seconds < 60) {
    return seconds <= 1 ? 'just now' : `${seconds} seconds ago`;
  }

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return minutes === 1 ? '1 minute ago' : `${minutes} minutes ago`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return hours === 1 ? '1 hour ago' : `${hours} hours ago`;
  }

  const days = Math.floor(hours / 24);
  if (days < 30) {
    return days === 1 ? '1 day ago' : `${days} days ago`;
  }

  const months = Math.floor(days / 30);
  if (months < 12) {
    return months === 1 ? '1 month ago' : `${months} months ago`;
  }

  const years = Math.floor(months / 12);
  return years === 1 ? '1 year ago' : `${years} years ago`;
}

/**
 * Formats a Unix timestamp to a localized date string.
 * @param timestamp - Unix timestamp in seconds
 * @param locale - Locale string (default: 'en-US')
 * @returns Formatted date string
 */
export function formatDate(timestamp: number, locale: string = 'en-US'): string {
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Formats a Unix timestamp to a localized date and time string.
 * @param timestamp - Unix timestamp in seconds
 * @param locale - Locale string (default: 'en-US')
 * @returns Formatted date and time string
 */
export function formatDateTime(timestamp: number, locale: string = 'en-US'): string {
  const date = new Date(timestamp * 1000);
  return date.toLocaleString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
