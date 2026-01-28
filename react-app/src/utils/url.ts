/**
 * URL validation and parsing utilities.
 * These functions replace Angular component logic for URL handling.
 */

/**
 * Checks if a URL is a valid HTTP/HTTPS URL.
 * This replicates the hasUrl getter from the Angular Item component.
 * @param url - URL string to validate
 * @returns True if the URL starts with http:// or https://
 */
export function hasUrl(url: string | undefined | null): boolean {
  if (!url) {
    return false;
  }
  return url.indexOf('http') === 0;
}

/**
 * Extracts the domain from a URL.
 * @param url - Full URL string
 * @returns Domain string or empty string if invalid
 */
export function extractDomain(url: string | undefined | null): string {
  if (!url) {
    return '';
  }
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch {
    return '';
  }
}

/**
 * Validates if a string is a valid URL.
 * @param url - URL string to validate
 * @returns True if the URL is valid
 */
export function isValidUrl(url: string | undefined | null): boolean {
  if (!url) {
    return false;
  }
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Generates a Hacker News item URL.
 * @param itemId - The item ID
 * @returns Full Hacker News URL for the item
 */
export function getHackerNewsItemUrl(itemId: number): string {
  return `https://news.ycombinator.com/item?id=${itemId}`;
}

/**
 * Generates a Hacker News user profile URL.
 * @param userId - The user ID/username
 * @returns Full Hacker News URL for the user profile
 */
export function getHackerNewsUserUrl(userId: string): string {
  return `https://news.ycombinator.com/user?id=${userId}`;
}
