/**
 * Maps feedType (used for API calls) to URL path segments.
 * 'news' feedType maps to 'news-feed' URL path (renamed from /news).
 */
export const feedTypeToPath: Record<string, string> = {
  news: 'news-feed',
  newest: 'newest',
  show: 'show',
  ask: 'ask',
  jobs: 'jobs',
};
