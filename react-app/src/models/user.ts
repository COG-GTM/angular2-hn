/**
 * User interface for Hacker News user profiles.
 * Based on the Angular app's user.ts model.
 */
export interface User {
  id: string;
  created_time: number;
  created: string;
  karma: number;
  avg: number;
  about: string;
}
